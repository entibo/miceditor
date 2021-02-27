
import { rotate as _rotate, scale as _scale } from "common"
import * as util from "data/base/util"


import * as Base from "data/base"
export * from "data/base"


import * as Map from "./Map"
export { Map }

import * as Platform from "./Platform"
export { Platform }
export function isPlatform(obj: Object): obj is Platform.Platform {
  return obj.objectType === "PLATFORM"
}

import * as Decoration from "./Decoration"
export { Decoration }
export function isDecoration(obj: Object): obj is Decoration.Decoration {
  return obj.objectType === "DECORATION"
}

import * as ShamanObject from "./ShamanObject"
export { ShamanObject }
export function isShamanObject(obj: Object): obj is ShamanObject.ShamanObject {
  return obj.objectType === "SHAMANOBJECT"
}

import * as Joint from "./Joint"
export { Joint }
export function isJoint(obj: Object): obj is Joint.Joint {
  return obj.objectType === "JOINT"
}

import * as Image from "./Image"
export { Image }
export function isImage(obj: Object): obj is Image.Image {
  return obj.objectType === "IMAGE"
}

export type Object
  = Platform.Platform
  | Decoration.Decoration
  | ShamanObject.ShamanObject
  | Joint.Joint
  | Image.Image

  
export function clone(obj: Object) {
  return util.clone(obj)
}


export function getBoundingBox(obj: Object): Box {
  if(isImage(obj))
    return Image.getBoundingBox(obj)
  if(isPlatform(obj))
    return Platform.getBoundingBox(obj)
  if(isShamanObject(obj))
    return ShamanObject.getBoundingBox(obj)
  if(isJoint(obj))
    return Joint.getBoundingBox(obj)
  return { p1: {x: obj.x, y: obj.y}, p2: {x: obj.x, y: obj.y} }
}

export function getPositionInformation(objects: Object[]): { box: Box, center: Point } {
  let boxes = objects.map(getBoundingBox)
  let p1 = {
    x: Math.min(...boxes.map(bb => bb.p1.x)),
    y: Math.min(...boxes.map(bb => bb.p1.y)),
  }
  let p2 = {
    x: Math.max(...boxes.map(bb => bb.p2.x)),
    y: Math.max(...boxes.map(bb => bb.p2.y)),
  }
  return {
    box: { p1, p2 },
    center: {
      x: (p1.x + p2.x)/2,
      y: (p1.y + p2.y)/2,
    },
  }
}


export function move(obj: Object, dx: number, dy: number) {
  if(isJoint(obj))
    return Joint.move(obj, dx, dy)
  obj.x = Math.round(obj.x + dx)
  obj.y = Math.round(obj.y + dy)
}

export function flipX(obj: Object, cx: number) {
  if("reverse" in obj)  obj.reverse = !obj.reverse
  if("rotation" in obj) obj.rotation = -obj.rotation
  if("booster" in obj) obj.booster.angle = -obj.booster.angle - 180

  if(isJoint(obj))
    return Joint.flipX(obj, cx)
  if(isImage(obj))
    return Image.flipX(obj, cx)

  obj.x = 2*cx - obj.x
}
export function flipY(obj: Object, cy: number) {
  if("rotation" in obj) obj.rotation = obj.rotation + 180
  if("booster" in obj) obj.booster.angle = -obj.booster.angle

  if(isJoint(obj))
    return Joint.flipY(obj, cy)
  if(isImage(obj))
    return Image.flipY(obj, cy)

  obj.y = 2*cy - obj.y
}

export function rotate(obj: Object, a: number) {
  if("rotation" in obj) obj.rotation += a
}

export function rotateAround(obj: Object, a: number, p: Point) {
  rotate(obj, a)

  if(isJoint(obj))
    return Joint.rotateAround(obj, a, p)

  let [x,y] = _rotate(obj.x, obj.y, a, p.x, p.y)
  obj.x = x
  obj.y = y
}

export function scaleAround(obj: Object, fX: number, fY: number, p: Point) {
  if(isPlatform(obj))
    Platform.scale(obj, fX, fY)

  if(isJoint(obj))
    return Joint.scaleAround(obj, fX, fY, p)

  let [x,y] = _scale(obj.x, obj.y, fX, fY, p.x, p.y)
  obj.x = x
  obj.y = y
}