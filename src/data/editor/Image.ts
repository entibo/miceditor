
import * as Base from "data/base"
import * as MapSettings from "data/base/MapSettings"
import * as Common from "./Common"

export * from "data/base/Image"


export type Image 
  = Common.Metadata & { objectType: "IMAGE" }
  & ( Base.Image.Image & { foreground: boolean }
    | MapSettings.DisappearingImage )

export const make: (obj: Base.Image.Image | MapSettings.DisappearingImage, foreground?: boolean) => Image = (obj, foreground=false) =>
  isDisappearing(obj)
  ? ({ objectType: "IMAGE",
      ...Common.metadataDefaults(),
      ...obj,
    })
  : ({ objectType: "IMAGE",
      ...Common.metadataDefaults(),
      ...obj,
      foreground,
    })

export const isDisappearing = 
  (obj: Base.Image.Image | MapSettings.DisappearingImage): obj is MapSettings.DisappearingImage => 
  "rx" in obj

export const isForeground = (obj: Image) =>
  "foreground" in obj ? obj.foreground : true


export function getBoundingBox(obj: Image): Box {
  let dimensions = getDimensions(obj.imageUrl.url)
  if(dimensions)
    return {
      p1: { x: obj.x,
            y: obj.y },
      p2: { x: obj.x + dimensions.x,
            y: obj.y + dimensions.y }
    }
  return {
    p1: { x: obj.x,
          y: obj.y },
    p2: { x: obj.x,
          y: obj.y }
  }
}

const dimensionCache = new Map<string, Point>()
const hasBeenRequested = new Set<string>()
function getDimensions(url: string): Point {
  let dimensions = dimensionCache.get(url)
  if(dimensions) return dimensions
  if(hasBeenRequested.has(url)) return { x: 0, y: 0 }
  hasBeenRequested.add(url)
  performRequest(url)
  return { x: 0, y: 0 }
}
function performRequest(url: string) {
  let img = new Image()
  img.onload = () => 
    dimensionCache.set(url, { x: img.width, y: img.height })
  img.onerror = img.onabort = () => 
    hasBeenRequested.delete(url)
  img.src = url
}
