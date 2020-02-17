
import { writable } from "svelte/store"

import { xml, importXML, exportXML } from "state/map"


export const anyActivity = writable(false)
{
  let initXMLValue: string
  let unsubscribe = xml.subscribe(value => {
    if(initXMLValue === undefined) {
      initXMLValue = value
      return
    }
    if(value === initXMLValue)
      return
    anyActivity.set(true)
    unsubscribe()
  })
}


let stack: string[] = []
let stackIndex = -1

function push(value: string) {
  stack = stack.slice(0, ++stackIndex)
  stack.push(value)
}
xml.subscribe(push)

export function undo() {
  synchronize()
  if(stackIndex <= 0) return
  importXML(stack[--stackIndex])
  updateStores()
}

export function redo() {
  synchronize()
  if(stackIndex >= stack.length-1) return
  importXML(stack[++stackIndex])
  updateStores()
}

function synchronize() {
  let value = exportXML(false)
  if(value === stack[stackIndex]) return
  push(value)
}

export const canUndo = writable(false)
export const canRedo = writable(false)
function updateStores() {
  canUndo.set(stackIndex > 0)
  canRedo.set(stackIndex < stack.length-1)
}