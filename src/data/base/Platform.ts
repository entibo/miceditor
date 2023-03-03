
import * as M from "maybe/Maybe"
import * as XML from "./XML"
import * as util from "./util"
import * as Common from "./Common"
import * as Image from "./Image"

const attributes = [
  "T",
  "X", "Y", "L", "H",
  "P", "o", "c", "col", "grav",
  "N", "v", "m", "lua", "nosync", "i",
  "tint", 
  "archAcc", "archCheeseMax", "archMax",
  "linDampAcc", "linDampMax",
  "angDampAcc", "angDampMax",
] as const
const undefinedAttributes = Common.makeUndefinedAttributes(attributes)


export interface Node extends XML.Node {
  name: "S",
  children: [],
  attributes: Partial<Record<typeof attributes[number], string>>
}

export enum Type {
  Wood =       0,      Stone =      10,
  Ice =        1,      Snow =       11,
  Trampoline = 2,      Rectangle =  12,
  Lava =       3,      Circle =     13,
  Chocolate =  4,      Invisible =  14,
  Earth =      5,      Cobweb =     15,
  Grass =      6,      Wood2 =      16,
  Sand =       7,      Grass2 =     17,
  Cloud =      8,      Grass3 =     18,
  Water =      9,      Acid =       19,
}

export const typeNames = [
    "wood", "ice", "trampoline", 
    "lava", "chocolate", 
    "earth", "grass",
    "sand", "cloud", "water",
    "stone", "snow", 
    "rectangle", "circle",
    "invisible", "cobweb",
    "wood2", "grass2", "grass3",
    "acid",
  ]

interface Base extends Common.UnknownAttributes {
  x: number
  y: number
  invisible: boolean
  tint: string
  lua: string
  nosync: boolean
  image: { enabled: boolean } & Image.Image
}
export interface NonStatic {
  dynamic: boolean
  mass: number
  friction: number
  restitution: number
  fixedRotation: boolean
  linearDamping: number
  angularDamping: number
  gravityScale: number

  foreground: boolean
  vanish: number
  miceCollision: boolean
  objectCollision: boolean
  touchCollision: boolean
}
export interface Colored {
  color: string
}
export interface Rectangle {
  width: number
  height: number
}
export interface Circle {
  radius: number
}
export interface Rotatable {
  rotation: number
}
export interface WaterPhysics {
  archAcc: number
  archCheeseMax: number
  archMax: number
  linDampAcc: number
  linDampMax: number
  angDampAcc: number
  angDampMax: number
}

export type Platform

  = { type: Type.Wood | Type.Wood2 | Type.Ice | Type.Trampoline | Type.Lava |
            Type.Chocolate | Type.Earth | Type.Grass | Type.Grass2 | Type.Grass3 | Type.Acid | Type.Sand |
            Type.Cloud | Type.Stone | Type.Snow | Type.Invisible }
    & Base & Rectangle & Rotatable & NonStatic
    
  | { type: Type.Rectangle }
    & Base & Rectangle & Rotatable & NonStatic & Colored

  | { type: Type.Circle }
    & Base & Circle    & Rotatable & NonStatic & Colored

  | { type: Type.Cobweb }
    & Base & Rectangle & Rotatable

  | { type: Type.Water }
    & Base & Rectangle & WaterPhysics

export type PlatformProps 
  = { type: Type } & Base & Rectangle & Circle & Rotatable & NonStatic & Colored & WaterPhysics


