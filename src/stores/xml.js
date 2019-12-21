
import { writable } from "svelte/store"


import { 
  parseXMLData, xmlDataToString, 
  decodeMapData,
  decodePlatformData, decodeDecorationData, decodeShamanObjectData, decodeJointData
} from "/xml-utils.js"

import { selection } from "./selection.js"


const emptyMap = `<C><P /><Z><S /><D /><O /><L /></Z></C>`
const initXML = emptyMap


function hasXMLNodeChanged(node) {
  return node._raw === undefined || node._raw !== node._raw_old
}


let $data

export const settings = writable(null)
export const platforms = writable(null)
export const decorations = writable(null)
export const shamanObjects = writable(null)
export const joints = writable(null)

export const xml = (() => {
  let { subscribe, set, update } = writable(initXML)
  parseXML(initXML)
  return {
    subscribe, update,
    set(v) {
      set(v)
      parseXML(v)
    },
    setFromData(v) {
      set(v)
    }
  }
})()

export const hasChanged = (() => {
  let { subscribe, set, update } = writable(false)
  let initXML = null
  let xmlUnsubscribe = xml.subscribe(v => {
    if(initXML === null) {
      initXML = v
    }
    else if(v !== initXML) {
      set(true)
      xmlUnsubscribe()
    }
  })
  return { subscribe }
})()

let $settings, $platforms, $decorations, $shamanObjects, $joints

settings.subscribe(o => {
  decodeMapData(o)
  $settings = o
  validateMiceSpawnSettings()
  $data.children.filter(x => x.name === "P")[0] = $settings
})

platforms.subscribe(list => {
  for(let [index, o] of list.entries()) {
    o._store = platforms
    decodePlatformData(o, index)
  }
  $platforms = list
  $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "S")[0].children
    = $platforms
})

decorations.subscribe(list => {
  for(let [index, o] of list.entries()) {
    o._store = decorations
    decodeDecorationData(o, index)
  }
  $decorations = list
  validateMiceSpawnSettings()
  $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "D")[0].children
  = $decorations
})

shamanObjects.subscribe(list => {
  for(let [index, o] of list.entries()) {
    o._store = shamanObjects
    decodeShamanObjectData(o, index)
  }
  $shamanObjects = list
  $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "O")[0].children
    = $shamanObjects
})

joints.subscribe(list => {
  for(let [index, o] of list.entries()) {
    o._store = joints
    decodeJointData(o, index)
  }
  $joints = list
  $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "L")[0].children
    = $joints
})


function validateMiceSpawnSettings() {
  if($settings._miceSpawn.type === "normal") return

  let withMiceSpawnsRemoved = $decorations.filter(({name}) => name !== "DS")
  if(withMiceSpawnsRemoved.length !== $decorations.length) {
    decorations.set(withMiceSpawnsRemoved)
  }
  
}


function parseXML(v) {
  // console.log("parseXML")
  $data = parseXMLData(v)

  let C = $data
  let P, Z
  let S, D, O, L

  for(let e of C.children) {
    if(e.name === "P") P = e
    else if(e.name === "Z") Z = e
  }
  if(!P) C.children.push(P = { name: "P", children: [] })
  if(!Z) C.children.push(Z = { name: "Z", children: [] })

  settings.set(P)

  for(let e of Z.children) {
    if(e.name === "S") S = e
    else if(e.name === "D") D = e
    else if(e.name === "O") O = e
    else if(e.name === "L") L = e
  }

  if(!S) Z.children.push(S = { name: "S", children: [] })
  if(!D) Z.children.push(D = { name: "D", children: [] })
  if(!O) Z.children.push(O = { name: "O", children: [] })
  if(!L) Z.children.push(L = { name: "L", children: [] })

  platforms.set(S.children)
  decorations.set(D.children)
  shamanObjects.set(O.children)
  joints.set(L.children)


  selection.set([])
}

export function buildXML() {
  // console.log("buildXML")
  let v = xmlDataToString($data)
  if(hasXMLNodeChanged($data)) {
    xml.setFromData(v)
  }
}