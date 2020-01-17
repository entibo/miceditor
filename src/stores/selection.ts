
import { writable, Writable, derived, get as storeGet } from "svelte/store"

import * as SceneObject from "data/SceneObject"


let { subscribe, set, update } = writable([] as Writable<SceneObject.SceneObject>[])


export function move(dx: number, dy: number) {
  update(stores => {
    stores.forEach(store =>
      store.update(sceneObject => {
        SceneObject.move(sceneObject, dx, dy)
        return sceneObject
      }))
    return stores
  })
}