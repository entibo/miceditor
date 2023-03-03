
import { writable, Writable, derived, get } from "svelte/store"


import * as Editor from "data/editor"
import * as Base from "data/base"
import shamanObjectMetadata from "metadata/shamanObject"


import * as sceneObjects from "state/sceneObjects"
import * as selection from "state/selection"
import * as util from "state/util"
import { store, Store, persistentWritable } from "state/util"
import { clone } from "data/base/util"

import * as history from "state/history"

import { xml } from "state/xml"
import shamanObject from "metadata/shamanObject"
import { objectMouseDown } from "./interaction"
import { Layer } from "data/base/MapSettings"


export const mapSettings = store(Editor.MapSettings.defaults())

setTimeout(() => {
  mapSettings.subscribe(history.invalidate)
  importXML(get(xml))
}, 50)



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
    store.selected && selection.select(store)
  }

  for(let animation of mapSettings.animations) {
    for(let frame of animation.frames) {
      if(frame.platform !== null) {
        let store = sceneObjects.groups.platforms[frame.platform]
        store.subscribe(() => frame.platform = store.index)
      }
    }
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
    for(let obj of [...sceneObjects.groups.decorations].reverse()) {
      if(Editor.Decoration.isMouseSpawn(obj)) {
        if(spawn)
          sceneObjects.remove(obj)
        else
          spawn = obj
      }
    }
    if(!spawn && type.startsWith("random")) {
      spawn = Editor.Decoration.make(Editor.Decoration.defaults("DS"))
      spawn.x = -30
      spawn.y = 200
      spawn = sceneObjects.add(spawn)
    }
  }
  
  mapSettings.invalidate()
}

