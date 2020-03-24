
import { writable } from "svelte/store"

import { store } from "state/util"
import { persistentWritable } from "state/util"

export const showGameGUI = persistentWritable("showGameGUI", true)
export const showMapBorder = persistentWritable("showMapBorder", true)
export const showInvisibleGrounds = persistentWritable("showInvisibleGrounds", true)
export const parkour = persistentWritable("parkour", false)

export const grid = persistentWritable("grid", {
  enabled: false,
  width: 40, height: 40,
  sticky: false,
  color: "0e0e0e",
})

export const zoom = (() => {
  let {subscribe, set, update} = writable(1)
  let clamp = (v: number) => {
    v = Math.max(0.1, Math.min(500, v))
    v = Math.round(100*v)/100
    return v
  }
  return { 
    subscribe,
    set(v: number) { set(clamp(v)) },
    update(f: (v: number) => number) { update(v => clamp(f(v))) },
  }
})()


export interface Brush {
  color: string
  thickness: number
  opacity: number
  foreground: boolean
}
export const brushDefaults: () => Brush = () => 
  ({
    color: "ffffff",
    thickness: 10,
    opacity: 0.9,
    foreground: false,
  })
export const brushPalette = persistentWritable("brushPalette", [brushDefaults()])

export const curveTool = store({
  enabled: false,
  fineness: 10,
})


export const firstVisit = false === Boolean(localStorage.getItem("firstVisit"))
localStorage.setItem("firstVisit", "firstVisit")


/* const { subscribe, set, update } = writable({
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
} */