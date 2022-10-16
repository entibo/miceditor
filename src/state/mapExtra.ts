
import { derived, get } from "svelte/store"

import * as Editor from "data/editor"
import { mapSettings } from "state/map"
import * as sceneObjects from "state/sceneObjects"

const parkourChairId = 19
const parkourChairColor = "329cd2"
const findParkourChair = () => 
  sceneObjects.groups.decorations.find(obj => 
    obj.type == parkourChairId && obj.colors[0].toLowerCase() === parkourChairColor)
const findSnatchSpawn = () => 
  sceneObjects.groups.shamanObjects.find(obj => obj.type == 14)

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
    let chair = Editor.Decoration.defaults(parkourChairId)
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
    if(sceneObjects.groups.shamanObjects.filter(obj => obj.type === 22).length > 1) return false
    if(!findSnatchSpawn()) return false
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
  for(let obj of sceneObjects.groups.shamanObjects.filter(obj => obj.type === 22).slice(1).reverse())
    sceneObjects.remove(obj)
  if(!findSnatchSpawn()) {
    let spawnAnchor = Editor.ShamanObject.defaults(14)
    spawnAnchor.x = 400
    spawnAnchor.y = 200
    sceneObjects.add(Editor.ShamanObject.make(spawnAnchor))
  }
}