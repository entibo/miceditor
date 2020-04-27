

import * as Base from "data/base"
import * as Common from "./Common"

import { Store } from "state/util"

export type Animation = Base.Animation.Animation & Common.Metadata & { objectType: "ANIMATION" }

export const make: (obj: Base.Animation.Animation) => Animation = obj =>
  ({ objectType: "ANIMATION",
    ...obj,
    ...Common.metadataDefaults(),
  })