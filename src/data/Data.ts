
import * as util from "data/util"
import * as Common from "data/Common"
import * as MapSettings from "data/MapSettings"
import * as Platform from "data/Platform"
/* import * as Decoration from "data/Decoration"
import * as ShamanObject from "data/ShamanObject"
import * as Joint from "data/Joint" */



export type Data
  = Common.Image
  | Platform.Platform

export const isPlatform
  = util.makeChecker <Data, Platform.Platform> ("invisible")

export const isImage
  = util.makeChecker <Data, Common.Image> ("imageUrl")

/* export function isPlatform_Simple(obj: SceneObject): obj is Platform.Platform {
  let key: keyof Platform.Platform = "invisible"
  return key in obj
} */



export function getBoundingBox(obj: Data): Box {
  if(isImage(obj)) {
    return { 
      p1: { x: obj.x, y: obj.y }, 
      p2: { x: obj.x, y: obj.y },
    }
  }
  return { p1: {x: 0, y: 0}, p2: {x: 0, y: 0} }
}

export function move(obj: Data, dx: number, dy: number) {

}