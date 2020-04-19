
import * as M from "maybe/Maybe"
import * as XML from "./XML"
import * as util from "./util"
import * as Common from "./Common"
import { deg, rad } from "common"

const attributes = [
  "c", "AMP", "HZ", "M1", "M2", "P1", "P2", "P3", "P4", "A", "AXIS", "LIM1", "LIM2", "MV", "R",
  "f", "C1", "C2" // VC
] as const
const undefinedAttributes = Common.makeUndefinedAttributes(attributes)

export type BaseType = "JD" | "JP" | "JPL" | "JR"
export type Type = BaseType | "VC"

export interface Node extends XML.Node {
  name: Type,
  children: [],
  attributes: Partial<Record<typeof attributes[number], string>>
}

interface Base extends Common.UnknownAttributes {
  platform1: number
  platform2: number
}

export interface Renderable {
  color: string
  thickness: number
  opacity: number
  foreground: boolean
  renderEnabled: boolean
}

interface OptionalPoint extends Point {
  enabled: boolean
}


export type Joint

  = { type: "JD"
      frequency: number
      damping:   number
      point1: OptionalPoint
      point2: OptionalPoint }
    & Base & Renderable

  | { type: "JP"
      axis: Point
      min: number
      max: number
      power: number
      speed: number
      angle: number
      point1: OptionalPoint }
    & Base
    
  | { type: "JR"
      min: number
      max: number
      power: number
      speed: number
      point1: OptionalPoint
      point2: OptionalPoint }
    & Base
    
  | { type: "JPL"
      ratio: number
      point1: OptionalPoint
      point2: OptionalPoint
      point3: Point
      point4: Point }
    & Base & Renderable

  | { type: "VC"
      fineness: number
      point1: Point
      point2: Point
      controlPoint1: Point
      controlPoint2: Point }
    & Base & Renderable

export type JointProps = UnionToIntersection<Joint>

export type PointName = 
  "point1" | "point2" | "point3" | "point4" | "controlPoint1" | "controlPoint2"


const baseDefaults: () => Base = () => ({
  unknownAttributes: {},
  platform1: 0,
  platform2: 0,
})

const renderableDefaults: () => Renderable = () => ({
  color: "ffffff",
  thickness: 1,
  opacity: 1,
  foreground: false,
  renderEnabled: false,
})

const optionalPointDefaults: () => OptionalPoint = () => ({
  x: 0,
  y: 0,
  enabled: false,
})

export const defaults = <T extends Type> (type: T) =>
  <Extract<Joint,{type:T}>>
  ({ ...baseDefaults(),
      ...(
        type === "JD" ?
          { type,
            ...renderableDefaults(),
            frequency: 0,
            damping: 0,
            point1: optionalPointDefaults(),
            point2: optionalPointDefaults(),
          }
        :
        type === "JP" ?
          { type,
            axis: { x: -1, y: 0 },
            min: -Infinity,
            max: +Infinity,
            power: 0,
            speed: 50,
            angle: 0,
            point1: optionalPointDefaults(),
          }
        :
        type === "JR" ?
          { type,
            min: -Infinity,
            max: +Infinity,
            power: 0,
            speed: 45,
            point1: optionalPointDefaults(),
            point2: optionalPointDefaults(),
          }
        :
        type === "JPL" ?
          { type,
            ...renderableDefaults(),
            ratio: 1,
            point1: optionalPointDefaults(),
            point2: optionalPointDefaults(),
            point3: { x: 0, y: 0 },
            point4: { x: 0, y: 0 },
          }
        :
        // type === "VC" ?
          { type,
            ...renderableDefaults(),
            fineness: 10,
            point1:        { x: 0, y: 0 },
            point2:        { x: 0, y: 0 },
            controlPoint1: { x: 0, y: 0 },
            controlPoint2: { x: 0, y: 0 },
          }
      ) 
    })

export function decode(xmlNode: XML.Node): Joint {
  let node = xmlNode as Node
  const getAttr = util.makeGetter(node.attributes)
  
  let type: Type = node.name
  
  let data = defaults(type)
  data.unknownAttributes = Common.getUnknownAttributes(attributes, node.attributes)
  const setProp = util.makeSetter(data as JointProps)
  const getProp = util.makeGetter<JointProps>(data)


  setProp ("platform1") (getAttr ("M1") (util.readInt, M.iff(x => x >= 0)))
  setProp ("platform2") (getAttr ("M2") (util.readInt, M.iff(x => x >= 0)))

  let makeOptional = (p: Point) =>
    type === "VC" ? p as OptionalPoint
                  : {...p, enabled: true}
  setProp ("point1") (getAttr ("P1") (readPoint, makeOptional))
  setProp ("point2") (getAttr ("P2") (readPoint, makeOptional))
  setProp ("point3") (getAttr ("P3") (readPoint))
  setProp ("point4") (getAttr ("P4") (readPoint))


  getAttr ("c") (readRenderValues, values => {
    setProp ("renderEnabled") (true)
    setProp ("color")         (values[0])
    setProp ("thickness")     (values[1])
    setProp ("opacity")       (values[2])
    setProp ("foreground")    (values[3])
  })

  setProp ("angle")     (getAttr ("A")   (util.readFloat, deg))
  setProp ("frequency") (getAttr ("HZ")  (util.readFloat))
  setProp ("damping")   (getAttr ("AMP") (util.readFloat))
  setProp ("ratio")     (getAttr ("R")   (util.readFloat))

  setProp ("axis") (getAttr ("AXIS") (readPoint))


  let minMaxEnabled = !!(node.attributes.LIM1 || node.attributes.LIM2)
  let minMaxTransform = type === "JR" ? deg : (v: number) => v*30

  setProp ("min") (M.withDefault (minMaxEnabled ? 0 : -Infinity) 
    (getAttr ("LIM1") (util.readFloat, minMaxTransform)))
  setProp ("max") (M.withDefault (minMaxEnabled ? 0 : +Infinity) 
    (getAttr ("LIM2") (util.readFloat, minMaxTransform)))


  let speedTransform = type === "JR" ? deg : (v: number) => v*30

  getAttr ("MV") (readPowerSpeed, o => {
    setProp ("power") (o.power)
    setProp ("speed") (M.andThen(o.speed, speedTransform))
  })

  
  setProp ("fineness") (getAttr ("f") (util.readInt, x => Math.max(1, x)))
  setProp ("controlPoint1") (getAttr ("C1") (readPoint))
  setProp ("controlPoint2") (getAttr ("C2") (readPoint))


  return data
}

