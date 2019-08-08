
import { writable, derived, get as storeGet } from "svelte/store"

import { encodePlatformData, encodeDecorationData, encodeObjectData,
  platformProperties, groundTypes, rotate as rotatePoint } from "../xml-utils.js"
import { platforms, decorations, shamanObjects, settings, buildXML } from "./xml.js"
import { persistentWritable } from "./user.js"


export const clipboard = persistentWritable("clipboard", [], true)


let { subscribe, set, update } = writable([])


let $selection, stores
subscribe(v => {
  $selection = v
  stores = [...new Set(v.map(o => o._store))]
})

function filterByStore(list, store) {
  switch(store) {
    case platforms:
      return list.filter(o => o._objectType === "platform")
    case decorations:
      return list.filter(o => o._objectType === "decoration")
    case shamanObjects:
      return list.filter(o => o._objectType === "shamanObject")
  }
}

function clear() {
  if(!$selection.length) return
  set([])
}

function remove() {
  if(!$selection.length) return
  for(let store of stores) {
    store.update(list => list.filter(object => !$selection.includes(object)))
  }
  clear()
  buildXML()
}

function move(dx,dy) {
  if(!$selection.length) return
  let objectTypes = new Set()
  for(let object of $selection) {
    object._x += dx
    object._y += dy
    encodeObjectData(object)
    objectTypes.add(object._objectType)
  }
  for(let store of stores) {
    store.update(v => v)
  }
  update(v => v)
  buildXML()
}

function rotate(da, cx, cy) {
  if(arguments.length >= 3) {
    for(let object of $selection) {
      let [x, y] = rotatePoint(object._x, object._y, -da, cx, cy)
      object._x = x
      object._y = y
     }
  }
  for(let object of $selection) {
    if(object._rotation !== undefined) {
      object._rotation += da
    }
    encodeObjectData(object)
  }
  for(let store of stores) {
    store.update(v => v)
  }
  update(v => v)
  buildXML()
}

function copy() {
  if(!$selection.length) return
  clipboard.set($selection.map(object => Object.assign({}, object)))
}

function cut() {
  copy()
  remove()
}

function paste() {
  let newSelection = storeGet(clipboard).map(object => Object.assign({}, object))
  let stores = new Set([...newSelection].map(o => o._store))
  for(let store of stores) {
    let newObjects = newSelection.filter(o => o._store === store)
    if(!newObjects.length) continue
    store.update(list => [...list, ...newObjects])
  }
  set(newSelection)
  buildXML()
}

function duplicate() {
  let newSelection = []
  for(let store of stores) {
    let objects = $selection.filter(o => o._store === store)
    for(let object of objects) {
      let copy = Object.assign({}, object)
      copy._x += 40
      encodeObjectData(copy)
      newSelection.push(copy)
      store.update(list => {
        let index = list.indexOf(object)
        let before = list.slice(0, index+1)
        let after = list.slice(index+1)
        return [...before, copy, ...after]
      })
    }
  }
  set(newSelection)
  buildXML()
}

function addToSelection(objects) {
  update(list => [...new Set(list.concat(objects))])
}
function selectGroup(which) {
  if(which === "grounds")
    addToSelection(storeGet(platforms))
  else if(which === "objects")
    addToSelection(storeGet(shamanObjects))
  else if(which === "basic")
    addToSelection(storeGet(decorations).filter(o => o.name !== "P"))
  else if(which === "decorations")
    addToSelection(storeGet(decorations).filter(o => o.name === "P"))
}
function unselectGroup(which) {
  update(list => {
    if(which === "grounds") return list.filter(({_objectType}) => _objectType !== "platform")
    if(which === "objects") return list.filter(({_objectType}) => _objectType !== "shamanObject")
    if(which === "decorations") return list.filter(({name}) => name !== "P")
    if(which === "basic") return list.filter(({name}) => !["T","F","DS","DC","DC2"].includes(name))
    return list
  })
}

export const selection = {
  subscribe, set, update,
  clear, remove, move, rotate, copy, cut, paste, duplicate,
  selectGroup, unselectGroup,
}









