
import { writable, Writable, derived } from "svelte/store"

import * as Map from "data/Map"
import * as MapSettings from "data/MapSettings"
import * as Platform from "data/Platform"
import * as Decoration from "data/Decoration"
import * as ShamanObject from "data/ShamanObject"
import * as Joint from "data/Joint"
import * as SceneObject from "data/SceneObject"

import * as sceneObjects from "stores/sceneObjects"
import * as util from "stores/util"




export const mapSettings = util.customStore(MapSettings.defaults())


function importXML(str: string) {
  let map = Map.parse(str)

  mapSettings.set(map.mapSettings)

  for(let image of map.mapSettings.backgroundImages)
    sceneObjects.add(image)
  for(let image of map.mapSettings.foregroundImages)
    sceneObjects.add(image)
  for(let image of map.mapSettings.disappearingImages)
    sceneObjects.add(image)

  for(let [index,platform] of map.platforms.entries()) {
    sceneObjects.add(platform)
  }

}

function exportXML(): string {

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

  return Map.serialize(map)

}