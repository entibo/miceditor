
import * as P from "data/base/Platform"

export * from "data/base/Platform"

import * as Common from "./Common"

interface Booster {
  booster: {
    enabled: boolean
    angle: number
    speed: number
  }
}
const boosterDefaults: () => Booster = () => ({
  booster: {
    enabled: false,
    angle: 0,
    speed: 100,
  },
})

type _Platform 
  = Extract<P.Platform, P.NonStatic> & Booster
  | Exclude<P.Platform, P.NonStatic>

export type Platform = _Platform & Common.Metadata & { objectType: "PLATFORM" }
  
// export const defaults: (type: P.Type) => Platform

export const make: (p: P.Platform) => Platform = p =>
  "miceCollision" in p ?
    { ...p,
      ...boosterDefaults(),
      ...Common.metadataDefaults(),
      objectType: "PLATFORM",
    }
  :
    { ...p,
      ...Common.metadataDefaults(),
      objectType: "PLATFORM",
    }

export function isStatic(p: Platform): p is Exclude<Platform, P.NonStatic> {
  return "dynamic" in p
    ? p.dynamic === false && p.booster.enabled === false
    : true
}

export const isForeground = (p: Platform) =>
  "foreground" in p ? p.foreground : true

export const isInvisible = (p: Platform) =>
  p.type === P.Type.Invisible || p.invisible

export function isCircle(p: Platform): p is Extract<Platform, P.Circle> {
  return p.type === P.Type.Circle
}

export function getBoundingBox(obj: Platform): Box {
  if(isCircle(obj))
    return { 
        p1: { x: obj.x - obj.radius,
              y: obj.y - obj.radius, },
        p2: { x: obj.x + obj.radius,
              y: obj.y + obj.radius, }, 
      }
  return Common.computeBoundingBox(
    { x: obj.x,     y: obj.y },
    { x: obj.width, y: obj.height },
    "rotation" in obj ? obj.rotation : 0
  )
}

export function resize(obj: Platform, dx: number, dy: number) {
  if(isCircle(obj)) {
    obj.radius += (dx + dy) / 2
    obj.radius = Math.max(10, obj.radius)
    return
  }
  obj.width = Math.max(dx + obj.width, 10)
  obj.height = Math.max(dy + obj.height, 10)
}