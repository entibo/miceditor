
import { writable } from "svelte/store"


import { 
  parseXMLData, xmlDataToString, 
  decodeMapData,
  decodePlatformData, decodeDecorationData, decodeShamanObjectData,
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

let $settings, $platforms, $decorations, $shamanObjects

settings.subscribe(o => {
  decodeMapData(o)
  $settings = o
  validateMiceSpawnSettings()
  $data.children.filter(x => x.name === "P")[0] = $settings
})

platforms.subscribe(list => {
  for(let [index, o] of list.entries()) {
    decodePlatformData(o, index)
  }
  $platforms = list
  $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "S")[0].children
    = $platforms
})

decorations.subscribe(list => {
  for(let [index, o] of list.entries()) {
    decodeDecorationData(o, index)
  }
  $decorations = list
  validateMiceSpawnSettings()
  $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "D")[0].children
  = $decorations
})

shamanObjects.subscribe(list => {
  for(let [index, o] of list.entries()) {
    decodeShamanObjectData(o, index)
  }
  $shamanObjects = list
  $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "O")[0].children
    = $shamanObjects
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

  platforms.set(
    $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "S")[0].children
  )
  for(let o of $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "S")[0].children)
    o._store = platforms

  decorations.set(
    $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "D")[0].children
  )
  for(let o of $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "D")[0].children)
    o._store = decorations

  shamanObjects.set(
    $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "O")[0].children
  )
  for(let o of $data.children.filter(x => x.name === "Z")[0].children.filter(x => x.name === "O")[0].children)
    o._store = shamanObjects

  settings.set(
    $data.children.filter(x => x.name === "P")[0]
  )

  selection.set([])
}

export function buildXML() {
  // console.log("buildXML")
  let v = xmlDataToString($data)
  if(hasXMLNodeChanged($data)) {
    xml.setFromData(v)
  }
}