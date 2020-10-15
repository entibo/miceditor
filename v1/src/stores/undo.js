
import { debounce } from "../utils.js"

import { writable } from "svelte/store"

import { xml } from "./xml.js"
import { selection } from "./selection.js"


export const canUndo = writable(false)
export const canRedo = writable(false)

let $xml

let xmlStackLimit = 512
let xmlStack = []
let xmlStackIndex = -1
let debounceTime = 100

function push() {
  if(xmlStackIndex >= 0 && xmlStack[xmlStackIndex] === $xml) {
    return
  }
  debounce(actuallyPushXML, debounceTime)
}
function actuallyPushXML() {
  xmlStack = xmlStack.slice(0, xmlStackIndex+1)
  xmlStack.push($xml)
  xmlStackIndex++
  if(xmlStack.length > xmlStackLimit) {
    xmlStackIndex--
    xmlStack.shift()
  }
  if(xmlStackIndex > 0) canUndo.set(true)
  canRedo.set(false)
}

xml.subscribe(v => {
  $xml = v
  push()
})

export function undo() {
  if(xmlStackIndex <= 0) return
  xml.set(xmlStack[--xmlStackIndex])
  selection.set([])
  if(xmlStackIndex <= 0) canUndo.set(false)
  canRedo.set(true)
}
export function redo() {
  if(xmlStackIndex >= xmlStack.length-1) return
  xml.set(xmlStack[++xmlStackIndex])
  selection.set([])
  if(xmlStackIndex >= xmlStack.length-1) canRedo.set(false)
  canUndo.set(true)
}