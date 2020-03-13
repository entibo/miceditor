
import * as Base from "data/base"
import * as Common from "./Common"


export type ShamanObject = Base.ShamanObject.ShamanObject & Common.Metadata & { objectType: "SHAMANOBJECT" }

export const make: (obj: Base.ShamanObject.ShamanObject) => ShamanObject = obj =>
  ({ objectType: "SHAMANOBJECT",
    ...obj,
    ...Common.metadataDefaults(),
  })


export const isForeground = (obj: ShamanObject) =>
  Base.ShamanObject.isAnchor(obj)