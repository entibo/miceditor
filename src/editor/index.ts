
import * as util from "data/util"


import * as Data from "data"
export * from "data"

import * as Platform from "editor/Platform"
export * as Platform from "editor/Platform"



export type Object
  = Platform.Platform
  // | ...

export function clone(data: Object) {
  return util.clone(data)
}