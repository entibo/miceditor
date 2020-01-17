
import * as MapSettings from "data/MapSettings"
import * as Platform from "data/Platform"
import * as Decoration from "data/Decoration"
import * as ShamanObject from "data/ShamanObject"
import * as Joint from "data/Joint"
import * as SceneObject from "data/SceneObject"

import { writable, Writable, derived } from "svelte/store"
import { visibility } from "stores/visibility"


let $sceneObjects = [] as Writable<SceneObject.SceneObject>[]
let { subscribe, set, update } = writable($sceneObjects)
subscribe(list => $sceneObjects = list)

const invalidator = {
  platforms: writable(null),
}


type SetterHandler<T> = (currentValue: T[keyof T], 
                         newValue: T[keyof T]) 
                         => (T[keyof T] | void)
interface WritableWithSetterProxy<T> extends Writable<T> {
  onPropertyChange(key: keyof T, handler: SetterHandler<T>): void
}
function writableWithSetterProxy <T extends object> (obj: T): WritableWithSetterProxy<T> {
  let handlers: { [K in keyof T]?: SetterHandler<T>[] } = {}
  let proxy = new Proxy(obj, {
    set(_, k: keyof T, newValue: T[keyof T]) {
      let currentValue = obj[k]
      let fns: SetterHandler<T>[] | undefined = handlers[k]
      if(fns !== undefined) {
        for(let fn of fns) {
          let v = fn(currentValue, newValue)
          if(v === undefined) continue
          newValue = v
        }
      }
      obj[k] = newValue
      return true
    }
  })

  return {
    ...writable(obj),
    onPropertyChange(k, fn) {
      let fns = handlers[k]
      if(fns === undefined) {
        fns = handlers[k] = []
      }
      fns.push(fn)
    }
  }

}


export function add(obj: SceneObject.SceneObject) {
  update(list => {
    let store = writableWithSetterProxy(obj)
    store.subscribe(() => update(x=>x))
    if(Platform.is(obj)) {
      let s = store as unknown as WritableWithSetterProxy<Platform.Platform>
      /* store.subscribe(() =>
        invalidator.platforms.update(x=>x)) */
      s.onPropertyChange()
    }
    list.push(store)
    return list
  })
}


// export { subscribe }


export const layers = {
  platforms: derived([invalidator.platforms, visibility.platforms], (_, visible) => {
    let r = { background: [], foreground: [] }
    if(!visible) return r
    for(let obj of $sceneObjects) {
      if(!Platform.is(obj)) continue
      if(Platform.isForeground(storeGet(obj))) {
        r.foreground.push(obj)
      } else {
        r.background.push(obj)
      }
    }
    return r
  })
}



