
import * as P from "data/Platform"

export * from "data/Platform"

import * as Common from "editor/Common"

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

export type Platform = _Platform & Common.Metadata
  
// export const defaults: (type: P.Type) => Platform

export const make: (p: P.Platform) => Platform = p =>
  "miceCollision" in p ?
    { ...p,
      ...boosterDefaults(),
      ...Common.metadataDefaults(),
    }
  :
    { ...p,
      ...Common.metadataDefaults(),
    }