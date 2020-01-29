
import { get } from "svelte/store"

import * as Data from "data/Data"

import * as util from "stores/util"

import * as selection from "stores/selection"

import { mapSettings } from "stores/xml"
import * as sceneObjects from "stores/sceneObjects"
import { SceneObject } from "stores/sceneObjects"

import { zoom } from "stores/user"


export const svgContainer = util.customStore({
  el: null as HTMLElement | null,
  width: 1,
  height: 1,
})

export const pan = util.customStore<Point>({ x: 0, y: 0 })

function cancel() {
  if(1/* creation */) 
    1
  else if(selection.size() > 0)
    selection.clear()
  else if(get(zoom) !== 1) 
    zoom.set(1)
  else 
    resetPan()
}



const isKeyDown = {
  space: false,
  shift: false,
  ctrl:  false,
  alt:   false,
}
export function windowKeyDown(e: KeyboardEvent) {
  if(e.shiftKey)    isKeyDown.shift = true
  if(e.ctrlKey)     isKeyDown.ctrl = true
  if(e.altKey)      isKeyDown.alt = true
  if(e.key === " ") isKeyDown.space = true
  if(e.key === "Escape") cancel()
}
export function windowKeyUp(e: KeyboardEvent) {
  if     (e.key === "Shift")   isKeyDown.shift = false
  else if(e.key === "Control") isKeyDown.ctrl = false
  else if(e.key === "Alt")     isKeyDown.alt = false
  else if(e.key === " ")       isKeyDown.space = false
}

const keyActions: { [key: string]: (e: KeyboardEvent) => void } = {
  "delete": selection.remove,
  "d":      selection.duplicate,
  "f":      selection.flip,
  "g": () => {
    /* grid */
  },
  "a": (e) => {
    if(!isKeyDown.ctrl) return
    e.preventDefault()
    /* creation: cancel */
    if(isKeyDown.shift)
      selection.clear()
    else
      selection.set(sceneObjects.getAll())
  },
}

export function keyDown(e: KeyboardEvent) {
  let key = e.key.toLowerCase()

  if(key.startsWith("arrow")) {
    let dx = key === "arrowleft" ? -1 : key === "arrowright" ? 1 : 0
    let dy = key === "arrowup"   ? -1 : key === "arrowdown"  ? 1 : 0
    if(isKeyDown.shift) {
      dx *= 10
      dy *= 10
    }
    if(isKeyDown.ctrl) {
      dx *= 100
      dy *= 100
    }
    if(isKeyDown.alt) {
      e.preventDefault()
      selection.resize(dx, -dy)
    }
    else {
      selection.move(dx, dy)
    }
  }
  else if(key in keyActions) 
    keyActions[key](e)
}




class MouseMovement {
  start: Point
  last: Point
  current: Point
  constructor(e: MouseEvent) {
    this.start = this.last = this.current = getSceneCoordinates(e)
  }
  deltaStart(): Point {
    return {
      x: this.current.x - this.start.x,
      y: this.current.y - this.start.y,
    }
  }
  deltaLast(): Point {
    return {
      x: this.current.x - this.last.x,
      y: this.current.y - this.last.y,
    }
  }
  update(e: MouseEvent) {
    this.last = this.current
    this.current = getSceneCoordinates(e)
  }
  end(e: MouseEvent) {}
}

export function resetPan() {
  pan.x = Math.round( svgContainer.width/2  - mapSettings.width/2 )
  pan.y = Math.round( svgContainer.height/2 - mapSettings.height/2 )
  pan.invalidate()
}
export function centerPan(e: MouseEvent) {
  let {x,y} = getSceneCoordinates(e)
  // ???
  pan.invalidate()
}

class Pan extends MouseMovement {
  update(e: MouseEvent) {
    super.update(e)
    let delta = this.deltaLast()
    pan.x += delta.x
    pan.y += delta.y
    pan.invalidate()
  }
}

class Move extends MouseMovement {
  update(e: MouseEvent) {
    super.update(e)
    let delta = sceneToGameCoordinates(this.deltaLast())
    selection.move(delta.x, delta.y)
  }
}

export const selectionBox = util.customStore<{box: Box|null}>({box: null})
class Select extends MouseMovement {
  previousSelection = selection.getAll()
  update(e: MouseEvent) {
    super.update(e)
    this.updateSelectionBox()
    let {p1,p2} = selectionBox.box!
    let insideSelectionBox
      = sceneObjects.getAll()
        .filter(obj => {
          let bb = Data.getBoundingBox(obj)
          if(bb.p1.x < p1.x || bb.p2.x > p2.x) return false
          if(bb.p1.y < p1.y || bb.p2.y > p2.y) return false
          return true
        })
    selection.set([
      ...this.previousSelection,
      ...insideSelectionBox
    ])
  }
  updateSelectionBox() {
    let [x1,x2] 
      = [this.start.x, this.current.x]
        .sort((a,b) => a-b)
        .map(sceneToGameCoordinates)
    let [y1,y2] 
      = [this.start.y, this.current.y]
        .sort((a,b) => a-b)
        .map(sceneToGameCoordinates)
    selectionBox.box = {
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
    }
    selectionBox.invalidate()
  }
}

let currentMouseMovement: MouseMovement | null = null

export function backgroundMouseDown(e: MouseEvent) {
  if(isKeyDown.space)
    currentMouseMovement = new Pan(e)
  else if(1/* creation */) {

  }
  else {
    /* selection */
    if(!isKeyDown.shift)
      selection.clear()
    currentMouseMovement = new Select(e)
  }
}

export function objectMouseDown(e: MouseEvent, obj: SceneObject) {
  e.stopPropagation()

  if(isKeyDown.shift) {
    if(selection.has(obj))
      selection.unselect(obj)
    else
      selection.select(obj)
    return
  } 

  if(!selection.has(obj)) {
    selection.clear()
    selection.select(obj)
  }
  currentMouseMovement = new Move(e)
}

let currentScenePosition: Point = { x: 0, y: 0 }
export function windowMouseMove(e: MouseEvent) {
  currentScenePosition = getSceneCoordinates(e)

  if(!currentMouseMovement) return

  currentMouseMovement.update(e)


}

export function windowMouseUp(e: MouseEvent) {
  if(!currentMouseMovement) return
  currentMouseMovement.end(e)
  currentMouseMovement = null
}

export function windowMouseLeave(e: MouseEvent) {
  isKeyDown.alt = false
  isKeyDown.ctrl = false
  isKeyDown.shift = false
  isKeyDown.space = false
  currentMouseMovement = null
}

export function wheel(e: WheelEvent) {
  if(isKeyDown.ctrl) {
    zoom.update(z => z - 0.1*Math.sign(e.deltaY))
    centerPan(e)
    return
  }
  
  let factor = isKeyDown.alt ? 1 : 10
  let delta = Math.sign(e.deltaY) * factor

  if(/* creation */1) {
    (e)
    return
  }
  
  if(isKeyDown.shift) {
    let p = sceneToGameCoordinates(getSceneCoordinates(e))
    selection.rotateAround(da, p)
  }
  else selection.rotate(da)

}





function getSceneCoordinates(e: MouseEvent) {
  if(!svgContainer.el) return { x: 0, y: 0 }
  return {
    x: e.clientX - svgContainer.el.offsetLeft,
    y: e.clientY - svgContainer.el.offsetTop,
  }
}
function sceneToGameCoordinates(p: Point) {
  let $zoom = get(zoom)
  return {
    x: (p.x - pan.x) / $zoom,
    y: (p.y - pan.y) / $zoom,
  }
}
