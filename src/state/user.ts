
import { writable } from "svelte/store"

import { store } from "state/util"
import { persistentWritable } from "state/util"

import * as Editor from "data/editor"

import "state/bot"

export const showGameGUI = persistentWritable("showGameGUI", true)
export const showMapBorder = persistentWritable("showMapBorder", true)
export const showDeathBorder = persistentWritable("showDeathBorder", true)
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


export const colorPalette = persistentWritable("colorPalette", [
  {color: "6A7495"},
  {color: "324650"},
  {color: "9BAABC"},
  {color: "89A7F5"},
  {color: "D84801"},
  {color: "6D4E94"},
  {color: "2E190C"},
  {color: "6A839C"},
  {color: "757F96"},
])


export const currentVersion = "2.3.4"
export const previousVersion = localStorage.getItem("version")
localStorage.setItem("version", currentVersion)