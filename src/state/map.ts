
import { writable, Writable, derived, get } from "svelte/store"


import * as Editor from "data/editor"
import * as Base from "data/base"
import shamanObjectMetadata from "metadata/shamanObject"


import * as sceneObjects from "state/sceneObjects"
import * as selection from "state/selection"
import * as util from "state/util"
import { store, persistentWritable } from "state/util"
import { clone } from "data/base/util"

import * as history from "state/history"

import { xml } from "state/xml"
import shamanObject from "@/metadata/shamanObject"


export const mapSettings = store(Editor.MapSettings.defaults())

setTimeout(() => {
  mapSettings.subscribe(history.invalidate)
  importXML(get(xml))
}, 50)

/*
  Loads map settings and all objects into memory.
  Platforms need to be added before joints.
*/
export function importXML(str: string) {
  let map = Editor.Map.parse(str)

  mapSettings.set(map.mapSettings)

  selection.clear()
  sceneObjects.clear()


  for(let image of map.mapSettings.backgroundImages)
    sceneObjects.add(Editor.Image.make(image, false))

  for(let image of map.mapSettings.foregroundImages)
    sceneObjects.add(Editor.Image.make(image, true))

  for(let image of map.mapSettings.disappearingImages)
    sceneObjects.add(Editor.Image.make(image))

  let platforms = map.platforms.map(Editor.Platform.make).map((p,i) => (p.index = i, p))
  let joints = map.joints.map(Editor.Joint.make)

  ;[platforms, joints] = decodeBoosterPlatforms(platforms, joints)
  ;[platforms, joints] = decodeStickyPlatforms(platforms, joints)

  for(let platform of platforms)
    sceneObjects.add(platform)

  for(let decoration of map.decorations)
    sceneObjects.add(Editor.Decoration.make(decoration))

  for(let shamanObject of map.shamanObjects)
    sceneObjects.add(Editor.ShamanObject.make(shamanObject))

  for(let joint of joints)
    sceneObjects.add(joint)


  if(mapSettings.miceSpawn.type === "multiple") {
    for(let {x,y} of mapSettings.miceSpawn.positions) {
      let mouseSpawn = Editor.Decoration.make(Editor.Decoration.defaults("DS"))
      mouseSpawn.x = x
      mouseSpawn.y = y
      sceneObjects.add(mouseSpawn)
    }
  }
  else if(mapSettings.miceSpawn.type === "random") {
    let [x,y] = mapSettings.miceSpawn.axis === "x"
      ? [-30, mapSettings.miceSpawn.position]
      : [mapSettings.miceSpawn.position, -30]
    let mouseSpawn = Editor.Decoration.make(Editor.Decoration.defaults("DS"))
    mouseSpawn.x = x
    mouseSpawn.y = y
    sceneObjects.add(mouseSpawn)
  }
}

export function exportXML(update=true) {

  mapSettings.disappearingImages = []
  mapSettings.foregroundImages = []
  mapSettings.backgroundImages = []
  for(let image of sceneObjects.groups.images) {
    Editor.Image.isDisappearing(image)
      ? mapSettings.disappearingImages.push(image)
    : image.foreground
      ? mapSettings.foregroundImages.push(image)
      : mapSettings.backgroundImages.push(image)
  }

  let decorations = handleMouseSpawns([...sceneObjects.groups.decorations])

  let shamanObjects = encodeShamanObjects([...sceneObjects.groups.shamanObjects])

  let platforms = [...sceneObjects.groups.platforms] as Editor.Platform.Platform[]
  let joints = [...sceneObjects.groups.joints] as Base.Joint.Joint[]
  ;[platforms, joints] = encodeBoosterPlatforms(platforms, joints)
  ;[platforms, joints] = encodeStickyPlatforms(platforms, joints)

  let map: Editor.Map.Map = {
    mapSettings,
    platforms,
    decorations,
    shamanObjects,
    joints,
  }

  let result = Editor.Map.serialize(map)
  if(update) xml.set(result)
  return result
}


