
import { derived, get } from "svelte/store"

import * as Editor from "data/editor"
import { mapSettings } from "state/map"
import * as sceneObjects from "state/sceneObjects"

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
    return true
  }
)
export function setParkourMode() {
  if(get(parkourMode)) return
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