
import * as Base from "data/base"
import * as Common from "./Common"

import shamanObjectMetadata from "metadata/shamanObject"


export * from "data/base/ShamanObject"

export type ShamanObject = Base.ShamanObject.ShamanObject & Common.Metadata & { objectType: "SHAMANOBJECT" }

export const make: (obj: Base.ShamanObject.ShamanObject) => ShamanObject = obj =>
  ({ objectType: "SHAMANOBJECT",
    ...obj,
    ...Common.metadataDefaults(),
  })


export const isForeground = (obj: ShamanObject) =>
  Base.ShamanObject.isAnchor(obj)


export function getBoundingBox(obj: ShamanObject): Box {
  let metadata = shamanObjectMetadata.get(obj.type)
  let width  = metadata.boundingWidth  || metadata.width
  let height = metadata.boundingHeight || metadata.height
  return Common.computeBoundingBox(
    { x: obj.x,     y: obj.y },
    { x: width, y: height },
    "rotation" in obj ? obj.rotation : 0
  )
}