
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
import shamanObject from "@/metadata/shamanObject"
import { objectMouseDown } from "./interaction"
import { Layer } from "data/base/MapSettings"


export const mapSettings = store(Editor.MapSettings.defaults())

setTimeout(() => {
  mapSettings.subscribe(history.invalidate)
  importXML(get(xml))
}, 50)



function findFirstAvailableId() {
  let id = 0
  let list = mapSettings.animations.map(animation => animation.id)
    .concat( mapSettings.layers.map(layer => layer.id) )
    .sort((a,b) => a-b)
  while(id < list.length && id === list[id]) 
    id++
  return id
}
export function makeNewLayer(index?: number) {
  let newLayer = {
    id: findFirstAvailableId(),
    name: "",
    opacity: 1,
  }
  if(index !== undefined)
    mapSettings.layers = [...mapSettings.layers.slice(0,index), newLayer, ...mapSettings.layers.slice(index)]
  else
    mapSettings.layers.push(newLayer)
  mapSettings.currentLayerId = newLayer.id
  mapSettings.invalidate()
  return newLayer
}

export function removeLayer(layerId: number) {
  if(mapSettings.layers.length <= 1) return

  sceneObjects.groups.joints
    .filter(obj => obj.layerId === layerId)
    .forEach(sceneObjects.remove)

  let srcLayerIndex = mapSettings.layers.findIndex(layer => layer.id === layerId)!

  if(mapSettings.currentLayerId === layerId) {
    let newId = (mapSettings.layers[srcLayerIndex-1] || mapSettings.layers[srcLayerIndex+1]).id
    mapSettings.currentLayerId = newId
  }
  
  mapSettings.layers.splice(srcLayerIndex, 1)
  mapSettings.invalidate()
}

export function duplicateLayer(layerId: number) {
  let srcLayerIndex = mapSettings.layers.findIndex(layer => layer.id === layerId)
  if(srcLayerIndex < 0) return
  let srcName = mapSettings.layers[srcLayerIndex].name
  let newLayer = makeNewLayer(srcLayerIndex+1)
  if(srcName) newLayer.name = srcName + " - Copy"
  let toBeDuplicated = sceneObjects.groups.joints.filter(obj => obj.layerId === layerId)
  if(!toBeDuplicated.length)
    return newLayer
  let duplicates = [] as Store<Editor.Joint.Joint>[]
  let lastIndex = toBeDuplicated[toBeDuplicated.length-1].index
  for(let k=0; k < toBeDuplicated.length; k++) {
    let joint = clone(toBeDuplicated[k])
    joint.layerId = newLayer.id
    joint.selected = false
    duplicates.push(
      sceneObjects.add(joint, lastIndex+1+k)
    )
  }
  selection.set(duplicates)
  return newLayer
}


export function makeNewAnimation(index?: number) {
  let frame0 = makeNewLayer()
  mapSettings.animations.push({
    id: findFirstAvailableId(),
    name: "",
    type: "circular",
    frames: [{
      duration: 300,
      layerId: frame0.id,
    }]
  })
  mapSettings.invalidate()
}

export function removeAnimation(animationId: number) {
  let srcAnimationIndex = mapSettings.animations.findIndex(animation => animation.id === animationId)!
  let animation = mapSettings.animations[srcAnimationIndex]
  animation.frames.map(frame => frame.layerId).forEach(removeLayer)

  mapSettings.animations.splice(srcAnimationIndex, 1)
  mapSettings.invalidate()
}

export function addAnimationFrame(animationId: number) {
  let animation = mapSettings.animations.find(animation => animation.id === animationId)!
  let lastFrame = animation.frames[animation.frames.length-1]
  let lastFrameLayerIndex = mapSettings.layers.findIndex(layer => layer.id === lastFrame.layerId)!
  let newLayer = makeNewLayer(lastFrameLayerIndex+1)
  animation.frames.push({
    layerId: newLayer.id,
    duration: lastFrame.duration,
  })
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