export function encode(data: Joint): Node {
  let node: Node = {
    name: data.type,
    children: [],
    attributes: {
      ...undefinedAttributes,
      ...data.unknownAttributes,
    }
  }

  let type: Type = node.name

  const getProp = util.makeGetter<JointProps>(data)
  const setAttr = util.makeSetter(node.attributes)
  
  setAttr ("M1") (getProp ("platform1") (util.omitOn(0), util.writeInt))
  setAttr ("M2") (getProp ("platform2") (util.omitOn(0), util.writeInt))

  setAttr ("P1") (getProp ("point1") (M.iff(p => "enabled" in p ? p.enabled : true), writePoint))
  setAttr ("P2") (getProp ("point2") (M.iff(p => "enabled" in p ? p.enabled : true), writePoint))
  setAttr ("P3") (getProp ("point3") (writePoint))
  setAttr ("P4") (getProp ("point4") (writePoint))

  setAttr ("c") (M.andThen(
    getProp ("renderEnabled") (M.iff(x => x === true)),
    () => writeRenderValues([
      getProp ("color")      (),   
      getProp ("thickness")  (),     
      getProp ("opacity")    (),       
      getProp ("foreground") (),             
    ])
  ))

  setAttr ("A")   (getProp ("angle")     (util.omitOn(0), v => (v%360)*Math.PI/180, util.writeFloat))
  setAttr ("HZ")  (getProp ("frequency") (util.omitOn(0), util.writeFloat))
  setAttr ("AMP") (getProp ("damping")   (util.omitOn(0), util.writeFloat))
  setAttr ("R")   (getProp ("ratio")     (util.omitOn(1), util.writeFloat))

  setAttr ("AXIS") (getProp ("axis") (writePoint, util.omitOn("0,0")))


  let minMaxEnabled 
    =  M.is(getProp("min")(M.iff(v => v !== -Infinity))) 
    || M.is(getProp("max")(M.iff(v => v !== Infinity)))
  let minMaxTransform = type === "JR" ? rad : (v: number) => v/30

  if(minMaxEnabled) {
    setAttr ("LIM1") (getProp ("min") (minMaxTransform, util.writeFloat, util.omitOn("0")))
    setAttr ("LIM2") (getProp ("max") (minMaxTransform, util.writeFloat, util.omitOn("0")))
  }

  
  let speedTransform = type === "JR" ? rad : (v: number) => v/30
  
  setAttr ("MV") (M.map(
    (p,s) => p !== 0 ? writePowerSpeed(p,s) : M.None,
    getProp ("power") (),
    getProp ("speed") (speedTransform),
  ))
  

  setAttr ("f") (getProp ("fineness") (util.writeInt))
  setAttr ("C1") (getProp ("controlPoint1") (writePoint))
  setAttr ("C2") (getProp ("controlPoint2") (writePoint))

  return node
}


type RenderValues = [
  M.Maybe<string>,  // color
  M.Maybe<number>,  // thickness
  M.Maybe<number>,  // opacity
  M.Maybe<boolean>, // foreground
]
function readRenderValues(str: string): RenderValues {
  let parts = str.split(",")
  return [
    M.andThen(parts.shift(), M.iffDefined, util.readColor),
    M.andThen(parts.shift(), M.iffDefined, util.readFloat, M.iff(x => x >= 1)),
    M.andThen(parts.shift(), M.iffDefined, util.readFloat),
    M.andThen(parts.shift(), M.iffDefined, util.readBool),
  ]
}
function writeRenderValues(values: RenderValues): string {
  return [
    values[0],
    M.andThen(values[1], util.writeFloat),
    M.andThen(values[2], util.writeFloat),
    M.andThen(values[3], util.writeBool),
  ]
  .join(",")
}

// Format: "p,s"
function readPowerSpeed(str: string) {
  let parts = str.split(",")
  return {
    power: M.andThen(parts.shift(), M.iffDefined, util.readFloat),
    speed: M.andThen(parts.shift(), M.iffDefined, util.readFloat),
  }
}
function writePowerSpeed(power: number, speed: number): string {
  return [
    util.writeFloat(power),
    util.writeFloat(speed),
  ].join(",")
}

function readPoint(str: string): Point {
  let parts = str.split(",")
  return {
    x: M.withDefault (0) (M.andThen(parts.shift(), M.iffDefined, util.readFloat)),
    y: M.withDefault (0) (M.andThen(parts.shift(), M.iffDefined, util.readFloat)),
  }
}
function writePoint({x,y}: Point): string {
  return [
    util.writeFloat(x),
    util.writeFloat(y),
  ].join(",")
}