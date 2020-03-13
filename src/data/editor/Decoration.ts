
import * as Base from "data/base"
import * as Common from "./Common"


export type Decoration = Base.Decoration.Decoration & Common.Metadata & { objectType: "DECORATION" }

export const make: (obj: Base.Decoration.Decoration) => Decoration = obj =>
  ({ objectType: "DECORATION",
    ...obj,
    ...Common.metadataDefaults(),
  })

export const isForeground = (obj: Decoration) =>
  "foreground" in obj ? obj.foreground : true