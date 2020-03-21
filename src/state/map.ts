
import { writable, Writable, derived, get } from "svelte/store"


import * as Editor from "data/editor"


import * as sceneObjects from "state/sceneObjects"
import * as selection from "state/selection"
import * as util from "state/util"
import { store, persistentWritable } from "state/util"
import { clone } from "data/base/util"

import * as history from "state/history"

import xml from "state/xml"


export const mapSettings = store(Editor.MapSettings.defaults())

setTimeout(() => {
  mapSettings.subscribe(history.invalidate)
  importXML(get(xml))
}, 50)

export function importXML(str: string) {
  let map = Editor.Map.parse(str)

  mapSettings.set(map.mapSettings)

  selection.clear()
  sceneObjects.clear()


  for(let image of map.mapSettings.backgroundImages)
    sceneObjects.add(Editor.Image.make(image, false))

  for(let image of map.mapSettings.foregroundImages)
    sceneObjects.add(Editor.Image.make(image, true))

  for(let image of map.mapSettings.disappearingImages)
    sceneObjects.add(Editor.Image.make(image))


  for(let [index,platform] of map.platforms.entries())
    sceneObjects.add(Editor.Platform.make(platform))

  for(let [index,decoration] of map.decorations.entries())
    sceneObjects.add(Editor.Decoration.make(decoration))

  for(let [index,shamanObject] of map.shamanObjects.entries())
    sceneObjects.add(Editor.ShamanObject.make(shamanObject))

  for(let [index,joint] of map.joints.entries())
    sceneObjects.add(Editor.Joint.make(joint))


  if(mapSettings.miceSpawn.type === "multiple") {
    for(let {x,y} of mapSettings.miceSpawn.positions) {
      let mouseSpawn = Editor.Decoration.make(Editor.Decoration.defaults("DS"))
      mouseSpawn.x = x
      mouseSpawn.y = y
      sceneObjects.add(mouseSpawn)
    }
  }
  else if(mapSettings.miceSpawn.type === "random") {
    let [x,y] = mapSettings.miceSpawn.axis === "x"
      ? [-30, mapSettings.miceSpawn.position]
      : [mapSettings.miceSpawn.position, -30]
    let mouseSpawn = Editor.Decoration.make(Editor.Decoration.defaults("DS"))
    mouseSpawn.x = x
    mouseSpawn.y = y
    sceneObjects.add(mouseSpawn)
  }
}

export function exportXML(update=true) {

  mapSettings.disappearingImages = []
  mapSettings.foregroundImages = []
  mapSettings.backgroundImages = []
  for(let image of sceneObjects.groups.images) {
    Editor.Image.isDisappearing(image)
      ? mapSettings.disappearingImages.push(image)
    : image.foreground
      ? mapSettings.foregroundImages.push(image)
      : mapSettings.backgroundImages.push(image)
  }

  let decorations = handleMouseSpawns([...sceneObjects.groups.decorations])

  // let joints = sceneObjects.groups.joints
  for(let platform of sceneObjects.groups.platforms) {
    if("booster" in platform) {
      // Create joints
      // joints.push()
    }
  }

  let map: Editor.Map.Map = {
    mapSettings,
    platforms: sceneObjects.groups.platforms,
    decorations: decorations,
    shamanObjects: sceneObjects.groups.shamanObjects,
    joints: sceneObjects.groups.joints,
  }

  let result = Editor.Map.serialize(map)
  if(update) xml.set(result)
  return result
}

function handleMouseSpawns(decorations: Editor.Decoration.Decoration[]): Editor.Decoration.Decoration[] {
  let [spawns, rest] = 
    decorations.split(Editor.Decoration.isMouseSpawn)

  if(mapSettings.miceSpawn.type === "multiple") {
    mapSettings.miceSpawn.positions =
      spawns.map(({x,y})=>({x,y}))
    return rest
  }

  let spawn = spawns.pop()
  
  if(mapSettings.miceSpawn.type === "normal")
    return spawn
      ? rest.concat(spawn)
      : rest

  let {x,y} = spawn ? spawn : { x: 400, y: 200 }

  mapSettings.miceSpawn.position = 
    mapSettings.miceSpawn.axis === "x" ? y : x

  return rest
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