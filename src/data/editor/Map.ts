
import { bezier } from "common"
import { clone } from "data/base/util"
import shamanObjectMetadata from "metadata/shamanObject"
import * as Base from "data/base"
import * as Editor from "data/editor"
import { eq } from "../base/util"


type Joint = Editor.Joint.Joint
type VC = Extract<Joint,{type: "VC"}>

export interface Map {
  mapSettings  : Editor.MapSettings.MapSettings
  platforms    : Editor.Platform.Platform[]
  decorations  : Editor.Decoration.Decoration[]
  shamanObjects: Editor.ShamanObject.ShamanObject[]
  joints       : Editor.Joint.Joint[]
  images       : Editor.Image.Image[]
}

function make(map: Base.Map.Map): Map {
  let { mapSettings, platforms, decorations, shamanObjects, joints } = map
  return {
    mapSettings,
    platforms: platforms.map(Editor.Platform.make),
    decorations: decorations.map(Editor.Decoration.make),
    shamanObjects: shamanObjects.map(Editor.ShamanObject.make),
    joints: joints.map(Editor.Joint.make),
    images: [
      ...mapSettings.backgroundImages.map(obj => Editor.Image.make(obj, false)),
      ...mapSettings.foregroundImages.map(obj => Editor.Image.make(obj, true)),
      ...mapSettings.disappearingImages.map(obj => Editor.Image.make(obj)),
    ],
  }
}






export function parse(str: string): Map {
  let map = make(Base.Map.parse(str))
  loadMedata(map)

  ;[map.platforms, map.joints] = decodeStickyPlatforms(map.platforms, map.joints)
  ;[map.platforms, map.joints] = decodeBoosterPlatforms(map.platforms, map.joints)
    map.joints                 = removeCurveSegments(map.joints)
    map.decorations            = decodeMouseSpawns(map.mapSettings.miceSpawn, map.decorations)

  return map
}




export function serialize(map: Map): string {
    map.mapSettings            = encodeImages(map.mapSettings, map.images)
    map.joints                 = encodeLines(map.platforms, map.joints)
    map.decorations            = encodeMouseSpawns(map.mapSettings.miceSpawn, map.decorations)
    map.shamanObjects          = encodeShamanObjects(map.shamanObjects)
  ;[map.platforms, map.joints] = encodeBoosterPlatforms(map.platforms, map.joints)
  ;[map.platforms, map.joints] = encodeStickyPlatforms(map.platforms, map.joints)

  saveMedata(map)
  return Base.Map.serialize(map)
}











function encodeImages(mapSettings: Editor.MapSettings.MapSettings, images: readonly Editor.Image.Image[]) {
  mapSettings.disappearingImages = []
  mapSettings.foregroundImages = []
  mapSettings.backgroundImages = []
  for(let image of images) {
    Editor.Image.isDisappearing(image)
      ? mapSettings.disappearingImages.push(image)
    : image.foreground
      ? mapSettings.foregroundImages.push(image)
      : mapSettings.backgroundImages.push(image)
  }
  return mapSettings
}






function encodeLines(platforms: readonly Editor.Platform.Platform[], joints: Editor.Joint.Joint[]) {
 joints = joints.flatMap(obj =>
    obj.type === "VC"
      ? generateCurveSegments(obj, platforms[obj.platform1], platforms[obj.platform2])
        .concat(obj)
      : obj)

 joints = joints.map(obj =>
    obj.type === "JD" && obj.point1.enabled && eq(obj.point1)(obj.point2)
      ? (_=>{ 
          let newObj = clone(obj)
          newObj.point2.y += 1
          return newObj
        })()
      : obj)
  return joints
}






/**
 * Maybe change `ShamanObject`'s type based on its `invisible` prop
 */
function encodeShamanObjects(shamanObjects: Editor.ShamanObject.ShamanObject[]): Editor.ShamanObject.ShamanObject[] {
  return shamanObjects.map(obj => {
    if(obj.invisible === undefined) return obj
    let metadata = shamanObjectMetadata.get(obj.type)
    if(!metadata.placeholderData) return obj
    if(obj.invisible) {
      if(!metadata.placeholder) {
        let newObj = clone(obj)
        newObj.type = metadata.placeholderData.invisibleId
        return newObj
      }
    }
    else if(metadata.placeholder) {
      let newObj = clone(obj)
      newObj.type = metadata.placeholderData.baseId
      return newObj
    }
    return obj
  })
}









