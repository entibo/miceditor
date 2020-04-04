
import { bezier } from "@/util"
import * as Base from "data/base"
import * as Editor from "data/editor"


type P = Base.Platform.Platform
type Joint = Base.Joint.Joint
type VC = Extract<Joint,{type: "VC"}>

/* export interface Map {
  mapSettings: Editor.MapSettings.MapSettings
  platforms: Editor.Platform.Platform[]
  decorations: Editor.Decoration.Decoration[]
  shamanObjects: Editor.ShamanObject.ShamanObject[]
  joints: Editor.Joint.Joint[]
} */
export type Map = Base.Map.Map

export function parse(str: string): Map {
  let map = Base.Map.parse(str)

  map.joints = removeCurveSegments(map.joints)

  return map
}

function removeCurveSegments(joints: Joint[]) {

  let filter: (_: Joint[]) => Joint[] = ([obj,...rest]) =>
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



export function serialize(map: Map): string {

  map.joints = map.joints.flatMap(obj =>
    obj.type === "VC"
      ? generateCurveSegments(obj, map.platforms[obj.platform1], map.platforms[obj.platform2])
        .concat(obj)
      : obj)

  return Base.Map.serialize(map)
}


function generateCurveSegments(vc: VC, p1: P, p2: P) {

  let linkedToPlatform 
    =  ("dynamic" in p1 ? p1.dynamic : false)
    && ("dynamic" in p2 ? p2.dynamic : false)

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
    ...Base.Joint.defaults("JD"),
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
    ...Base.Joint.defaults("JPL"),
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