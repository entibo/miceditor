
import { writable, Writable, derived, get as storeGet } from "svelte/store"

import * as Editor from "data/editor"
import * as sceneObjects from "state/sceneObjects"
import { SceneObject } from "state/sceneObjects"
import { store, Store } from "state/util"

import * as selection from "state/selection"


export const platformProps = derived(selection.selection, all => {

  let platforms = all.filter(Editor.isPlatform) as Store<Editor.Platform.Platform>[]

  let {data, auto} = makeGetSet(platforms)


  auto("x")
  auto("y")
  auto("invisible")
  auto("lua")
  auto("nosync")


  return data

})

const makeGetSet = <A> (list: Store<A>[]) => {

  function getValue(...keys: string[]) {
    let values = []
    P: for(let obj of list) {
      let o = obj as any
      for(let k of keys) {
        if(!(k in o)) continue P
        o = o[k]
      }
      values.push(o)
    }
    return combine(values)
  }

  function setValue(v: any, ...keys: string[]) {
    console.log("setValue", v, keys)
    let lastKey = keys.pop() as string
    P: for(let obj of list) {
      let o = obj as any
      for(let k of keys) {
        if(!(k in o)) continue P
        o = o[k]
      }
      if(!(lastKey in o)) continue P
      o[lastKey] = v
      obj.invalidate()
    }
  }

  let data = {} as any

  function auto(alias: string, keys: string[] = [], ) {
    if(!keys.length) keys = [alias]
    Object.defineProperty(data, alias, {
      get()  { return getValue(...keys) },
      set(v) { setValue(v, ...keys) },
    })
  }

  return {data, auto}

}

/* 
  - No values: undefined
  - All values are the same: value
  - Not all values are the same: null
*/
function combine<T>(values: T[]): T | null | undefined {
  let value = undefined
  for(let x of values) {
    if(value === undefined) value = x
    else if(value !== x) return null
  }
  return value
}