const baseDefaults: () => Base = () => ({
  unknownAttributes: {},
  x: 0,
  y: 0,
  invisible: false,
  tint: "",
  lua: "",
  nosync: false,
  image: {
    enabled: false,
    ...Image.defaults(),
  }
})
const nonStaticDefaults: () => NonStatic = () => ({
  dynamic: false,
  mass: 0,
  linearDamping: 0,
  angularDamping: 0,
  friction: 0.3,
  restitution: 0.2,
  fixedRotation: false,
  gravityScale: 1,

  foreground: false,
  vanish: 0,
  miceCollision: true,
  objectCollision: true,
  touchCollision: false,
})
const coloredDefaults: () => Colored = () => ({
  color: "324650"
})
const rectangleDefaults: () => Rectangle = () => ({
  width: 10,
  height: 10,
})
const circleDefaults: () => Circle = () => ({
  radius: 10,
})
const rotatableDefaults: () => Rotatable = () => ({
  rotation: 0,
})
export const waterPhysicsDefaults: () => WaterPhysics = () => ({
  archAcc: 0.1,
  archCheeseMax: 0.25,
  archMax: 0.5,
  linDampAcc: 0,
  linDampMax: 0,
  angDampAcc: 0,
  angDampMax: 0,
})
const typeSpecificDefaults = (type: Type) => {
  switch(type) {
    case Type.Ice: return {
      friction: 0,
    }
    case Type.Chocolate: return {
      friction: 20,
    }
    case Type.Sand: return {
      friction: 0.1,
    }
    case Type.Snow: return {
      friction: 0.05,
      restitution: 0.1,
    }
    case Type.Trampoline: return {
      friction: 0,
      restitution: 1.2,
    }
    case Type.Lava: return {
      friction: 0,
      restitution: 20,
    }
    case Type.Stone: return {
      restitution: 0,
    }
    case Type.Acid: return {
      restitution: 0,
    }
    case Type.Cloud: return {
      miceCollision: false,
    }
    default: return {}
  }
}

export const defaults: (t: Type) => Platform = type =>
  type === Type.Water ?
    { type,
      ...baseDefaults(),
      ...rectangleDefaults(),
      ...waterPhysicsDefaults(),
    }
  :
  type === Type.Cobweb ?
    { type,
      ...rotatableDefaults(),
      ...baseDefaults(),
      ...rectangleDefaults(),
    }
  :
  type === Type.Circle ?
    { type,
      ...rotatableDefaults(),
      ...baseDefaults(),
      ...circleDefaults(),
      ...coloredDefaults(),
      ...nonStaticDefaults(),
      ...typeSpecificDefaults(type),
    }
  :
  type === Type.Rectangle ?
    { type,
      ...rotatableDefaults(),
      ...baseDefaults(),
      ...rectangleDefaults(),
      ...coloredDefaults(),
      ...nonStaticDefaults(),
      ...typeSpecificDefaults(type),
    }
  :
  { type,
    ...rotatableDefaults(),
    ...baseDefaults(),
    ...rectangleDefaults(),
    ...nonStaticDefaults(),
    ...typeSpecificDefaults(type),
  }


export function decode(xmlNode: XML.Node): Platform {
  let node = xmlNode as Node
  const getAttr = util.makeGetter(node.attributes)
  
  let type = M.withDefault (Type.Wood) (getAttr ("T") (readType))
  let data = defaults(type)
  data.unknownAttributes = Common.getUnknownAttributes(attributes, node.attributes)
  const setProp = util.makeSetter(data as PlatformProps)
  const getProp = util.makeGetter<PlatformProps>(data)

  setProp ("x") (getAttr ("X") (util.readInt))
  setProp ("y") (getAttr ("Y") (util.readInt))
  setProp ("width")  (getAttr ("L") (readDimension))
  setProp ("height") (getAttr ("H") (readDimension))
  setProp ("radius") (getAttr ("L") (readDimension))

  setProp ("tint") (getAttr ("tint") (readTint))

  getAttr ("P") (readDynamicValues, dynamicValues => {
    setProp ("dynamic")         (dynamicValues[0])
    setProp ("mass")            (dynamicValues[1])
    setProp ("friction")        (dynamicValues[2])
    setProp ("restitution")     (dynamicValues[3])
    setProp ("rotation")        (dynamicValues[4])
    setProp ("fixedRotation")   (dynamicValues[5])
    setProp ("linearDamping")   (dynamicValues[6])
    setProp ("angularDamping")  (dynamicValues[7])
  })

  setProp ("gravityScale") (getAttr ("grav") (s => M.withDefault (0) (util.readFloat(s))))

  setProp ("archAcc")       (getAttr ("archAcc") (util.readFloat))
  setProp ("archCheeseMax") (getAttr ("archCheeseMax") (util.readFloat))
  setProp ("archMax")       (getAttr ("archMax") (util.readFloat))
  setProp ("linDampAcc")    (getAttr ("linDampAcc") (util.readFloat))
  setProp ("linDampMax")    (getAttr ("linDampMax") (util.readFloat))
  setProp ("angDampAcc")    (getAttr ("angDampAcc") (util.readFloat))
  setProp ("angDampMax")    (getAttr ("angDampMax") (util.readFloat))

  setProp ("color")  (M.withDefault ("") (getAttr ("o") (readColor)))
  setProp ("vanish") (getAttr ("v") (util.readInt))
  setProp ("lua")    (getAttr ("lua") ())

  setProp ("image") (getAttr ("i") (readImage))

  getAttr ("c") (readCollision, c => {
    setProp ("miceCollision")   (c.miceCollision)
    setProp ("objectCollision") (c.objectCollision)
  })

  setProp ("touchCollision") (getAttr ("col") (() => true))

  setProp ("nosync")      (getAttr ("nosync") (() => true))
  setProp ("foreground")  (getAttr ("N") (() => true))
  setProp ("invisible")   (getAttr ("m") (() => true))

  return data
}


