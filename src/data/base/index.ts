
import * as util from "./util"
import * as Map from "./Map"
import * as MapSettings from "./MapSettings"
import * as Platform from "./Platform"
import * as Decoration from "./Decoration"
import * as ShamanObject from "./ShamanObject"
import * as Joint from "./Joint"
import * as Image from "./Image"

export { Map }
export { MapSettings }
export { Platform }
export { Decoration }
export { ShamanObject }
export { Joint }
export { Image }

export type Object
  = Image.Image
  | Platform.Platform
  | Decoration.Decoration
  | ShamanObject.ShamanObject
  | Joint.Joint
