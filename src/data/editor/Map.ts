
import { bezier } from "common"
import { clone } from "data/base/util"
import shamanObjectMetadata from "metadata/shamanObject"
import * as Base from "data/base"
import * as Editor from "data/editor"
import { eq } from "../base/util"
import { isDefilanteObject } from "./ShamanObject"


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
  ;[map.platforms, map.joints] = decodeSpinPlatforms(map.platforms, map.joints)
  ;[map.platforms, map.joints] = decodeBoosterPlatforms(map.platforms, map.joints)
    map.joints                 = removeCurveSegments(map.joints)
    map.decorations            = decodeMouseSpawns(map.mapSettings.miceSpawn, map.decorations)
    map.joints                 = decodeAnimations(map.mapSettings, map.platforms, map.joints)

  return map
}




export function serialize(map: Map): string {
    map.mapSettings            = encodeImages(map.mapSettings, map.images)
    map.decorations            = encodeMouseSpawns(map.mapSettings.miceSpawn, map.decorations)
    map.shamanObjects          = encodeShamanObjects(map.shamanObjects)
    if(map.mapSettings.defilante.enabled) {
      // Defilante doesn't work if all booster items are above index 40.
      // So put them first, since their z-index has no incidence anyway.
      map.shamanObjects =   [
        ...map.shamanObjects.filter(obj => isDefilanteObject(obj)),
        ...map.shamanObjects.filter(obj => !isDefilanteObject(obj)),
       ]
    }
  ;[map.platforms, map.joints] = encodeBoosterPlatforms(map.platforms, map.joints)
  ;[map.platforms, map.joints] = encodeSpinPlatforms(map.platforms, map.joints)
  ;[map.platforms, map.joints] = encodeStickyPlatforms(map.platforms, map.joints)
  ;[map.platforms, map.joints] = encodeAnimations(map.mapSettings, map.platforms, map.joints)
    map.joints                 = encodeLines(map.platforms, map.joints)

  saveMedata(map)
  return Base.Map.serialize(map)
}







const animationDrawingOffset = 2000

function decodeAnimations(mapSettings: Editor.MapSettings.MapSettings, platforms: Editor.Platform.Platform[], joints: Editor.Joint.Joint[]) {
  for(let animation of mapSettings.animations) {
    if(animation.frames.length < 2) continue
    for(let frame of animation.frames) {
      joints = joints.map(obj => {
        if(obj.layerId !== frame.layerId) return obj
        Editor.Joint.move(obj, 0, animationDrawingOffset)
        obj.platform1 = 0
        obj.platform2 = 0
        return obj
      })
      if(frame.platform !== null) {
        let p = platforms[frame.platform]
        // set mode (frame)
        p.y += animationDrawingOffset
      }
    }
  }
  return joints
}

/**
 * *Adds platforms, joints*
 */
