
import { derived, get } from "svelte/store"

import * as Editor from "data/editor"
import { mapSettings } from "state/map"
import * as sceneObjects from "state/sceneObjects"
import { Anchor } from "data/base/ShamanObject"

const parkourChairId = 19
const parkourChairColor = "329cd2"
const findParkourChair = () => 
  sceneObjects.groups.decorations.find(obj => 
    obj.type == parkourChairId && obj.colors[0].toLowerCase() === parkourChairColor)  

export const parkourMode = derived(
  [ 
    mapSettings, 
    sceneObjects.groups.decorations,
    sceneObjects.groups.shamanObjects,
  ], () => {
    if(mapSettings.width !== 1600) return false
    if(mapSettings.height !== 800) return false
    if(mapSettings.defilante.enabled) return false
    if(sceneObjects.groups.decorations.find(obj => obj.type === "T")) return false
    if(!findParkourChair()) return false
    if(get(snatchMode)) return false
    return true
  }
)
export function setParkourMode() {
  if(get(parkourMode)) return
  if(get(snatchMode)) return
  mapSettings.defilante.enabled = false
  mapSettings.width = 1600
  mapSettings.height = 800
  mapSettings.invalidate()
  for(let hole of sceneObjects.groups.decorations.filter(obj => obj.type === "T").reverse())
    sceneObjects.remove(hole)
  if(!findParkourChair()) {
    const chair = Editor.Decoration.defaults(parkourChairId)
    chair.colors[0] = parkourChairColor
    chair.x = 400
    chair.y = 200
    sceneObjects.add(Editor.Decoration.make(chair))
  }
}

export const snatchMode = derived(
  [ 
    mapSettings, 
    sceneObjects.groups.decorations,
    sceneObjects.groups.shamanObjects,
  ], () => {
    if(mapSettings.defilante.enabled) return false
    if(sceneObjects.groups.decorations.find(obj => obj.type === "T" || obj.type === "F")) return false
    if(sceneObjects.groups.shamanObjects.filter(obj => obj.type === Anchor.Yellow).length !== 1) return false
    if(sceneObjects.groups.shamanObjects.filter(obj => obj.type === Anchor.Green).length !== 1) return false
    if(sceneObjects.groups.shamanObjects.filter(obj => obj.type === Anchor.RedClockwise).length < 4) return false
    if(get(parkourMode)) return false
    return true
  }
)
export function setSnatchMode() {
  if(get(snatchMode)) return
  if(get(parkourMode)) return
  mapSettings.defilante.enabled = false
  mapSettings.invalidate()
  for(let decoration of sceneObjects.groups.decorations.filter(obj => obj.type === "T" || obj.type === "F").reverse())
    sceneObjects.remove(decoration)
  for(let obj of sceneObjects.groups.shamanObjects.filter(obj => obj.type === Anchor.Yellow).slice(1).reverse())
    sceneObjects.remove(obj)
  for(let obj of sceneObjects.groups.shamanObjects.filter(obj => obj.type === Anchor.Green).slice(1).reverse())
    sceneObjects.remove(obj)

  const add = (type, x, y) => {
    const anchor = Editor.ShamanObject.defaults(type)
    anchor.x = x
    anchor.y = y
    sceneObjects.add(Editor.ShamanObject.make(anchor))
  }

  if(!sceneObjects.groups.shamanObjects.find(obj => obj.type === Anchor.Green))
    add(Anchor.Green, 380, 180)
  if(!sceneObjects.groups.shamanObjects.find(obj => obj.type === Anchor.Yellow))
    add(Anchor.Yellow, 420, 180)
  const numRedAnchors = sceneObjects.groups.shamanObjects.filter(obj => obj.type === Anchor.RedClockwise).length
  for(let i=0; i < 4 - numRedAnchors; i++)
    add(Anchor.RedClockwise, 340+i*40, 220)
}