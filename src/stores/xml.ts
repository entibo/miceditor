
import { writable, Writable, derived } from "svelte/store"

import * as Map from "data/Map"
import * as MapSettings from "data/MapSettings"
import * as Platform from "data/Platform"
import * as Decoration from "data/Decoration"
import * as ShamanObject from "data/ShamanObject"
import * as Joint from "data/Joint"


export const sMapSettings   = writable(MapSettings.defaults())
export const sPlatforms     = writable([] as Platform.Platform[])
export const sDecorations   = writable([] as Decoration.Decoration[])
export const sShamanObjects = writable([] as ShamanObject.ShamanObject[])
export const sJoints        = writable([] as Joint.Joint[])

export const sXml = writable(1)







export const sVisiblePlatforms
  = derived([sPlatformList, visibility.sPlatform], (sPlatforms, visible) => {
      let r = { background: [], foreground: [] }
      if(!visible) return r
      for(let sPlatform of sPlatforms) {
        if(Platform.isForeground(storeGet(sPlatform))) {
          r.foreground.push(sPlatform)
        } else {
          r.background.push(sPlatform)
        }
      }
    })





function importXML(str: string) {
  let map = Map.parse(str)


}

function exportXML() {

}