
import * as M from "util/Maybe"
import * as XML from "./XML"
import * as Common from "./Common"
import * as Image from "./Image"
import * as util from "./util"


const attributes = [
  "L", "H",
  "F", "d", "D", "APS",
  "G", "mgoc", 
  "DS", "defilante", "theme", 
  "P", "C", "A", "N",
  "Ca", "mc", "bh", "dodue",
] as const
const undefinedAttributes = Common.makeUndefinedAttributes(attributes)

export interface Node extends XML.Node {
  name: "P",
  children: [],
  attributes: Partial<Record<typeof attributes[number], string>>
}


export interface MapSettings extends Common.UnknownAttributes {

/*   maxWidth: number
  maxHeight: number */
  width: number
  height: number

  backgroundImageId: string

  backgroundImages: Image.Image[]
  foregroundImages: Image.Image[]
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
      axis: "x" | "y"
      position: number }

  defilante: 
    { enabled: false }
    |
    { enabled: true
      startSpeed: number
      acceleration: number
      maxSpeed: number
      freeScroll: boolean }

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

export interface DisappearingImage extends Image.Image {
  rx: number
  ry: number
  rw: number
  rh: number
}
const disappearingImageDefaults: () => DisappearingImage = () => ({
  ...Image.defaults(),
  rx: 0,
  ry: 0,
  rw: 0,
  rh: 0,
})


export const defaults: () => MapSettings = () => ({
  unknownAttributes: {},

/*   maxWidth: 1600,
  maxHeight: 800, */
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

  defilante: { enabled: false },

  theme: "",

  portals: false,
  collisions: false,
  soulmate: false,
  night: false,
  hideOffscreen: false,
  hideNails: false,
  upwardsCannonballs: false,
  dodue: false,
})

export function decode(xmlNode: XML.Node): MapSettings {
  let node = xmlNode as Node
  const getAttr = util.makeGetter(node.attributes)
  
  let data = defaults()
  data.unknownAttributes = Common.getUnknownAttributes(attributes, node.attributes)
  const setProp = util.makeSetter(data)

  setProp ("width")  (getAttr ("L") (util.readInt, w => Math.max(w, 800)))
  setProp ("height") (getAttr ("H") (util.readInt, h => Math.max(h, 400)))

  setProp ("backgroundImageId") (getAttr ("F") (util.readInt, util.writeInt))

  setProp ("backgroundImages")   (getAttr ("d")   (readImages))
  setProp ("foregroundImages")   (getAttr ("D")   (readImages))
  setProp ("disappearingImages") (getAttr ("APS") (readDisappearingImages))

  getAttr ("G") (readGravityWind, r => {
    setProp ("gravity") (r.gravity)
    setProp ("wind")    (r.wind)
  })

  setProp ("shamanObjectsMass") (getAttr ("mgoc") (util.readFloat))

  setProp ("miceSpawn") (getAttr ("DS") (readMiceSpawn))

  setProp ("defilante") (getAttr ("defilante") (readDefilante))

  setProp ("theme") (getAttr ("theme") ())

  setProp ("portals")            (getAttr ("P")     (() => true))   
  setProp ("collisions")         (getAttr ("C")     (() => true))       
  setProp ("soulmate")           (getAttr ("A")     (() => true))     
  setProp ("night")              (getAttr ("N")     (() => true)) 
  setProp ("hideOffscreen")      (getAttr ("Ca")    (() => true))         
  setProp ("hideNails")          (getAttr ("mc")    (() => true))     
  setProp ("upwardsCannonballs") (getAttr ("bh")    (() => true))               
  setProp ("dodue")              (getAttr ("dodue") (() => true)) 

  return data
}

export function encode(data: MapSettings): Node {
  let node: Node = {
    name: "P",
    children: [],
    attributes: {
      ...undefinedAttributes,
      ...data.unknownAttributes,
    }
  }

  const getProp = util.makeGetter(data)
  const setAttr = util.makeSetter(node.attributes)

  setAttr ("L") (getProp ("width")  (util.omitOn(800), util.writeInt))
  setAttr ("H") (getProp ("height") (util.omitOn(400), util.writeInt))

  setAttr ("F") (getProp ("backgroundImageId") (util.omitOn("-1")))

  setAttr ("d") (getProp ("backgroundImages") (util.omitOn([]), writeImages))
  setAttr ("D") (getProp ("foregroundImages") (util.omitOn([]), writeImages))
  setAttr ("APS") (getProp ("disappearingImages") (util.omitOn([]), writeDisappearingImages))

  setAttr ("G") (M.map(
    (w,g) => util.omitOn ("0,10") (writeGravityWind(w,g)),
    getProp ("wind") (),
    getProp ("gravity") (),
  ))

  setAttr ("mgoc") (getProp ("shamanObjectsMass") (util.writeFloat, util.omitOn("0")))

  setAttr ("DS") (getProp ("miceSpawn") (writeMiceSpawn))

  setAttr ("defilante") (getProp ("defilante") (writeDefilante))

  setAttr ("theme") (getProp ("theme") (util.omitOn("")))

  setAttr ("P")     (getProp ("portals")            (util.omitOn(false), () => ""))
  setAttr ("C")     (getProp ("collisions")         (util.omitOn(false), () => ""))
  setAttr ("A")     (getProp ("soulmate")           (util.omitOn(false), () => ""))
  setAttr ("N")     (getProp ("night")              (util.omitOn(false), () => ""))
  setAttr ("Ca")    (getProp ("hideOffscreen")      (util.omitOn(false), () => ""))
  setAttr ("mc")    (getProp ("hideNails")          (util.omitOn(false), () => ""))
  setAttr ("bh")    (getProp ("upwardsCannonballs") (util.omitOn(false), () => ""))
  setAttr ("dodue") (getProp ("dodue")              (util.omitOn(false), () => ""))

  return node
}


