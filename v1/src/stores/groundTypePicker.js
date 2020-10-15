
import { writable } from "svelte/store"

import { creation } from "./creation.js"

let { subscribe, set, update } = writable(false)

let callback

export const groundTypePicker = {
  subscribe,
  request(cb) {
    set(true)
    creation.set(null)
    callback = cb
  },
  cancelRequest() {
    set(false)
  },
  pick(type) {
    set(false)
    callback(type)
  }
}
