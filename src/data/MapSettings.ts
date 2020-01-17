
import * as XML from "data/XML"
import * as util from "data/util"
import * as M from "util/Maybe"

export interface Node {
  name: "P",
  children: XML.Node[],
  attributes: {
    L?    : string
    H?    : string
    
    F?    : string
    d?    : string
    D?    : string
    APS?  : string
    
    G?    : string
    mgoc? : string

    DS?   : string

    defilante? : string
    
    theme?: string

    P?    : string
    C?    : string
    A?    : string
    N?    : string
    Ca?   : string
    mc?   : string
    bh?   : string
    dodue?: string
  } 
}

export interface Image {
  index: number
  url: string
  fullUrl: string
  x: number
  y: number
}
export function isImage(x: any): x is Image {
  return "url" in x
}

export interface DisappearingImage extends Image {
  rx: number
  ry: number
  rw: number
  rh: number
}

export interface MapSettings {

  maxWidth: number
  maxHeight: number
  width: number
  height: number

  backgroundImageId: string

  backgroundImages: Image[]
  foregroundImages: Image[]
  disappearingImages: DisappearingImage[]

  gravity: number
  wind: number

  shamanObjectsMass: number

  miceSpawn:
    { type: "normal" }
    | 
    { type: "multiple"
      positions: { x: number, y: number }[] }
    |
    { type: "random"
      axis: "x" | "y" }

  defilante: {
    enabled: boolean
    startSpeed: number
    acceleration: number
    maxSpeed: number
    freeScroll: boolean
  }

  theme: string

  portals: boolean
  collisions: boolean
  soulmate: boolean
  night: boolean
  hideOffscreen: boolean
  hideNails: boolean
  upwardsCannonballs: boolean
  dodue: boolean

}


export function defaults(): MapSettings {
  return {
    maxWidth: 1600,
    maxHeight: 800,
    width: 800,
    height: 400,

    backgroundImageId: "-1",

    backgroundImages: [],
    foregroundImages: [],
    disappearingImages: [],

    gravity: 10,
    wind: 0,

    shamanObjectsMass: 0,

    miceSpawn: { type: "normal" },

    defilante: {
      enabled: false,
      startSpeed: 0,
      acceleration: 0,
      maxSpeed: 0,
      freeScroll: true,
    },

    theme: "",

    portals: false,
    collisions: false,
    soulmate: false,
    night: false,
    hideOffscreen: false,
    hideNails: false,
    upwardsCannonballs: false,
    dodue: false,
  }
}

export function decode(xmlNode: XML.Node): MapSettings {
  let node = xmlNode as Node, attr = node.attributes
  let d = defaults()
  let data = {
    width: util.int(attr.L, d.width),
    backgroundImageId: 
  }
  return data
}

export function encode(mapSettings: MapSettings): Node {

}



