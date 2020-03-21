
import { rotate as _rotate } from "@/util"

import * as Base from "data/base"
import * as Common from "./Common"

export * from "data/base/Joint"

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

export function flip(obj: Object, cx: number) {
  for(let name of ["point1","point2","point3","point4","controlPoint1","controlPoint2"]) {
    if(name in obj){} else continue

    let q = (obj as any)[name] as Point
    q.x = 2*cx - q.x
  }
}

export function rotateAround(obj: Joint, a: number, p: Point) {
  for(let name of ["point1","point2","point3","point4","controlPoint1","controlPoint2"]) {
    if(name in obj){} else continue

    let q = (obj as any)[name] as Point
    let [x,y] = _rotate(q.x, q.y, a, p.x, p.y)
    q.x = x
    q.y = y
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


export const getRelativePoint = (obj: Joint, name: Base.Joint.PointName) => {
  if(obj.type === "VC")
    return name === "point1" ? obj.point2
         : name === "point2" ? obj.point1
         : name === "controlPoint1" ? obj.point1
         : name === "controlPoint2" ? obj.point2
         : undefined
  if(name === "point1") {
    if("point2" in obj && obj.point2.enabled) return obj.point2
    if("point3" in obj && obj.point3.enabled) return obj.point3
    if("point4" in obj && obj.point4.enabled) return obj.point4
  }
  if(name === "point2") {
    if("point1" in obj && obj.point1.enabled) return obj.point1
    if("point3" in obj && obj.point3.enabled) return obj.point3
    if("point4" in obj && obj.point4.enabled) return obj.point4
  }
  if(name === "point3") {
    if("point1" in obj && obj.point1.enabled) return obj.point1
    if("point2" in obj && obj.point2.enabled) return obj.point2
    if("point4" in obj && obj.point4.enabled) return obj.point4
  }
  if(name === "point4") {
    if("point1" in obj && obj.point1.enabled) return obj.point1
    if("point2" in obj && obj.point2.enabled) return obj.point2
    if("point3" in obj && obj.point3.enabled) return obj.point3
  }
}