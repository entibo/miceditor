
import { writable, derived, get as storeGet } from "svelte/store"

import { encodePlatformData, encodeDecorationData, encodeJointData, encodeObjectData,
  platformProperties, groundTypes, rotate as rotatePoint } from "../xml-utils.js"
import { platforms, decorations, shamanObjects, joints, settings, buildXML } from "./xml.js"
import { persistentWritable } from "./user.js"

import { gridSettings } from "/stores/stores.js"


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
    case joints:
      return list.filter(o => o._objectType === "joint")
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

function move(dx, dy) {
  if(!$selection.length) return

  for(let object of $selection) {
    if(object._objectType === "joint") {
      for(let p of [...object._points, ...(object._controlPoints||[])]) {
        p.x += dx
        p.y += dy
      }
    } else {
      object._x += dx
      object._y += dy
    }
    encodeObjectData(object)
  }

  for(let store of stores) {
    store.update(v => v)
  }
  update(v => v)
  buildXML()
}

function resize(dx, dy) {
  if(!$selection.length) return

  for(let object of $selection) {
    if(object._width === undefined) {
      continue
    }
    object._width = Math.max(10, object._width+dx)
    object._height = Math.max(10, object._height+dy)
    encodeObjectData(object)
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
      if(object._objectType === "joint") {
        for(let p of [...object._points, ...(object._controlPoints||[])]) {
          let [x, y] = rotatePoint(p.x, p.y, -da, cx, cy)
          p.x = x
          p.y = y
        }
      } else {
        let [x, y] = rotatePoint(object._x, object._y, -da, cx, cy)
        object._x = x
        object._y = y
      }
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

function flip() {
  if(!$selection.length) return

  let x1 = Math.min( ...$selection.map(object => object._boundingBox.x1 + object._x) )
  let x2 = Math.max( ...$selection.map(object => object._boundingBox.x2 + object._x) )

  let cx = x1 + (x2-x1)/2

  for(let object of $selection) {
    if(object._reverse !== undefined) object._reverse = !object._reverse
    if(object._rotation !== undefined) object._rotation = -object._rotation
    if(object._objectType === "joint") {
      for(let p of [...object._points, ...(object._controlPoints||[])]) {
          p.x = Math.round( cx - (p.x - cx) )
        }
    }
    else {
      object._x = Math.round( cx - (object._x - cx) )
    }
    encodeObjectData(object)
  }

  for(let store of stores) {
    store.update(v => v)
  }
  update(v => v)
  buildXML()  
}

function snapToGrid() {
  let grid = storeGet(gridSettings)
  let [gw, gh] = [grid.width, grid.height]
  for(let object of $selection) {
    let dx = object._x % gw
    let dy = object._y % gh
    if( (object._x%gw) > gw/2 ) {
      object._x += (gw-dx)
    }
    else {
      object._x -= dx
    }
    if( (object._y%gh) > gh/2 ) {
      object._y += (gh-dy)
    }
    else {
      object._y -= dy
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
  let stores = new Set()
  for(let obj of newSelection) {
    obj._store = {
      "platform": platforms, 
      "decoration": decorations, 
      "shamanObject": shamanObjects, 
      "joint": joints,
    } [obj._objectType]
    stores.add(obj._store)
  }
  for(let store of stores) {
    let objects = newSelection.filter(o => o._store === store)
    if(!objects.length) continue
    store.update(list => {
      objects = objects.filter(o => {
        if(o._unique) {
          return !list.find(({_type}) => _type === o._type)
        }
        return true
      })
      return [...list, ...objects]
    })
  }
  set(newSelection)
  buildXML()
}

function duplicate() {
  let toBeDuplicated = $selection.filter(o => !o._unique)
  let newSelection = []
  for(let store of stores) {
    let objects = toBeDuplicated.filter(o => o._store === store)
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
  else if(which === "joints")
    addToSelection(storeGet(joints))
  else if(which === "basic")
    addToSelection(storeGet(decorations).filter(o => o.name !== "P"))
  else if(which === "decorations")
    addToSelection(storeGet(decorations).filter(o => o.name === "P"))
}
function unselectGroup(which) {
  update(list => {
    if(which === "grounds") return list.filter(({_objectType}) => _objectType !== "platform")
    if(which === "objects") return list.filter(({_objectType}) => _objectType !== "shamanObject")
    if(which === "joints") return list.filter(({_objectType}) => _objectType !== "joint")
    if(which === "decorations") return list.filter(({name}) => name !== "P")
    if(which === "basic") return list.filter(({name}) => !["T","F","DS","DC","DC2"].includes(name))
    return list
  })
}

export const selection = {
  subscribe, set, update,
  clear, remove, 
  move, resize, rotate, flip, snapToGrid,
  copy, cut, paste, duplicate,
  selectGroup, unselectGroup,
}









