
import * as MapSettings from "data/MapSettings"
import * as Platform from "data/Platform"
import * as Decoration from "data/Decoration"
import * as ShamanObject from "data/ShamanObject"
import * as Joint from "data/Joint"

export type SceneObject
  = MapSettings.Image
  | Platform.Platform
/*   | Decoration.Decoration
  | ShamanObject.ShamanObject
  | Joint.Joint */

interface BoundingBox {
  x1: number
  y1: number
  x2: number
  y2: number
}

export function getBoundingBox(obj: SceneObject): BoundingBox {
  if(MapSettings.isImage(obj)) {
    return { x1: obj.x, x2: obj.x, y1: obj.y, y2: obj.y }
  }
  obj
}

export function move(obj: SceneObject, dx: number, dy: number) {

}