export function encode(data: Platform): Node {
  let node: Node = {
    name: "S",
    children: [],
    attributes: {
      ...undefinedAttributes,
      ...data.unknownAttributes,
    }
  }

  const getProp = util.makeGetter<PlatformProps>(data)
  const setAttr = util.makeSetter(node.attributes)

  setAttr ("T") (getProp ("type") (util.writeInt))

  setAttr ("X") (getProp ("x") (util.writeInt))
  setAttr ("Y") (getProp ("y") (util.writeInt))
  setAttr ("L") (getProp ("width") (util.writeInt))
  setAttr ("H") (getProp ("height") (util.writeInt))
  setAttr ("L") (getProp ("radius") (util.writeInt))

  setAttr ("tint") (getProp ("tint") (util.omitOn("")))

  setAttr ("P") (writeDynamicValues([
    getProp ("dynamic")        (),   
    getProp ("mass")           (), 
    getProp ("friction")       (),     
    getProp ("restitution")    (),       
    getProp ("rotation")       (),     
    getProp ("fixedRotation")  (),         
    getProp ("linearDamping")  (),         
    getProp ("angularDamping") (),           
  ]))

  setAttr ("grav") (getProp ("gravityScale") (util.omitOn (1), util.writeFloat))

  setAttr ("archAcc")       (getProp ("archAcc")       (util.omitOn(waterPhysicsDefaults().archAcc), util.writeFloat))
  setAttr ("archCheeseMax") (getProp ("archCheeseMax") (util.omitOn(waterPhysicsDefaults().archCheeseMax), util.writeFloat))
  setAttr ("archMax")       (getProp ("archMax")       (util.omitOn(waterPhysicsDefaults().archMax), util.writeFloat))
  setAttr ("linDampAcc")    (getProp ("linDampAcc") (util.omitOn(0), util.writeFloat))
  setAttr ("linDampMax")    (getProp ("linDampMax") (util.omitOn(0), util.writeFloat))
  setAttr ("angDampAcc")    (getProp ("angDampAcc") (util.omitOn(0), util.writeFloat))
  setAttr ("angDampMax")    (getProp ("angDampMax") (util.omitOn(0), util.writeFloat))

  setAttr ("c") (M.map(
    (m,o) => util.omitOn ("1") (writeCollision(m,o)),
    getProp ("miceCollision") (),
    getProp ("objectCollision") (),
  ))

  setAttr ("col") (getProp ("touchCollision") (util.omitOn(false), () => ""))

  setAttr ("o")   (getProp ("color")      (util.omitOn("")))
  setAttr ("N")   (getProp ("foreground") (util.omitOn(false), () => ""))
  setAttr ("m")   (getProp ("invisible")  (util.omitOn(false), () => ""))
  setAttr ("nosync") (getProp ("nosync")  (util.omitOn(false), () => ""))
  setAttr ("v")   (getProp ("vanish")     (util.omitOn(0), util.writeInt))
  setAttr ("lua") (getProp ("lua")        (util.omitOn("")))
  setAttr ("i")   (getProp ("image")      (writeImage))

  return node
}

