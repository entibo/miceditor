
import { writable } from "svelte/store"

import { store } from "state/util"
import { persistentWritable } from "state/util"

import * as Editor from "data/editor"

export const showGameGUI = persistentWritable("showGameGUI", true)
export const showMapBorder = persistentWritable("showMapBorder", true)
export const showInvisibleGrounds = persistentWritable("showInvisibleGrounds", true)
export const showMechanics = persistentWritable("showMechanics", true)
export const highQuality = persistentWritable("highQuality", true)

export const screenshotUpload = persistentWritable("screenshotUpload", true)

export const grid = persistentWritable("grid", {
  enabled: false,
  widthHeightLinked: true,
  width: 40, height: 40,
  sticky: false,
  color: "3D4253",
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
  curveToolEnabled: boolean
  fineness: number
}
export const brushDefaults: () => Brush = () => 
  ({
    color: "ffffff",
    thickness: 10,
    opacity: 0.9,
    foreground: false,
    curveToolEnabled: false,
    fineness: 6
  })
export const brushPalette = persistentWritable("brushPalette", [brushDefaults()])



export const imagePalette = persistentWritable("imagePalette", [Editor.Image.readUrl("x_transformice/x_inventaire/17.jpg")])


export const currentVersion = "2.0.30"
export const previousVersion = localStorage.getItem("version")
localStorage.setItem("version", currentVersion)