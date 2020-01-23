
import { writable, Writable, derived, get as storeGet } from "svelte/store"

import * as Data from "data/Data"
import * as sceneObjects from "stores/sceneObjects"
import { SceneObject, SO } from "stores/sceneObjects"
import * as util from "stores/util"

const blank = util.customStore({})
let selection = new Map<SceneObject, ()=>void>()

export function size(): number {
  return selection.size
}

export function clear() {
  for(let unsubscribe of selection.values()) {
    unsubscribe()
  }
  selection.clear()
  blank.invalidate()
}
export function set(objs: SceneObject[]) {
  clear()
  selection = new Map(objs.map(obj => [obj, obj.subscribe(blank.invalidate)]))
  blank.invalidate()
}
export function select(obj: SceneObject) {
  if(selection.has(obj)) return
  selection.set(obj, obj.subscribe(blank.invalidate))
  blank.invalidate()
}
export function unselect(obj: SceneObject) {
  let unsubscribe = selection.get(obj)
  if(!unsubscribe) return
  unsubscribe()
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
    let dup = sceneObjects.add(obj, { index: obj.index + 1 })
    select(dup)
  }
}


export function move(dx: number, dy: number) {
  for(let obj of selection.keys()) {
    Data.move(obj, dx, dy)
    obj.invalidate()
  }
}

export function shiftIndex(dz: number) {

}





type Intersection = util.UnionToIntersection<SceneObject>
export type Properties = { [K in keyof Intersection]: Intersection[K] | undefined | null }

export const properties = derived(blank, () => {
  let props = {} as Properties
  for(let item of selection.keys()) {
    for(let [_k,v] of Object.entries(item)) {
      let k = _k as keyof Properties
      if(!(k in props)) 
        props[k] = v as any
      else if(props[k] !== v) 
        props[k] = null
    }
  }
  return new Proxy(props, {
    set(_, k, v) {
      for(let item of selection.keys()) {
        if(k in item) {
          (item as any)[k] = v
          item.invalidate()
        }
      }
      return true
    }
  })
})