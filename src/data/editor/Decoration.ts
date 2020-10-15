
import * as Base from "data/base"
import * as Common from "./Common"

export * from "data/base/Decoration"


export type Decoration = Base.Decoration.Decoration & Common.Metadata & { objectType: "DECORATION" }

export const make: (obj: Base.Decoration.Decoration) => Decoration = obj =>
  ({ objectType: "DECORATION",
    ...obj,
    ...Common.metadataDefaults(),
  })

export const isForeground = (obj: Decoration) =>
  "foreground" in obj ? obj.foreground : true

export function isSpawn(obj: Decoration): obj is Extract<Decoration,{type:"DS"|"DC"|"DC2"}> {
  return obj.type === "DS" || obj.type === "DC" || obj.type === "DC2"
}

export const isMouseSpawn = (obj: Decoration) =>
  obj.type === "DS"