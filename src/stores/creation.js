
import { writable, get as storeGet } from "svelte/store"

import { selection } from "./selection.js"
import { settings, platforms, decorations, shamanObjects, joints, buildXML } from "./xml.js"
import { jointPalette, drawingData } from "/stores/stores.js"

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
      let { curveToolEnabled, curveToolFineness } = storeGet(drawingData)
      let data = {...storeGet(jointPalette)[type]}
      delete object.X
      delete object.Y
      if(curveToolEnabled) {
        object.name = object._type = "VC"
        object._fineness = curveToolFineness
      }
      else {
        object.name = object._type = "JD"
      }
      object.c = "..."
      object._objectType = "joint"
      object._color = data.color
      object._thickness = data.thickness
      object._opacity = data.opacity
      object._foreground = data.foreground
      encodeObjectData(object)
      object.P1 = "0,0"
      object.P2 = "0,0"
      if(curveToolEnabled) {
        object.C1 = "0,0"
        object.C2 = "0,0"
      }
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
  handleJointCreation(pos) {
    let $selection = storeGet(selection)
    let VCs = $selection.filter(o => o.name === "VC")
    let current = VCs.length ? VCs.sort((a,b) => b._z-a._z)[0] : null
    if(storeGet(drawingData).curveToolEnabled && $selection.length && current) {
      let [x,y] = [Math.round(pos.x), Math.round(pos.y)]
      if(current._points[0].x == current._points[1].x
      && current._points[0].y == current._points[1].y) {
        current._points[1] = {x,y}
        current._controlPoints[1] = {x,y}
        current.__delegateAction = true
        encodeObjectData(current)
        joints.update(v => v)
      }
      else {
        let newJoint = Object.assign({}, $creation.object)
        newJoint.__delegateAction = true
        let cx = current._points[1].x
        let cy = current._points[1].y
        let dx = current._controlPoints[1].x - cx
        let dy = current._controlPoints[1].y - cy
        newJoint._points[0] = { x: cx, y: cy }
        newJoint._controlPoints[0] = { 
          x: cx - dx, 
          y: cy - dy 
        }
        newJoint._points[1] = {x,y}
        newJoint._controlPoints[1] = {x,y}

        encodeObjectData(newJoint)
        newJoint._store = joints

        joints.update(list => [...list, newJoint])
        selection.update(list => [newJoint, ...list])
      }
      buildXML()
    }
    else {
      creation.create(pos)
    }
  },
  create({ x, y, width, height }) {
    let object = Object.assign({}, $creation.object)
    object.__delegateAction = true
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