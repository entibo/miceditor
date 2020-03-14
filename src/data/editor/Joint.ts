
import * as Base from "data/base"
import * as Common from "./Common"

//export * from "data/base/Joint"

export type Joint = Base.Joint.Joint & Common.Metadata & { objectType: "JOINT" }

export const make: (obj: Base.Joint.Joint) => Joint = obj =>
  ({ objectType: "JOINT",
    ...obj,
    ...Common.metadataDefaults(),
  })


export const isRendered = (obj: Joint) =>
  "renderEnabled" in obj ? obj.renderEnabled : false

export const isForeground = (obj: Joint) =>
  "foreground" in obj ? obj.foreground : true


export function move(obj: Joint, dx: number, dy: number) {
  if("point1" in obj) {
    obj.point1.x += dx
    obj.point1.y += dy
  }
  if("point2" in obj) {
    obj.point2.x += dx
    obj.point2.y += dy
  }
  if("point3" in obj) {
    obj.point3.x += dx
    obj.point3.y += dy
  }
  if("point4" in obj) {
    obj.point4.x += dx
    obj.point4.y += dy
  }
  if("controlPoint1" in obj) {
    obj.controlPoint1.x += dx
    obj.controlPoint1.y += dy
  }
  if("controlPoint2" in obj) {
    obj.controlPoint2.x += dx
    obj.controlPoint2.y += dy
  }
}

export function getBoundingBox(obj: Joint): Box {
  let pp = []
  if("point1" in obj) pp.push(obj.point1)
  if("point2" in obj) pp.push(obj.point2)
  if("point3" in obj) pp.push(obj.point3)
  if("point4" in obj) pp.push(obj.point4)
  let xs = pp.map(({x}) => x)
  let ys = pp.map(({y}) => y)
  return {
    p1: { x: Math.min(...xs),
          y: Math.min(...ys) },
    p2: { x: Math.max(...xs),
          y: Math.max(...ys) },
  }
}