// Format: "url,x,y;url,x,y;url,x,y;..."
function readImages(str: string): Image.Image[] {
  return str.split(";").map(readImage).reverse()
}
function writeImages(images: Image.Image[]): string {
  return images.reverse().map(writeImage).join(";")
}

// Format: "url,x,y"
function readImage(str: string): Image.Image {
  let image = Image.defaults()
  let set = util.makeSetter(image)
  let parts = str.split(",")
  set ("imageUrl") (M.andThen(parts.shift(), M.iffDefined, Image.readUrl))
  set ("x") (M.andThen(parts.shift(), M.iffDefined, util.readInt))
  set ("y") (M.andThen(parts.shift(), M.iffDefined, util.readInt))
  return image
}
function writeImage(image: Image.Image): string {
  return [
    image.imageUrl.value,
    util.writeInt(image.x),
    util.writeInt(image.y),
  ].join(",")
}

// Format: "url,?,rx,ry,rw,rh,x,y;..."
function readDisappearingImages(str: string): DisappearingImage[] {
  return str.split(";").map(readDisappearingImage).reverse()
}
function writeDisappearingImages(images: DisappearingImage[]): string {
  return images.reverse().map(writeDisappearingImage).join(";")
}

// Format: "url,?,rx,ry,rw,rh,x,y"
function readDisappearingImage(str: string): DisappearingImage {
  let image = disappearingImageDefaults()
  let set = util.makeSetter(image)
  let parts = str.split(",")
  set ("imageUrl") (M.andThen(parts.shift(), M.iffDefined, Image.readUrl))
  parts.shift() // ?
  set ("rx") (M.andThen(parts.shift(), M.iffDefined, util.readInt))
  set ("ry") (M.andThen(parts.shift(), M.iffDefined, util.readInt))
  set ("rw") (M.andThen(parts.shift(), M.iffDefined, util.readInt, w => Math.max(w, 0)))
  set ("rh") (M.andThen(parts.shift(), M.iffDefined, util.readInt, h => Math.max(h, 0)))
  set ("x")  (M.andThen(parts.shift(), M.iffDefined, util.readInt))
  set ("y")  (M.andThen(parts.shift(), M.iffDefined, util.readInt))
  return image
}
function writeDisappearingImage(image: DisappearingImage): string {
  return [
    image.imageUrl.value,
    "",
    util.writeInt(image.rx),
    util.writeInt(image.ry),
    util.writeInt(image.rw),
    util.writeInt(image.rh),
    util.writeInt(image.x),
    util.writeInt(image.y),
  ].join(",")
}

// Format: "g,w"
function readGravityWind(str: string) {
  let parts = str.split(",")
  return {
    wind:    M.andThen(parts.shift(), M.iffDefined, util.readFloat),
    gravity: M.andThen(parts.shift(), M.iffDefined, util.readFloat),
  }
}
function writeGravityWind(wind: number, gravity: number): string {
  return [
    util.writeFloat(wind),
    util.writeFloat(gravity),
  ].join(",")
}

// Format: "m;x,y,x,y,x,y..." | "x;i" | "y;i"
function readMiceSpawn(str: string): M.Maybe<MapSettings["miceSpawn"]> {
  let [left,right] = str.split(";")
  let maybeRight = M.iffDefined(right)
  if(left === "m") {
    return readMultipleMiceSpawn(M.withDefault("")(maybeRight))
  }
  else if(left === "x" || left === "y") {
    return {
      type: "random" as const,
      axis: left,
      position: M.withDefault (0) (M.andThen(maybeRight, util.readInt)),
    }
  }
  return M.None
}
function writeMiceSpawn(miceSpawn: MapSettings["miceSpawn"]): M.Maybe<string> {
  if(miceSpawn.type === "multiple") {
    return [
      "m",
      miceSpawn.positions
        .flatMap(({x,y}) => [x,y])
        .map(util.writeInt)
        .join(",")
    ].join(";")
  } else if(miceSpawn.type === "random") {
    return [
      miceSpawn.axis,
      util.writeInt(miceSpawn.position),
    ].join(";")
  }
  return M.None
}

// Format: "x,y,x,y,x,y,x,y,..."
function readMultipleMiceSpawn(str: string) {
  let positions: Point[] = []
  let parts = str.split(",")
  while(parts.length) {
    positions.push({
      x: M.withDefault (0) (M.andThen(parts.shift(), M.iffDefined, util.readInt)),
      y: M.withDefault (0) (M.andThen(parts.shift(), M.iffDefined, util.readInt)),
    })
  }
  return {
    type: "multiple" as const,
    positions,
  }
}

// Format: "f,f,f,b"
function readDefilante(str: string): MapSettings["defilante"] {
  let parts = str.split(",")
  return {
    enabled: true,
    startSpeed:   M.withDefault (0) (M.andThen(parts.shift(), M.iffDefined, util.readFloat)),
    acceleration: M.withDefault (0) (M.andThen(parts.shift(), M.iffDefined, util.readFloat)),
    maxSpeed:     M.withDefault (0) (M.andThen(parts.shift(), M.iffDefined, util.readFloat)),
    freeScroll:   M.withDefault (false) (M.andThen(parts.shift(), M.iffDefined, util.readBool)),
  }
}
function writeDefilante(defilante: MapSettings["defilante"]): M.Maybe<string> {
  if(!defilante.enabled) return M.None
  return [
    util.writeFloat(defilante.startSpeed),
    util.writeFloat(defilante.acceleration),
    util.writeFloat(defilante.maxSpeed),
    util.writeBool(defilante.freeScroll),
  ].join(",")
}