

import * as Base from "data/base"
import * as Common from "./Common"

import { Store } from "state/util"

export type Layer = Base.Layer.Layer & Common.Metadata & { objectType: "LAYER" }

export const make: (obj: Base.Layer.Layer) => Layer = obj =>
  ({ objectType: "LAYER",
    ...obj,
    ...Common.metadataDefaults(),
  })