function encodeStickyPlatforms(platforms: Editor.Platform.Platform[], joints: Base.Joint.Joint[]) {
  let length = platforms.length
  for(let k=0; k < length; k++) {
    let platform = platforms[k]
    if(!("sticky" in platform) || !platform.sticky.enabled) continue

    for(let i=0; i < platform.sticky.power; i++) {
      let p = clone(platform)
      p.fixedRotation = true
      p.miceCollision = true
      //p.objectCollision = false
      p.dynamic = true
      p.mass = 1e-9
      if(i === 0) {
        platforms[k] = p
      }
      else {
        p.invisible = true
        p.index = platforms.length
        platforms.push(p)
      }

      let jr = Editor.Joint.defaults("JR")
      jr.platform1 = p.index
      jr.platform2 = platforms.findIndex(Editor.Platform.isStatic)
      joints.push(jr)
    }
  }

  return [platforms, joints] as const
}


function decodeStickyPlatforms(platforms: Editor.Platform.Platform[], joints: Editor.Joint.Joint[]) {
  
  function itLooksSticky(platform: Editor.Platform.Platform): platform is Extract<Editor.Platform.Platform,{dynamic:boolean}> {
    return "dynamic" in platform
        && platform.dynamic
        && platform.mass <= 0.0001
        && platform.fixedRotation
  }

  function removeJRs(index: number) {
    let [jrs,rest] = joints.split(j => j.type === "JR" && 
                                      (j.platform1 === index || j.platform2 === index))
    joints = rest
  }

  for(let k=0; k < platforms.length; k++) {
    let platform = platforms[k]
    if(!itLooksSticky(platform)) continue

    // Remove associated JR(s)
    removeJRs(platform.index)

    // Find and remove the other platforms (if power > 1)
    let count = 0
    for(let i=k+1; i < platforms.length; i++) {
      let p = platforms[i]
      if(!itLooksSticky(p)) continue
      if(p.mass != platform.mass) continue
      if(p.x != platform.x) continue
      if(p.y != platform.y) continue
      if(p.rotation != platform.rotation) continue
      if("width" in p && "width" in platform && p.width != platform.width) continue
      if("height" in p && "height" in platform && p.height != platform.height) continue
      if("radius" in p && "radius" in platform && p.radius != platform.radius) continue
      platforms.splice(i, 1)
      removeJRs(p.index)
      count++
      i--
    }
    
    // Reset some properties
    platform.dynamic = false
    platform.mass = 0
    platform.fixedRotation = false
    platform.sticky.enabled = true
    platform.sticky.power = 1 + count
  }
  return [platforms, joints] as const
}


function encodeBoosterPlatforms(platforms: Editor.Platform.Platform[], joints: Base.Joint.Joint[]) {
  for(let k=0; k < platforms.length; k++) {
    let _platform = platforms[k]
    if(!("booster" in _platform) || !_platform.booster.enabled) continue

    let platform = clone(_platform)

    // Ensure a few properties
    platform.dynamic = true
    platform.fixedRotation = false
    platform.linearDamping = platform.angularDamping = 0
    
    let targetPlatformAngle = platform.rotation
    platform.rotation = targetPlatformAngle - platform.booster.angle
    let boosterAngle = -targetPlatformAngle

    // Create 2 prismatic joints
    let jp1 = Editor.Joint.defaults("JP") 
    let jp2 = Editor.Joint.defaults("JP") 
    jp1.platform1 = jp2.platform1 = platform.index
    jp1.platform2 = jp2.platform2 = platforms.findIndex(Editor.Platform.isStatic)
    jp1.angle = jp2.angle = boosterAngle
    jp1.axis = { x: -1, y: 0 }
    jp1.power = Infinity
    jp1.speed = platform.booster.speed
    jp2.axis = { x: 0, y: 1 }
    joints.push(jp1)
    joints.push(jp2)

    platforms[k] = platform
  }

  return [platforms, joints] as const
}

