
import * as M from "util/Maybe"
import * as XML from "./XML"


export interface UnknownAttributes {
  unknownAttributes: Record<string,string>
}

export function makeUndefinedAttributes(list: readonly string[]) {
  let r: Record<string,undefined> = {}
  for(let k of list) {
    r[k] = undefined
  }
  return r
}

export function getUnknownAttributes(knownList: readonly string[], all: XML.Attributes) {
  let unknown = {} as Record<string,string>
  for(let [k,v] of Object.entries(all)) {
    if(knownList.includes(k)) continue
    if(v === undefined) continue
    unknown[k] = v
  }
  return unknown
}