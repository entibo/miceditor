
import * as util from "./util"
import * as MapSettings from "./MapSettings"
import * as Platform from "./Platform"
import * as Decoration from "./Decoration"
import * as ShamanObject from "./ShamanObject"
import * as Joint from "./Joint"
import * as Image from "./Image"

export * as Map from "./Map"
export * as MapSettings from "./MapSettings"
export * as Platform from "./Platform"
export * as Decoration from "./Decoration"
export * as ShamanObject from "./ShamanObject"
export * as Joint from "./Joint"
export * as Image from "./Image"

export type Object
  = Image.Image
  | Platform.Platform
  | Decoration.Decoration
  | ShamanObject.ShamanObject
  | Joint.Joint

export const isPlatform
  = util.makeChecker <Object, Platform.Platform> ("invisible")

/* export const isJoint
  = util.makeChecker <Object, Joint.Joint> ("platform1") */

export function isDecoration(obj: Object): obj is Decoration.Decoration {
  if(!("type" in obj)) return false
  return typeof obj.type === "string" 
    ? true
    : "reverse" in obj 
}

export const isImage
  = util.makeChecker <Object, Image.Image> ("imageUrl")




export function move(obj: Object, dx: number, dy: number) {
/*   if(isJoint(obj)) {

    return
  }
  obj.x += dx
  obj.y += dy */
}