function decodeBoosterPlatforms(platforms: Editor.Platform.Platform[], joints: Editor.Joint.Joint[]) {
  let jointIdx = 0
  while(jointIdx < joints.length-1) {
    let [jp1,jp2] = [joints[jointIdx], joints[jointIdx+1]]

    if( jp1.type === "JP" && jp2.type === "JP" &&
        jp1.platform1 === jp2.platform1 && 
        jp1.platform2 === jp2.platform2 &&
        jp1.axis.x === -1 && jp2.axis.y === 1
    ) {
      let platform = platforms[jp1.platform1]
      if(platform && "booster" in platform) {

        platform.dynamic = false

        platform.booster.enabled = true
        platform.booster.speed = jp1.speed

        let platformAngle = platform.rotation
        platform.rotation = -jp1.angle
        platform.booster.angle = -jp1.angle - platformAngle

      } else { 
        console.log(platform, jp1, jp2)
        throw "decodeBoosterPlatforms: platform cannot be booster"
      }

      joints.splice(jointIdx, 2)
      continue
    }

    jointIdx++
  }
  
  return [platforms, joints] as const
}


function handleMouseSpawns(decorations: Editor.Decoration.Decoration[]): Editor.Decoration.Decoration[] {
  let [spawns, rest] = 
    decorations.split(Editor.Decoration.isMouseSpawn)

  if(mapSettings.miceSpawn.type === "multiple") {
    mapSettings.miceSpawn.positions =
      spawns.map(({x,y})=>({x,y}))
    return rest
  }

  let spawn = spawns.pop()
  
  if(mapSettings.miceSpawn.type === "normal")
    return spawn
      ? rest.concat(spawn)
      : rest

  let {x,y} = spawn ? spawn : { x: 400, y: 200 }

  mapSettings.miceSpawn.position = 
    mapSettings.miceSpawn.axis === "x" ? y : x

  return rest
}


export function updateMiceSpawn(type: "normal"|"multiple"|"randomX"|"randomY") {

  if(type === "randomX" || type === "randomY") {
    mapSettings.miceSpawn = Editor.MapSettings.miceSpawnDefaults("random") as Extract<Editor.MapSettings.MapSettings["miceSpawn"],{type:"random"}>
    mapSettings.miceSpawn.axis = type === "randomX" ? "x" : "y"
  }
  else mapSettings.miceSpawn = Editor.MapSettings.miceSpawnDefaults(type)

  if(type !== "multiple") {
    let spawn
    for(let obj of [...sceneObjects.groups.decorations].reverse())
      if(Editor.Decoration.isMouseSpawn(obj)) {
        spawn = obj
        sceneObjects.remove(obj)
      }
    if(spawn) sceneObjects.add(clone(spawn))
    if(type.startsWith("random")) {
      if(!spawn) {
        spawn = Editor.Decoration.make(Editor.Decoration.defaults("DS"))
        spawn.x = -30
        spawn.y = 200
        spawn = sceneObjects.add(spawn)
      }
    }
  }
  
  mapSettings.invalidate()
}


function encodeShamanObjects(shamanObjects: Editor.ShamanObject.ShamanObject[]): Editor.ShamanObject.ShamanObject[] {
  return shamanObjects.map(obj => {
    if(obj.invisible === undefined) return obj
    let metadata = shamanObjectMetadata.get(obj.type)
    if(!metadata.placeholderData) return obj
    if(obj.invisible) {
      if(!metadata.placeholder) {
        let _obj = clone(obj)
        _obj.type = metadata.placeholderData.invisibleId
        return _obj
      }
    }
    else if(metadata.placeholder) {
      let _obj = clone(obj)
      _obj.type = metadata.placeholderData.baseId
      return _obj
    }
    return obj
  })
}