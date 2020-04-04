
import { rotate as _rotate } from "@/util"
import * as util from "data/base/util"


import * as Base from "data/base"
export * from "data/base"

export * as Map from "./Map"

import * as Platform from "./Platform"
export * as Platform from "./Platform"
export function isPlatform(obj: Object): obj is Platform.Platform {
  return obj.objectType === "PLATFORM"
}

import * as Decoration from "./Decoration"
export * as Decoration from "./Decoration"
export function isDecoration(obj: Object): obj is Decoration.Decoration {
  return obj.objectType === "DECORATION"
}

import * as ShamanObject from "./ShamanObject"
export * as ShamanObject from "./ShamanObject"
export function isShamanObject(obj: Object): obj is ShamanObject.ShamanObject {
  return obj.objectType === "SHAMANOBJECT"
}

import * as Joint from "./Joint"
export * as Joint from "./Joint"
export function isJoint(obj: Object): obj is Joint.Joint {
  return obj.objectType === "JOINT"
}


import * as Image from "./Image"
export * as Image from "./Image"
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


export function move(obj: Object, dx: number, dy: number) {
  if(isJoint(obj))
    return Joint.move(obj, dx, dy)
  /* if(isPlatform(obj) && obj.image.enabled) {
    obj.image.x += dx
    obj.image.y += dy
  } */
  obj.x += dx
  obj.y += dy
}

export function flip(obj: Object, cx: number) {
  if("reverse" in obj)  obj.reverse = !obj.reverse
  if("rotation" in obj) obj.rotation = -obj.rotation
  if("booster" in obj) obj.booster.angle = -obj.booster.angle - 180

  if(isJoint(obj))
    return Joint.flip(obj, cx)

  obj.x = 2*cx - obj.x
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