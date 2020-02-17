
import { writable } from "svelte/store"

import { selection } from "../state/selection.js"

const { subscribe, set, update } = writable({
  basic: true,
  grounds: true,
  decorations: true,
  objects: true,
  joints: true,
  backgroundImages: true,
  foregroundImages: true,
  disappearingImages: true,
})

export const visibility = {
  subscribe,
  toggle(which) {
    update(v => {
      v[which] = !v[which]
      if(v[which] === false) {
        selection.unselectGroup(which)
      }
      return v
    })
  }
}

export const highlightedObject = writable(null)