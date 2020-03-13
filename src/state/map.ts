
import { writable, Writable, derived, get } from "svelte/store"


import * as Editor from "data/editor"


import * as sceneObjects from "state/sceneObjects"
import * as selection from "state/selection"
import * as util from "state/util"
import { store, persistentWritable } from "state/util"


import * as history from "state/history"

import xml from "state/xml"


export const mapSettings = store(Editor.MapSettings.defaults())
mapSettings.subscribe(history.invalidate)

importXML(get(xml))

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
    decorations: sceneObjects.groups.decorations,
    shamanObjects: sceneObjects.groups.shamanObjects,
    joints: sceneObjects.groups.joints,
  }

  let result = Editor.Map.serialize(map)
  if(update) xml.set(result)
  return result
}

