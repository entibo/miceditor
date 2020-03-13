
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
    
  return { p1: {x: 0, y: 0}, p2: {x: 0, y: 0} }
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