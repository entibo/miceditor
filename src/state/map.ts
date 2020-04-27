
import { writable, Writable, derived, get } from "svelte/store"


import * as Editor from "data/editor"
import * as Base from "data/base"
import shamanObjectMetadata from "metadata/shamanObject"


import * as sceneObjects from "state/sceneObjects"
import * as selection from "state/selection"
import * as util from "state/util"
import { store, persistentWritable } from "state/util"
import { clone } from "data/base/util"

import * as history from "state/history"

import { xml } from "state/xml"
import shamanObject from "@/metadata/shamanObject"
import { objectMouseDown } from "./interaction"


export const mapSettings = store(Editor.MapSettings.defaults())

setTimeout(() => {
  mapSettings.subscribe(history.invalidate)
  importXML(get(xml))
}, 50)

function findFirstAvailableId() {
  let id = 0
  let list = mapSettings.layers.map(layer => layer.id).sort()
  while(id < list.length && id === list[id]) 
    id++
  return id
}
export function newLayer() {
  let id = findFirstAvailableId()
  mapSettings.layers.push({
    id,
    name: "",
    opacity: 1,
  })
  mapSettings.currentLayerId = id
  mapSettings.invalidate()
}

export function removeLayer(layerId: number) {
  if(mapSettings.layers.length <= 1) return
  let srcLayerIndex = mapSettings.layers.findIndex(layer => layer.id === layerId)!
  let newId = (mapSettings.layers[srcLayerIndex-1] || mapSettings.layers[srcLayerIndex+1]).id
  sceneObjects.groups.joints
    .filter(obj => obj.layerId === layerId)
    .forEach(obj => {
      obj.layerId = newId
      obj.invalidate()
    })
  mapSettings.layers.splice(srcLayerIndex, 1)
  if(mapSettings.currentLayerId === layerId)
    mapSettings.currentLayerId = newId
  mapSettings.invalidate()
}




/*
  Loads map settings and all objects into memory.
  Platforms need to be added before joints.
*/
export function importXML(str: string) {
  let map = Editor.Map.parse(str)

  mapSettings.set(map.mapSettings)

  selection.clear()
  sceneObjects.clear()


  for(let obj of [map.platforms,map.decorations,map.shamanObjects,map.joints,map.images].flat()) {
    if(obj.ignore) continue
    let store = sceneObjects.add(obj)
    obj.selected && selection.select(store)
  }

}

export function exportXML(update=true) {

  let map: Editor.Map.Map = {
    mapSettings,
    platforms    : [...sceneObjects.groups.platforms],
    decorations  : [...sceneObjects.groups.decorations],
    shamanObjects: [...sceneObjects.groups.shamanObjects],
    joints       : [...sceneObjects.groups.joints],
    images       : [...sceneObjects.groups.images],
  }

  let result = Editor.Map.serialize(map)
  if(update) xml.set(result)
  return result
}




export function updateMiceSpawn(type: "normal"|"multiple"|"randomX"|"randomY") {

  if(type === "randomX" || type === "randomY") {
    mapSettings.miceSpawn = Editor.MapSettings.miceSpawnDefaults("random") as Extract<Editor.MapSettings.MapSettings["miceSpawn"],{type:"random"}>
    mapSettings.miceSpawn.axis = type === "randomX" ? "x" : "y"
  }
  else mapSettings.miceSpawn = Editor.MapSettings.miceSpawnDefaults(type)

  if(type !== "multiple") {
    let spawn
    for(let obj of [...sceneObjects.groups.decorations].reverse())
      if(Editor.Decoration.isMouseSpawn(obj)) {
        spawn = obj
        sceneObjects.remove(obj)
      }
    if(spawn) sceneObjects.add(clone(spawn))
    if(type.startsWith("random")) {
      if(!spawn) {
        spawn = Editor.Decoration.make(Editor.Decoration.defaults("DS"))
        spawn.x = -30
        spawn.y = 200
        spawn = sceneObjects.add(spawn)
      }
    }
  }
  
  mapSettings.invalidate()
}