export function readType(str: string): M.Maybe<Type> {
  return M.andThen(
    util.readInt(str),
    x => x >= 0 && x <= 19 ? x : M.None
  )
}

export function readDimension(str: string): M.Maybe<number> {
  return M.map( 
    x => util.clamp(x, 10, 10000),
    util.readInt(str),
  )
}

type DynamicValues = [
  M.Maybe<boolean>, // enabled
  M.Maybe<number>, // mass
  M.Maybe<number>, // friction
  M.Maybe<number>, // restitution
  M.Maybe<number>, // rotation
  M.Maybe<boolean>, // fixedRotation
  M.Maybe<number>, // linearDamping
  M.Maybe<number>, // angularDamping
]
export function readDynamicValues(str: string): DynamicValues {
  let parts = str.split(",")
  return [
    parts.shift() === "1",
    M.andThen(parts.shift(), M.iffDefined, util.readFloat),
    M.andThen(parts.shift(), M.iffDefined, util.readFloat),
    M.andThen(parts.shift(), M.iffDefined, util.readFloat),
    M.andThen(parts.shift(), M.iffDefined, util.readFloat),
    parts.shift() === "1",
    M.andThen(parts.shift(), M.iffDefined, util.readFloat),
    M.andThen(parts.shift(), M.iffDefined, util.readFloat),
  ]
}
export function writeDynamicValues(dynamicValues: DynamicValues): string {
  return [
    M.andThen(dynamicValues[0], util.writeBool),
    M.andThen(dynamicValues[1], util.writeFloat),
    M.andThen(dynamicValues[2], util.writeFloat),
    M.andThen(dynamicValues[3], util.writeFloat),
    M.andThen(dynamicValues[4], util.writeFloat),
    M.andThen(dynamicValues[5], util.writeBool),
    M.andThen(dynamicValues[6], util.writeFloat),
    M.andThen(dynamicValues[7], util.writeFloat),
  ]
  .map(M.withDefault("0"))
  .join(",")
}

// Format: "x,y,url"
export function readImage(str: string): Base["image"] {
  let image = Image.defaults()
  let set = util.makeSetter(image)
  let parts = str.split(",")
  set ("x") (M.andThen(parts.shift(), M.iffDefined, util.readInt))
  set ("y") (M.andThen(parts.shift(), M.iffDefined, util.readInt))
  set ("imageUrl") (M.andThen(parts.shift(), M.iffDefined, Image.readUrl))
  return { enabled: true, ...image }
}
export function writeImage(image: Base["image"]): M.Maybe<string> {
  if(!image.enabled) return M.None
  return [
    util.writeInt(image.x),
    util.writeInt(image.y),
    image.imageUrl.value,
  ].join(",")
}

export function readCollision(str: string): M.Maybe<{ miceCollision: boolean, objectCollision: boolean }> {
  return M.andThen(str, util.readInt, x => {
    if(x == 1 || x == 0) return {
      miceCollision: true,
      objectCollision: true,
    }
    if(x == 2) return {
      miceCollision: false,
      objectCollision: true,
    }
    if(x == 3) return {
      miceCollision: true,
      objectCollision: false,
    }
    return {
      miceCollision: false,
      objectCollision: false,
    }
  })
}
export function writeCollision(miceCollision: boolean, objectCollision: boolean): string {
  let n = 4 - (miceCollision?1:0) - (objectCollision?2:0)
  return n.toString()
}

export function readColor(str: string): M.Maybe<string> {
  if(str === "" || str.match(/^f{8,}$/i)) {
    return str
  }
  return util.readColor(str)
}

export function readTint(str: string): string {
  return M.withDefault ("000000") (util.readColor(str))
}