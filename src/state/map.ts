
import { writable, Writable, derived, get } from "svelte/store"

import * as Map from "data/Map"
import * as MapSettings from "data/MapSettings"
import * as Platform from "data/Platform"
import * as Decoration from "data/Decoration"
import * as ShamanObject from "data/ShamanObject"
import * as Joint from "data/Joint"
import * as SceneObject from "data/SceneObject"

import * as Editor from "editor"


import * as sceneObjects from "state/sceneObjects"
import * as util from "stores/util"
import { store, persistentWritable } from "./util"


export const xml = persistentWritable("xml", "<C></C>")

export const mapSettings = store(MapSettings.defaults())


export function importXML(str: string) {
  let map = Map.parse(str)

  mapSettings.set(map.mapSettings)

  for(let image of map.mapSettings.backgroundImages)
    sceneObjects.add(image)
  for(let image of map.mapSettings.foregroundImages)
    sceneObjects.add(image)
  for(let image of map.mapSettings.disappearingImages)
    sceneObjects.add(image)

  for(let [index,platform] of map.platforms.entries()) {
    sceneObjects.add(Editor.Platform.make(platform))
  }

}

export function exportXML(update=true) {

  mapSettings.disappearingImages = []
  mapSettings.foregroundImages = []
  mapSettings.backgroundImages = []
  for(let image of sceneObjects.groups.images) {
    if(image.APS) 
      mapSettings.disappearingImages.push(image)
    else if(image.foreground) 
      mapSettings.foregroundImages.push(image)
    else
      mapSettings.backgroundImages.push(image)
  }

  let joints = sceneObjects.groups.joints
  for(let platform of sceneObjects.groups.platforms) {
    if("booster" in platform) {
      // Create joints
      // joints.push()
    }
  }

  let map: Map.Map = {
    mapSettings,
    platforms: sceneObjects.groups.platforms,
  }

  let result = Map.serialize(map)
  if(update) xml.set(result)
  return result
}


importXML(get(xml))