
import { writable, Writable, derived, get as storeGet } from "svelte/store"

import * as Editor from "editor"
import * as sceneObjects from "stores/sceneObjects"
import { SceneObject } from "stores/sceneObjects"
import * as util from "stores/util"

const blank = util.customStore({})
let selection = new Map<SceneObject, ()=>void>()

export function size(): number {
  return selection.size
}

export function clear() {
  for(let [obj,unsubscribe] of selection.entries()) {
    obj.selected = false
    obj.invalidate()
    unsubscribe()
  }
  selection.clear()
  blank.invalidate()
}
export function set(objs: SceneObject[]) {
  clear()
  selection = new Map(objs.map(obj => [obj, obj.subscribe(blank.invalidate)]))
  selection = new Map()
  for(let obj of objs) {
    obj.selected = true
    let unsubscribe = obj.subscribe(blank.invalidate)
    selection.set(obj, unsubscribe)
  }
  blank.invalidate()
}
export function select(obj: SceneObject) {
  if(selection.has(obj)) return
  obj.selected = true
  selection.set(obj, obj.subscribe(blank.invalidate))
  blank.invalidate()
}
export function unselect(obj: SceneObject) {
  let unsubscribe = selection.get(obj)
  if(!unsubscribe) return
  unsubscribe()
  obj.selected = false
  selection.delete(obj)
  blank.invalidate()
}
export function has(obj: SceneObject): boolean {
  return selection.has(obj)
}
export function getAll(): SceneObject[] {
  return [...selection.keys()]
}

export function remove() {
  for(let unsubscribe of selection.values())
    unsubscribe()
  for(let obj of [...selection.keys()].sort((a,b) => b.index-a.index))
    sceneObjects.remove(obj)
  selection.clear()
  blank.invalidate()
}
export function duplicate() {
  clear()
  for(let obj of selection.keys()) {
    let data = Editor.clone(obj)
    data.index += 1
    let obj2 = sceneObjects.add(data)
    select(obj2)
  }
  move(40, 0)
}


export function move(dx: number, dy: number) {
  for(let obj of selection.keys()) {
    Editor.move(obj, dx, dy)
    obj.invalidate()
  }
}

export function shiftIndex(dz: number) {

}


export const store = derived(blank, getAll)

