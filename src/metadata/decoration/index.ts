import { getUniqueId } from "common"
import rawDecorationMetadata from "./decorationMetadata.json"
import * as Decoration from "data/editor/Decoration"


type Metadata 
  = ( { svg: true
        filters: Filter[] }
    | { svg: false })

  & { file: string
      offset: Point
      special?: boolean }
      
type Filter = {
  name: string
  defaultColor: string
}


const data = new Map<string|number, Metadata>([
  [ "T", {
    svg: false,
    offset: { x: 21, y: 31 },
    file: "T.png",
    special: true,
  }],
  [ "T-1", {
    svg: false,
    offset: { x: 25, y: 35 },
    file: "T-1.png",
    special: true,
  }],
  [ "T-2", {
    svg: false,
    offset: { x: 25, y: 35 },
    file: "T-2.png",
    special: true,
  }],
  [ "F", {
    svg: false,
    offset: { x: 23, y: 21 },
    file: "F.png",
    special: true,
  }],
  [ "F-triple", {
    svg: false,
    offset: { x: 23+12, y: 21+7 },
    file: "F-triple.png",
    special: true,
  }],
  [ "F-candy", {
    svg: false,
    offset: { x: 23+12, y: 21+7 },
    file: "F-candy.png",
    special: true,
  }],
  [ "DS", {
    svg: false,
    offset: { x: 26, y: 43 },
    file: "DS.png",
    special: true,
  }],
  [ "DC", {
    svg: false,
    offset: { x: 26, y: 43 },
    file: "DC.png",
    special: true,
  }],
  [ "DC2", {
    svg: false,
    offset: { x: 26, y: 43 },
    file: "DC2.png",
    special: true,
  }],
])


const defaultFilter = () => ({ 
  name: "invalid-color-"+getUniqueId(),
  defaultColor: "000000",
})

for(let entry of rawDecorationMetadata) {
  let type = !isNaN(parseInt(entry.type)) 
    ? parseInt(entry.type)
    : entry.type
  let metadata = entry.filters.length 
    ? { svg: true as const,
        filters: entry.filters.map(x => x || defaultFilter()),
        offset: entry.offset,
        file: entry.type + ".svg" }
    : { svg: false as const,
        offset: entry.offset,
        file: entry.type + ".png" }
  data.set(type, metadata)
}


export default {
  get(type: Decoration.Type): Metadata {
    return data.get(type) || { 
      file: "unknown-decoration.png",
      offset: {
        x: 15,
        y: 15,
      },
      svg: false,
    }
  },
  entries: () => [...data.entries()]
}