function encodeAnimations(mapSettings: Editor.MapSettings.MapSettings, platforms: Editor.Platform.Platform[], joints: Editor.Joint.Joint[]) {
  let layers = mapSettings.layers
  let animations = mapSettings.animations
  if(!animations.length) return [platforms, joints] as const

  let staticPlatformIdx = platforms.findIndex(Editor.Platform.isStatic)
  if(staticPlatformIdx < 0) {
    throw "encodeAnimations: No static platform was found..."
  }

  function makeDynamicRectangle() {
    let p = 
      <Extract<Editor.Platform.Platform, Editor.Platform.NonStatic&Editor.Platform.Rectangle&Editor.Platform.Colored>>
      Editor.Platform.make(Editor.Platform.defaults(Editor.Platform.Type.Rectangle)) 
    
    p.dynamic = true
    p.fixedRotation = true
    p.ignore = true
    p.miceCollision = false
    p.objectCollision = false
    p.friction = 0
    p.restitution = 0
    //p.invisible = true
    return p
  }
  function makeDynamicCircle() {
    let p = 
      <Extract<Editor.Platform.Platform, Editor.Platform.NonStatic&Editor.Platform.Circle&Editor.Platform.Colored>>
      Editor.Platform.make(Editor.Platform.defaults(Editor.Platform.Type.Circle)) 
    
    p.dynamic = true
    p.fixedRotation = true
    p.ignore = true
    p.miceCollision = false
    p.objectCollision = false
    p.friction = 0
    p.restitution = 0
    //p.invisible = true
    return p
  }

  const makeJoint = <T extends Editor.Joint.Type> (type: T) => {
    let j = Editor.Joint.make(Editor.Joint.defaults(type))
    j.ignore = true
    return <Extract<Editor.Joint.Joint,{type:T}>> j
  }

  /**
   * 
   * @param r0 Radius of the mechanism circle; the buttons will be tangential to this circle
   * @param y How many pixels should the activator "stick out" of the circle
   * @param t How much of the circumference of the circle should the activator cover
   * @returns Radius and position of the activator
   */
  function getActivatorRadiusAndOffset(r0: number, y: number, t: number) {
    let a = 1 - Math.cos(t*Math.PI)
    let r1 = ( 2*r0*r0*a + 2*r0*y*a + y*y ) / ( 2*r0*a + 2*y )
    let c1 = r0 - r1 + y
    return { r1, c1 }
  }

  function appendPlatform(p: Editor.Platform.Platform) {
    return platforms.push(p) - 1
  }

  function isFrameEmpty(frame: Editor.MapSettings.Frame) {
    let hasJoints = !!joints.find(obj => obj.layerId === frame.layerId)
    return !hasJoints && frame.platform === null
  }


  for(let [animationIdx,animation] of animations.entries()) {

    function getFrameIndex(frame: Editor.MapSettings.Frame) {
      return layers.findIndex(layer => layer.id === frame.layerId)
    }
    let frames = animation.frames.sort((a,b) => getFrameIndex(a) - getFrameIndex(b))
    if(frames.length < 2) continue
    
    let location = {
      x: -240 + 300*animationIdx,
      y: 160,
    }
    let radius = 100

    let totalDuration = frames.reduce((ms, frame) => ms + frame.duration, 0)


    let frameData = frames
      .map((frame, frameIdx) => [frame, frameIdx] as const)
      .filter(([frame,_]) => !isFrameEmpty(frame))
      .map(([frame, frameIdx]) => {

        let button = makeDynamicRectangle()
        button.mass = 1e9
        button.miceCollision = true
        button.objectCollision = true
        button.width = 20
        button.height = 20
        button.x = location.x
        button.y = location.y + radius + button.height/2
        Editor.rotateAround(button, (frameIdx/frames.length)*360, location)
        button.color = "ff0000"

        let teleporterIdx
        if(frame.platform !== null) {
          teleporterIdx = frame.platform
          let teleporter = clone(platforms[frame.platform])
          teleporter.y -= animationDrawingOffset
          platforms[frame.platform] = teleporter
        }
        else {
          let teleporter = makeDynamicRectangle()
          teleporter.mass = 1000
          teleporter.color = "00ff00"
          teleporterIdx = appendPlatform(teleporter)
        }

        return {
          frame, 
          teleporterIdx,
          buttonIdx: appendPlatform(button), 
        }
      })
    

    let mover = makeDynamicRectangle()
    mover.mass = 1e9
    mover.color = "0000ff"
    let moverIdx = appendPlatform(mover)
  

    for(let {frame, buttonIdx, teleporterIdx} of frameData) {
      for(let [p1,p2] of [
        [staticPlatformIdx, buttonIdx],
        [teleporterIdx, moverIdx],
        [buttonIdx, teleporterIdx],
      ]) {
        let jr = makeJoint("JR")
        jr.platform1 = p1
        jr.platform2 = p2
        joints.push(jr)
      }

      // Link drawing to teleporter
      joints = joints.map(obj => {
        if(obj.layerId !== frame.layerId) return obj
        obj = clone(obj)
        obj.platform1 = teleporterIdx
        obj.platform2 = teleporterIdx
        Editor.Joint.move(obj, 0, -animationDrawingOffset)
        return obj
      })
    }

    // Mover joint
    let jp = makeJoint("JP")
    jp.platform1 = staticPlatformIdx
    jp.platform2 = moverIdx
    jp.axis = { x: 0, y: 1 }
    jp.power = Infinity
    jp.speed = -1e5
    jp.min = animationDrawingOffset
    joints.push(jp)

    // Activator mechanism
    let activator = makeDynamicCircle()
    activator.mass = 0
    activator.objectCollision = true
    activator.fixedRotation = false
    activator.color = "ffffff"
    activator.x = location.x
    let { r1, c1 } = getActivatorRadiusAndOffset(radius, 1, 1/(frames.length))
    activator.y = location.y + c1
    activator.radius = r1
    let activatorIdx = appendPlatform(activator)

    let jr = makeJoint("JR")
    jr.platform1 = staticPlatformIdx
    jr.platform2 = activatorIdx
    jr.point1 = {
      enabled: true,
      x: location.x,
      y: location.y,
    }
    jr.power = Infinity
    jr.speed = 360 / (totalDuration/1000)
    joints.push(jr)

  }
  
  return [platforms, joints] as const
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

  const isPointsEqual = (p1: Point, p2: Point) =>
    Math.floor(p1.x) == Math.floor(p2.x) &&
    Math.floor(p1.y) == Math.floor(p2.y)

  joints = joints.map(obj =>
    obj.type === "JD" && obj.point1.enabled && isPointsEqual(obj.point1, obj.point2)
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
    ? [miceSpawn.position, -30]
    : [-30, miceSpawn.position]
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
    miceSpawn.axis === "x" ? x : y

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
 * *Removes joints*
 */
 function decodeSpinPlatforms(platforms: Editor.Platform.Platform[], joints: Editor.Joint.Joint[]) {
  let jointIdx = 0
  while(jointIdx < joints.length) {
    let jr = joints[jointIdx]

    let platform = platforms[jr.platform2]
    if( jr.type === "JR" && 
        platform && 
        "spin" in platform &&
        platform.mass == 987654
    ) {
      platform.dynamic = false

      platform.spin.enabled = true
      platform.spin.speed = jr.speed

      joints.splice(jointIdx, 1)
      continue
    }

    jointIdx++
  }
  
  return [platforms, joints] as const
}

/**
 * *Adds joints*
 */
function encodeSpinPlatforms(platforms: Editor.Platform.Platform[], joints: Editor.Joint.Joint[]) {
  for(let k=0; k < platforms.length; k++) {
    let _platform = platforms[k]
    if(!("spin" in _platform) || !_platform.spin.enabled) continue

    let platform = clone(_platform)

    // Ensure a few properties
    platform.dynamic = true
    platform.fixedRotation = false
    platform.linearDamping = platform.angularDamping = 0
    platform.mass = 987654

    // Create a rotation joint
    let jr = Editor.Joint.defaults("JR")
    jr.platform1 = platforms.findIndex(Editor.Platform.isStatic)
    jr.platform2 = platform.index
    jr.power = Infinity
    jr.speed = platform.spin.speed
    joints.push(Editor.Joint.make(jr))

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
        && platform.mass > 0 && platform.mass <= 0.00001
        && platform.fixedRotation
  }

  function removeJRs(index: number): boolean {
    let [jrs,rest] = joints.split(j => j.type === "JR" && 
                                      (j.platform1 === index || j.platform2 === index))
    joints = rest
    return jrs.length > 0
  }

  let platformsToBeRemoved = [] as Editor.Platform.Platform[]

  for(let k=0; k < platforms.length; k++) {
    let platform = platforms[k]

    if(platformsToBeRemoved.includes(platform)) continue
    if(!itLooksSticky(platform)) continue

    // Make sure it's really a sticky ground
    {
      let jrs = joints.filter(j => j.type === "JR" && (j.platform1 === k || j.platform2 === k))
      if(jrs.length !== 1) continue
      let otherIndex = jrs[0].platform1 === k ? jrs[0].platform2 : jrs[0].platform1
      if(otherIndex === k) continue
      let otherPlatform = platforms[otherIndex]
      if("dynamic" in otherPlatform && otherPlatform.dynamic === true)
        continue
    }

    removeJRs(k)

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
      platformsToBeRemoved.push(p)
      count++
    }
    
    // Reset some properties
    platform.dynamic = false
    platform.mass = 0
    platform.fixedRotation = false
    platform.sticky.enabled = true
    platform.sticky.power = 1 + count
  }
  
  platforms = platforms.filter(p => !platformsToBeRemoved.includes(p))

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
  map.mapSettings.animations = map.mapSettings.MEDATA.ANIMATIONS
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
    ANIMATIONS: map.mapSettings.animations,
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