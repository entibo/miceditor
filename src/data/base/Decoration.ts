
import * as M from "util/Maybe"
import * as XML from "./XML"
import * as util from "./util"
import * as Common from "./Common"

const attributes = [
  "X", "Y", 
  "T", "C", "P", "D", "CT",
] as const
const undefinedAttributes = Common.makeUndefinedAttributes(attributes)

export type Type = number | SpecialType
type SpecialType = "T" | "F" | "DS" | "DC" | "DC2"


export interface Node extends XML.Node {
  name: "P" | SpecialType
  children: []
  attributes: Partial<Record<typeof attributes[number], string>>
}

interface Base extends Common.UnknownAttributes {
  x: number
  y: number
}

export type Decoration

  = { type: number
      foreground: boolean
      reverse: boolean
      colors: string[] }
    & Base

  | { type: "T"
      foreground: boolean
      holeColor: "" | "1" | "2" }
    & Base

  | { type: "F"
      foreground: boolean }
    & Base

  | { type: "DS" | "DC" | "DC2"  }
    & Base

export interface DecorationProps extends Base {
  type: Type
  foreground: boolean
  reverse: boolean
  colors: string[]
  holeColor: "" | "1" | "2"
}


const baseDefaults: () => Base = () => ({
  unknownAttributes: {},
  x: 0,
  y: 0,
})

import metadata from "metadata/decoration"
export const colorDefaults: (t: number) => string[] = type =>
  metadata[type] !== undefined
    ? metadata[type].filters.map(o => o.defaultColor) 
    : []

export const defaults = <T extends Type> (type: T) =>
 <T extends number ? Extract<Decoration,{type:number}> : Extract<Decoration,{type:T}>>
 ({ ...baseDefaults(),
    ...(
      type === "DS" || type === "DC" || type === "DC2" ?
        { type, }
      :
      type === "F" ?
        { type,
          foreground: false }
      :
      type === "T" ?
        { type,
          foreground: false,
          holeColor: "" }
      :
      { type,
        foreground: false,
        reverse: false,
        colors: colorDefaults(type as number) }
    ) 
  })
  


export function decode(xmlNode: XML.Node): Decoration {
  let node = xmlNode as Node
  const getAttr = util.makeGetter(node.attributes)
  
  let type: Type = node.name === "P" 
    ? M.withDefault (0) (getAttr ("T") (readType))
    : node.name
  
  let data = defaults(type)
  data.unknownAttributes = Common.getUnknownAttributes(attributes, node.attributes)
  const setProp = util.makeSetter(data as DecorationProps)
  const getProp = util.makeGetter<DecorationProps>(data)

  setProp ("x") (getAttr ("X") (util.readInt))
  setProp ("y") (getAttr ("Y") (util.readInt))

  setProp ("holeColor")  (getAttr ("CT") (readHoleColor))

  typeof type === "number"
    ? getAttr ("P") (readForegroundReverse, r => {
        setProp ("foreground") (r.foreground)
        setProp ("reverse")    (r.reverse)
      })
    : setProp ("foreground") (getAttr ("D") (() => true))

  setProp ("colors") (getAttr ("C") (
    readColors, 
    userColors =>
      M.andThen( getProp("colors")(),
                 defaultColors => M.merge(defaultColors, userColors))))

  return data
}

export function encode(data: Decoration): Node {
  let node: Node = {
    name: typeof data.type === "number" ? "P" : data.type,
    children: [],
    attributes: {
      ...undefinedAttributes,
      ...data.unknownAttributes,
    }
  }

  const getProp = util.makeGetter<DecorationProps>(data)
  const setAttr = util.makeSetter(node.attributes)

  setAttr ("T") (getProp ("type") (writeType))

  setAttr ("X") (getProp ("x") (util.writeInt))
  setAttr ("Y") (getProp ("y") (util.writeInt))
  
  setAttr ("CT") (getProp ("holeColor") (util.omitOn("")))

  typeof data.type === "number"
    ? setAttr ("P") (M.map(
        (f,r) => writeForegroundReverse(f,r),
        getProp ("foreground") (),
        getProp ("reverse") (),
      ))
    : setAttr ("D") (getProp ("foreground") (util.omitOn(false), () => ""))

  setAttr ("C") (getProp ("colors") (cs => cs.join(","), util.omitOn("")))

  return node
}


export function readType(str: string): M.Maybe<number> {
  return M.andThen(
    util.readInt(str),
    M.iff(x => x >= 0)
  )
}
export function writeType(type: Type): M.Maybe<string> {
  return typeof type === "number"
    ? util.writeInt(type)
    : M.None
}

export function readHoleColor(str: string): M.Maybe<DecorationProps["holeColor"]> {
  switch(str) {
    case "": case "1": case "2": 
      return str
  }
  return M.None
}

// Format: "f,r"
function readForegroundReverse(str: string) {
  let parts = str.split(",")
  return {
    foreground: M.andThen(parts.shift(), M.iffDefined, util.readBool),
    reverse:    M.andThen(parts.shift(), M.iffDefined, util.readBool),
  }
}
function writeForegroundReverse(foreground: boolean, reverse: boolean): string {
  return [
    util.writeBool(foreground),
    util.writeBool(reverse),
  ].join(",")
}

function readColors(str: string): M.Maybe<string>[] {
  return str.split(",").map(util.readColor)
}