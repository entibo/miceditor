
import * as P from "data/base/Platform"

export * from "data/base/Platform"

import * as Common from "./Common"

interface Booster {
  booster: {
    enabled: boolean
    axis: "x" | "y"
    power: number
  }
}
const boosterDefaults: () => Booster = () => ({
  booster: {
    enabled: false,
    axis: "x",
    power: 10,
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


export const isForeground = (p: Platform) =>
  "foreground" in p ? p.foreground : true

export const isInvisible = (p: Platform) =>
  p.type === P.Type.Invisible || p.invisible

export const isCircle = (p: Platform) =>
  p.type === P.Type.Circle
