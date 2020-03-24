
import * as M from "util/Maybe"
import * as XML from "./XML"
import * as util from "./util"
import * as Common from "./Common"

const attributes = [
  "c", "AMP", "HZ", "M1", "M2", "P1", "P2", "P3", "P4", "A", "AXIS", "LIM1", "LIM2", "MV", "R",
  "f", "C1", "C2" // VC
] as const
const undefinedAttributes = Common.makeUndefinedAttributes(attributes)

type Type = "JD" | "JP" | "JPL" | "JR" | "VC"

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
      limit1: number
      limit1Enabled: boolean
      limit2: number
      limit2Enabled: boolean
      power: number
      speed: number
      angle: number
      point1: OptionalPoint }
    & Base
    
  | { type: "JR"
      limit1: number
      limit1Enabled: boolean
      limit2: number
      limit2Enabled: boolean
      power: number
      speed: number
      point1: OptionalPoint
      point2: OptionalPoint }
    & Base
    
  | { type: "JPL"
      ratio: number
      point1: OptionalPoint
      point2: OptionalPoint
      point3: OptionalPoint
      point4: OptionalPoint }
    & Base & Renderable

  | { type: "VC"
      fineness: number
      point1: Point
      point2: Point
      controlPoint1: Point
      controlPoint2: Point }
    & Renderable & Common.UnknownAttributes

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

export const defaults: (t: Type) => Joint = type =>
  type === "VC" ?
    { type,
      ...renderableDefaults(),
      fineness: 10,
      point1:        { x: 0, y: 0 },
      point2:        { x: 0, y: 0 },
      controlPoint1: { x: 0, y: 0 },
      controlPoint2: { x: 0, y: 0 },
      unknownAttributes: {},
    }
  :
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
            axis: { x: 0, y: 0 },
            limit1: 0,
            limit1Enabled: false,
            limit2: 0,
            limit2Enabled: false,
            power: 0,
            speed: 5,
            angle: 0,
            point1: optionalPointDefaults(),
          }
        :
        type === "JR" ?
          { type,
            limit1: 0,
            limit1Enabled: false,
            limit2: 0,
            limit2Enabled: false,
            power: 0,
            speed: 5,
            point1: optionalPointDefaults(),
            point2: optionalPointDefaults(),
          }
        :
          { type,
            ...renderableDefaults(),
            ratio: 1,
            point1: optionalPointDefaults(),
            point2: optionalPointDefaults(),
            point3: optionalPointDefaults(),
            point4: optionalPointDefaults(),
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

  setProp ("point1") (getAttr ("P1") (readPoint, p => ({...p, enabled: true})))
  setProp ("point2") (getAttr ("P2") (readPoint, p => ({...p, enabled: true})))
  setProp ("point3") (getAttr ("P3") (readPoint, p => ({...p, enabled: true})))
  setProp ("point4") (getAttr ("P4") (readPoint, p => ({...p, enabled: true})))

  getAttr ("c") (readRenderValues, values => {
    setProp ("renderEnabled") (true)
    setProp ("color")         (values[0])
    setProp ("thickness")     (values[1])
    setProp ("opacity")       (values[2])
    setProp ("foreground")    (values[3])
  })

  getAttr ("MV") (readPowerSpeed, o => {
    setProp ("power") (o.power)
    setProp ("speed") (o.speed)
  })

  setProp ("angle")     (getAttr ("A")   (util.readFloat, v => (v*180/Math.PI)%360))
  setProp ("frequency") (getAttr ("HZ")  (util.readFloat))
  setProp ("damping")   (getAttr ("AMP") (util.readFloat))
  setProp ("ratio")     (getAttr ("R")   (util.readFloat))

  setProp ("axis") (getAttr ("AXIS") (readPoint))

  getAttr ("LIM1") (util.readFloat, v => {
    setProp ("limit1Enabled") (true)
    setProp ("limit1") (v * 30)
  })
  getAttr ("LIM2") (util.readFloat, v => {
    setProp ("limit2Enabled") (true)
    setProp ("limit2") (v * 30)
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

  const getProp = util.makeGetter<JointProps>(data)
  const setAttr = util.makeSetter(node.attributes)
  
  setAttr ("M1") (getProp ("platform1") (util.omitOn(0), util.writeInt))
  setAttr ("M2") (getProp ("platform2") (util.omitOn(0), util.writeInt))

  setAttr ("P1") (getProp ("point1") (M.iff(p => "enabled" in p ? p.enabled : true), writePoint))
  setAttr ("P2") (getProp ("point2") (M.iff(p => "enabled" in p ? p.enabled : true), writePoint))
  setAttr ("P3") (getProp ("point3") (M.iff(p => p.enabled), writePoint))
  setAttr ("P4") (getProp ("point4") (M.iff(p => p.enabled), writePoint))

  setAttr ("c") (M.andThen(
    getProp ("renderEnabled") (x => x === true),
    () => writeRenderValues([
      getProp ("color")      (),   
      getProp ("thickness")  (),     
      getProp ("opacity")    (),       
      getProp ("foreground") (),             
    ])
  ))

  setAttr ("MV") (M.map(
    (p,s) => p !== 0 ? writePowerSpeed(p,s) : M.None,
    getProp ("power") (),
    getProp ("speed") (),
  ))
  
  setAttr ("A")   (getProp ("angle")     (util.omitOn(0), v => (v%360)*Math.PI/180, util.writeFloat))
  setAttr ("HZ")  (getProp ("frequency") (util.omitOn(0), util.writeFloat))
  setAttr ("AMP") (getProp ("damping")   (util.omitOn(0), util.writeFloat))
  setAttr ("R")   (getProp ("ratio")     (util.omitOn(1), util.writeFloat))

  setAttr ("AXIS") (getProp ("axis") (writePoint, util.omitOn("0,0")))

  setAttr ("LIM1") (M.andThen(
    getProp ("limit1Enabled") (x => x === true),
    () => getProp ("limit1") (v => v / 30, util.writeFloat)
  ))
  setAttr ("LIM2") (M.andThen(
    getProp ("limit2Enabled") (x => x === true),
    () => getProp ("limit2") (v => v / 30, util.writeFloat)
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
    M.andThen(parts.shift(), M.iffDefined, util.readFloat),
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
  console.log(power, speed)
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