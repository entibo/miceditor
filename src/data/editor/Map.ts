
import { bezier } from "@/util"
import * as Base from "data/base"
import * as Editor from "data/editor"

export interface Map {
  mapSettings: Editor.MapSettings.MapSettings
  platforms: Editor.Platform.Platform[]
  decorations: Editor.Decoration.Decoration[]
  shamanObjects: Editor.ShamanObject.ShamanObject[]
  joints: Editor.Joint.Joint[]
}

export function parse(str: string): Base.Map.Map {
  let map = Base.Map.parse(str)

  // Remove <JPL>s related to <VC>s
  let joints = []
  for(let k=map.joints.length-1; k >= 0; k--) {
    let obj = map.joints[k]
    joints.push(obj)
    if(obj.type === "VC") {
      k -= Math.ceil(obj.fineness/3)
    }
  }
  map.joints = joints.reverse()

  return map
}

export function serialize(map: Map): string {

  // Generate <JPL>s related to <VC>s
  let joints = [] as Editor.Joint.Joint[]
  for(let obj of map.joints) {
    if(obj.type !== "VC") {
      joints.push(obj)
      continue
    }

    let jplCount = Math.ceil(obj.fineness/3)
    let points = []
    for(let k=0; k < obj.fineness+1; k++)
      points.push({
        ...bezier(
          k * (1/obj.fineness),
          obj.point1,
          obj.point2,
          obj.controlPoint1,
          obj.controlPoint2,
        ),
        enabled: true,
      })
    for(let k=0; k < jplCount; k++) {
      let jpl = Base.Joint.defaults("JPL") as Extract<Base.Joint.Joint, { type: "JPL" }>
      jpl.renderEnabled = true
      jpl.color      = obj.color
      jpl.thickness  = obj.thickness
      jpl.opacity    = obj.opacity
      jpl.foreground = obj.foreground
      jpl.point1 = points[k*3]
      jpl.point3 = points[k*3 + 1]
      jpl.point4 = points[k*3 + 2] || points[k*3]
      jpl.point2 = points[k*3 + 3] || points[k*3]
      joints.push(jpl as any)
    }

    joints.push(obj)
  }
  map.joints = joints

  return Base.Map.serialize(map)
}