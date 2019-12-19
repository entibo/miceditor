
import { writable, get as storeGet } from "svelte/store"

import { selection } from "./selection.js"
import { settings, platforms, decorations, shamanObjects, joints, buildXML } from "./xml.js"
import { jointPalette } from "/stores/stores.js"

import { decodeObjectData, encodeObjectData } from "../xml-utils.js"


let { subscribe, set, update } = writable(null)

let $creation
subscribe(v => $creation = v)



export const creation = {
  subscribe, set, update,
  setFromType(objectType, type) {
    type = type.toString()
    let object = {
      children: [],
      X: "0",
      Y: "0",
    }
    if(objectType === "shamanObject") {
      object.name = "O"
      object.C = type
    }
    else if(objectType === "decoration") {
      if(["F","T","DS","DC","DC2"].includes(type)) {
        object.name = type
      }
      else {
        object.name = "P"
        object.T = type
      }
    }
    else if(objectType === "platform") {
      object.name = "S"
      object.T = type
      object.X = "20"
      object.Y = "20"
      object.L = "40"
      object.H = "40"
      if(type === "12" || type === "13") {
        object.o = "324650"
      }
      if(type === "13") {
        object.L = object.H = "20"
      }
      object.P = ","
    }
    else if(objectType === "joint") {
      let data = {...storeGet(jointPalette)[type]}
      delete object.X
      delete object.Y
      object.name = "JD"
      object.c = "..."
      object._objectType = "joint"
      object._color = data.color
      object._thickness = data.thickness
      object._opacity = data.opacity
      object._foreground = data.foreground
      encodeObjectData(object)
      object.P1 = "0,0"
      object.P2 = "0,0"
    }
    else {
      throw "Cannot create unknown object type: "+objectType+" / "+type
    }

    decodeObjectData(object)
    set({
      objectType, type, object
    })
  },
  rotate(da) {
    if($creation.object._rotation === undefined) return
    $creation.object._rotation += da
    update(v => v)
  },
  create({ x, y, width, height }, mousePosition) {
    let object = Object.assign({}, $creation.object)
    object.__isNew = true
    object._x = Math.round(x)
    object._y = Math.round(y)
    if($creation.objectType === "platform") {
      if($creation.type === "13") {
        width /= 2
        height /= 2
      }
      object._width = Math.round(width)
      object._height = Math.round(height)
    }
    encodeObjectData(object)
    let store = [platforms, decorations, shamanObjects, joints][["platform","decoration","shamanObject","joint"].indexOf($creation.objectType)]
    object._store = store
    if(object.name === "DS" && storeGet(settings)._miceSpawn.type !== "multiple") {
      store.update(list => list.filter(({name}) => name !== "DS"))
    }
    if(object.name === "DC") {
      store.update(list => list.filter(({name}) => name !== "DC"))
    }
    if(object.name === "DC2") {
      store.update(list => list.filter(({name}) => name !== "DC2"))
    }
    store.update(list => [...list, object])
    selection.set([object])
    buildXML()
  }
}