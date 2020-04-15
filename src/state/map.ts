
import { writable, Writable, derived, get } from "svelte/store"


import * as Editor from "data/editor"


import * as sceneObjects from "state/sceneObjects"
import * as selection from "state/selection"
import * as util from "state/util"
import { store, persistentWritable } from "state/util"
import { clone } from "data/base/util"

import * as history from "state/history"

import { xml } from "state/xml"


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


  let [platforms, joints] = decodeBoosterPlatforms(
    map.platforms.map(Editor.Platform.make),
    map.joints.map(Editor.Joint.make)
  )

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

  let [platforms, joints] = encodeBoosterPlatforms([...sceneObjects.groups.platforms], [...sceneObjects.groups.joints])

  let map: Editor.Map.Map = {
    mapSettings,
    platforms,
    decorations,
    shamanObjects: sceneObjects.groups.shamanObjects,
    joints,
  }

  let result = Editor.Map.serialize(map)
  if(update) xml.set(result)
  return result
}

function decodeBoosterPlatforms(platforms: Editor.Platform.Platform[], joints: Editor.Joint.Joint[]) {
  let jointIdx = 0
  while(jointIdx < joints.length-1) {
    let [j1,j2] = [joints[jointIdx], joints[jointIdx+1]]

    if( j1.type === "JP" && j2.type === "JP" &&
        j1.platform1 === j2.platform1 && 
        j1.platform2 === j2.platform2 &&
        j1.axis.x === -1 && j2.axis.y === 1
    ) {
      let platform = platforms[j1.platform1]
      if(platform && "booster" in platform) {

        platform.booster.enabled = true
        platform.booster.speed = j1.speed

        let platformAngle = platform.rotation
        platform.rotation = -j1.angle
        platform.booster.angle = -j1.angle - platformAngle

      } else { 
        console.log(platform, j1, j2)
        throw "decodeBoosterPlatforms: platform cannot be booster"
      }

      joints.splice(jointIdx, 2)
      continue
    }

    jointIdx++
  }
  
  return [platforms, joints] as const
}

function encodeBoosterPlatforms(platforms: Editor.Platform.Platform[], joints: Editor.Joint.Joint[]) {
  for(let k=0; k < platforms.length; k++) {
    let platform = clone(platforms[k])
    if(!("booster" in platform) || !platform.booster.enabled) continue

    // Ensure a few properties
    platform.dynamic = true
    platform.fixedRotation = false
    platform.mass = 0
    platform.linearDamping = platform.angularDamping = 0
    
    let targetPlatformAngle = platform.rotation
    platform.rotation = targetPlatformAngle - platform.booster.angle
    let boosterAngle = -targetPlatformAngle

    // Create 2 prismatic joints
    let j1 = Editor.Joint.defaults("JP") as Extract<Editor.Joint.Joint,{type: "JP"}>
    let j2 = Editor.Joint.defaults("JP") as Extract<Editor.Joint.Joint,{type: "JP"}>
    j1.platform1 = j2.platform1 = platform.index
    j1.platform2 = j2.platform2 = platforms.findIndex(Editor.Platform.isStatic)
    j1.angle = j2.angle = boosterAngle
    j1.axis = { x: -1, y: 0 }
    j1.power = Infinity
    j1.speed = platform.booster.speed
    j2.axis = { x: 0, y: 1 }
    joints.push(j1)
    joints.push(j2)

    platforms[k] = platform
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