function decodeMouseSpawns(miceSpawn: Editor.MapSettings.MapSettings["miceSpawn"] , decorations: Editor.Decoration.Decoration[]): Editor.Decoration.Decoration[] {
  if(miceSpawn.type === "multiple") {
    for(let {x,y} of miceSpawn.positions) {
      let mouseSpawn = Editor.Decoration.make(Editor.Decoration.defaults("DS"))
      mouseSpawn.x = x
      mouseSpawn.y = y
      decorations.push(mouseSpawn)
    }
  }
  else if(miceSpawn.type === "random") {
    let [x,y] = miceSpawn.axis === "x"
      ? [-30, miceSpawn.position]
      : [miceSpawn.position, -30]
    let mouseSpawn = Editor.Decoration.make(Editor.Decoration.defaults("DS"))
    mouseSpawn.x = x
    mouseSpawn.y = y
    decorations.push(mouseSpawn)
  }
  return decorations
}


function encodeMouseSpawns(miceSpawn: Editor.MapSettings.MapSettings["miceSpawn"] , decorations: Editor.Decoration.Decoration[]): Editor.Decoration.Decoration[] {
  let [spawns, rest] = 
    decorations.split(Editor.Decoration.isMouseSpawn)

  if(miceSpawn.type === "multiple") {
    miceSpawn.positions =
      spawns.map(({x,y})=>({x,y}))
    return rest
  }

  let spawn = spawns.pop()
  
  if(miceSpawn.type === "normal")
    return spawn
      ? rest.concat(spawn)
      : rest

  let {x,y} = spawn ? spawn : { x: 400, y: 200 }

  miceSpawn.position = 
    miceSpawn.axis === "x" ? y : x

  return rest
}










/**
 * *Removes joints*
 */
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

/**
 * *Adds joints*
 */
function encodeBoosterPlatforms(platforms: Editor.Platform.Platform[], joints: Editor.Joint.Joint[]) {
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
    joints.push(Editor.Joint.make(jp1))
    joints.push(Editor.Joint.make(jp2))

    platforms[k] = platform
  }

  return [platforms, joints] as const
}













/**
 * *Removes platforms, joints*
 */
function decodeStickyPlatforms(platforms: Editor.Platform.Platform[], joints: Editor.Joint.Joint[]) {
  
  function itLooksSticky(platform: Editor.Platform.Platform): platform is Extract<Editor.Platform.Platform,{dynamic:boolean}> {
    return "dynamic" in platform
        && platform.dynamic
        && platform.mass <= 0.0001
        && platform.fixedRotation
  }

  function removeJRs(index: number): boolean {
    let [jrs,rest] = joints.split(j => j.type === "JR" && 
                                      (j.platform1 === index || j.platform2 === index))
    joints = rest
    return jrs.length > 0
  }

  for(let k=0; k < platforms.length; k++) {
    let platform = platforms[k]
    if(!itLooksSticky(platform)) continue

    // Remove associated JR(s)
    // Abort if no JR was found for the first platform
    if(!removeJRs(k)) return [platforms, joints] as const

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
      removeJRs(i)
      platforms.splice(i, 1)
      i-- // to account for the splice
      count++
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

/**
 * *Adds platforms, joints*
 */
function encodeStickyPlatforms(platforms: Editor.Platform.Platform[], joints: Editor.Joint.Joint[]) {
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
      joints.push(Editor.Joint.make(jr))
    }
  }

  return [platforms, joints] as const
}












function removeCurveSegments(joints: Editor.Joint.Joint[]) {
  let filter: (_: Editor.Joint.Joint[]) => Editor.Joint.Joint[] = ([obj,...rest]) =>
    obj === undefined
      ? []
      : obj.type !== "VC"
          ? [obj, ...filter(rest)]
          : [obj, ...filter(
              rest.slice(1 + rest.findIndex(j => 
                (j.type === "JD" || j.type === "JPL") && 
                j.point1.enabled &&
                Math.abs(j.point1.x - obj.point1.x) <= 1 &&
                Math.abs(j.point1.y - obj.point1.y) <= 1 ))
            )]

  return filter(joints.reverse()).reverse()
}


