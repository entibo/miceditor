
export interface Metadata {
  ignore: boolean
  visible: boolean
  interactive: boolean
  index: number
  selected: boolean
}
export const metadataDefaults: () => Metadata = () => ({
  ignore: false,
  visible: true,
  interactive: true,
  index: 0,
  selected: false,
})


import { rotate } from "common"
export function computeBoundingBox(position: Point, dimensions: Point, rotation: number): Box {
  let rw = dimensions.x/2, rh = dimensions.y/2
  let pp = [ [-rw,-rh], [-rw,rh], [rw,-rh], [rw,rh] ]
    .map(([x,y]) => rotate(x,y,rotation))
    .map(([x,y]) => [x+position.x, y+position.y])
  let [xs,ys] = [pp.map(([x,_]) => x), pp.map(([_,y]) => y)]
  return {
    p1: { x: Math.min(...xs),
          y: Math.min(...ys) },
    p2: { x: Math.max(...xs),
          y: Math.max(...ys) },
  }
}