
import { writable } from "svelte/store"

import { debounce } from "common"

import { importXML, exportXML } from "state/map"
import { xml } from "state/xml"

export const invalidate = () => debounce(exportXML, 100)

export const canUndo = writable(false)
export const canRedo = writable(false)


let stack: string[] = []
let stackIndex = -1

function printStack(action = "INIT") {
  return
  let s = `${action}  -  Stack[${stackIndex}/${stack.length-1}]: `
  if(stackIndex < 0)
    s += "(+) " + "- ".repeat(stack.length)
  else
    s += "( ) " + "- ".repeat(stackIndex) + "+ " + "- ".repeat(stack.length-stackIndex-1)
  console.log(s)
  console.log(stack[stackIndex])
  console.log("")
}
printStack()

function push(value: string) {
  if(value === stack[stackIndex]) return
  stackIndex++
  stack = stack.slice(0, stackIndex)
  stack.push(value)
  updateStores()
  printStack("PUSH")
}
xml.subscribe(push)

export function undo() {
  // synchronize()
  if(stackIndex <= 0) return
  importXML(stack[--stackIndex])
  updateStores()
  printStack("UNDO")
}

export function redo() {
  // synchronize()
  if(stackIndex >= stack.length-1) return
  importXML(stack[++stackIndex])
  updateStores()
  printStack("REDO")
}

function synchronize() {
  let value = exportXML(false)
  if(value === stack[stackIndex]) return
  push(value)
}

function updateStores() {
  canUndo.set(stackIndex > 0)
  canRedo.set(stackIndex < stack.length-1)
}



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
anyActivity.subscribe(v => {
  if(v !== true) return
  window.onbeforeunload = function() {
    if(!confirm("Exit ?")) return false
    return true
  }
})