function generateCurveSegments(vc: VC, p1: Editor.Platform.Platform, p2: Editor.Platform.Platform) {

  let linkedToPlatform 
    =  ((p1 && "dynamic" in p1) ? p1.dynamic : false)
    && ((p2 && "dynamic" in p2) ? p2.dynamic : false)

  /** Initialized with at least 2 points */
  let points =
    Array(vc.fineness+1).fill(0).map((_,k) =>
      bezier(
        k * (1/vc.fineness),
        vc.point1,
        vc.point2,
        vc.controlPoint1,
        vc.controlPoint2,
      ))

  let joints: Joint[] = []
  while(points.length >= 2) {
    let pp = linkedToPlatform
      ? points.slice(0,2)
      : points.slice(0,4)
    points = points.slice(pp.length-1)
    joints.push(
      pp.length === 2
        ? makeJD(pp, vc)
        : makeJPL(pp, vc))
  }
  
  return joints
}
const makeJD = (pp: Point[], vc: VC) =>
  ({
    ...Editor.Joint.make(Base.Joint.defaults("JD")),
    point1: { ...pp[0], enabled: true },
    point2: { ...pp[1], enabled: true },
    platform1: vc.platform1,
    platform2: vc.platform2,
    renderEnabled: true,
    color: vc.color,
    thickness: vc.thickness,
    opacity: vc.opacity,
    foreground: vc.foreground,
  })
const makeJPL = (pp: Point[], vc: VC) =>
  ({
    ...Editor.Joint.make(Base.Joint.defaults("JPL")),
    point1: { ...pp[0], enabled: true },
    point3: { ...pp[1] },
    point4: { ...pp[2] },
    point2: { ...(pp[3] || pp[1]), enabled: true },
    platform1: vc.platform1,
    platform2: vc.platform2,
    renderEnabled: true,
    color: vc.color,
    thickness: vc.thickness,
    opacity: vc.opacity,
    foreground: vc.foreground,
  })








export enum MedataFlag {  
  SELECTED = 1,
  HIDDEN   = 2,
  LOCKED   = 4,
  IGNORE   = 8,
}


function loadMedata(map: Map) {
  Object.entries(map.mapSettings.MEDATA.FLAGS.PLATFORM)
    .forEach(([index,flags]) => loadFlags(map.platforms[index as unknown as number], flags))

  Object.entries(map.mapSettings.MEDATA.FLAGS.DECORATION)
    .forEach(([index,flags]) => loadFlags(map.decorations[index as unknown as number], flags))

  Object.entries(map.mapSettings.MEDATA.FLAGS.SHAMANOBJECT)
    .forEach(([index,flags]) => loadFlags(map.shamanObjects[index as unknown as number], flags))

  Object.entries(map.mapSettings.MEDATA.FLAGS.JOINT)
    .forEach(([index,flags]) => loadFlags(map.joints[index as unknown as number], flags))

  Object.entries(map.mapSettings.MEDATA.FLAGS.IMAGE)
    .forEach(([index,flags]) => loadFlags(map.images[index as unknown as number], flags))

  /* Object.entries(map.mapSettings.MEDATA.IMAGE) */

  map.mapSettings.layers = map.mapSettings.MEDATA.LAYERS.list
  map.mapSettings.currentLayerId = map.mapSettings.MEDATA.LAYERS.current
  map.mapSettings.MEDATA.LAYERS.list.forEach(({indices, id}) => {
    for(let idx of indices) {
      if(!map.joints[idx]) continue
      map.joints[idx].layerId = id
    }
  })
}
function loadFlags(obj: Editor.Object, flags: number) {
  if(!obj) return
  if(flags & MedataFlag.IGNORE)
    obj.ignore = true
  if(flags & MedataFlag.HIDDEN)
    obj.visible = false
  if(flags & MedataFlag.LOCKED)
    obj.interactive = false
  if(flags & MedataFlag.SELECTED)
    obj.selected = true
}


function saveMedata(map: Map) {
  map.mapSettings.MEDATA = {
    FLAGS: {
      PLATFORM    : Object.fromEntries(map.platforms.map(saveFlags).entries()),
      DECORATION  : Object.fromEntries(map.decorations.map(saveFlags).entries()),
      SHAMANOBJECT: Object.fromEntries(map.shamanObjects.map(saveFlags).entries()),
      JOINT       : Object.fromEntries(map.joints.map(saveFlags).entries()),
      IMAGE       : Object.fromEntries(map.images.map(saveFlags).entries()),
    },
    LAYERS: {
      current: map.mapSettings.currentLayerId,
      list: map.mapSettings.layers.map((layer) => ({
        ...layer, 
        indices: map.joints
          .filter(obj => obj.layerId === layer.id)
          .map(obj => obj.index)
      })),
    },
    ANIMATIONS: []
  }
}
function saveFlags(obj: Editor.Object) {
  let flags = 0
  obj.ignore       && (flags += MedataFlag.IGNORE)
  !obj.visible     && (flags += MedataFlag.HIDDEN)
  !obj.interactive && (flags += MedataFlag.LOCKED)
  obj.selected     && (flags += MedataFlag.SELECTED)
  return flags
}