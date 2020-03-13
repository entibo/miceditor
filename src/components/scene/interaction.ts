
import { get } from "svelte/store"

import * as Editor from "data/editor"

import { store } from "state/util"

import * as selection from "@/state/selection"

import { mapSettings } from "state/map"
import * as sceneObjects from "state/sceneObjects"
import { SceneObject } from "state/sceneObjects"

import { zoom } from "state/user"

import { undo, redo } from "state/history"


export const svgContainer = store({
  el: null as HTMLElement | null,
  width: 1,
  height: 1,
})

export const pan = store<Point>({ x: 0, y: 0 })

export const currentScenePosition = store<Point>({ x: 0, y: 0 })
export const currentGamePosition  = store<Point>({ x: 0, y: 0 })
currentScenePosition.subscribe(p => 
  currentGamePosition.set(sceneToGameCoordinates(p))
)

function cancel() {
  if(0/* creation */) 
    1
  else if(selection.size() > 0)
    selection.clear()
  else if(get(zoom) !== 1) 
    zoom.set(1)
  else 
    resetPan()
}



export const isKeyDown = store({
  space: false,
  shift: false,
  ctrl:  false,
  alt:   false,
})
export function windowKeyDown(e: KeyboardEvent) {
  let key = e.key.toLowerCase()
  if(e.shiftKey)    isKeyDown.update(() => (isKeyDown.shift = true, isKeyDown))
  if(e.ctrlKey)     isKeyDown.update(() => (isKeyDown.ctrl = true, isKeyDown))
  if(e.altKey)      isKeyDown.update(() => (isKeyDown.alt = true, isKeyDown))
  if(key === " ") isKeyDown.update(() => (isKeyDown.space = true, isKeyDown))
  if(key === "escape") cancel()

  if(isKeyDown.ctrl) {
    if(key === "z") {
      if(isKeyDown.shift) redo()
      else undo()
    }
    else if(key === "y") redo()
  }
}
export function windowKeyUp(e: KeyboardEvent) {
  if     (e.key === "Shift")   isKeyDown.update(() => (isKeyDown.shift = false, isKeyDown))
  else if(e.key === "Control") isKeyDown.update(() => (isKeyDown.ctrl = false, isKeyDown))
  else if(e.key === "Alt")     isKeyDown.update(() => (isKeyDown.alt = false, isKeyDown))
  else if(e.key === " ")       isKeyDown.update(() => (isKeyDown.space = false, isKeyDown))
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
    console.log("MouseMovement created", this)
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
export function centerPan(e: MouseEvent, delta: number) {
  let $zoom = get(zoom)
  let factor = $zoom / ($zoom-delta)
  let p1 = getSceneCoordinates(e)
  let a = {
    x: p1.x - pan.x,
    y: p1.y - pan.y,
  }
  let b = {
    x: a.x * (factor),
    y: a.y * (factor),
  }
  pan.x = pan.x - (b.x-a.x)
  pan.y = pan.y - (b.y-a.y)
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
    let $zoom = get(zoom)
    let delta = this.deltaLast()
    selection.move(delta.x/$zoom, delta.y/$zoom)
  }
}

export const selectionBox = store<{box: Box|null}>({ box: null })
class Select extends MouseMovement {
  previousSelection = selection.getAll()
  update(e: MouseEvent) {
    super.update(e)
    this.updateSelectionBox()
    let {p1,p2} = selectionBox.box!
    let insideSelectionBox
      = sceneObjects.getAll()
        .filter(obj => {
          let bb = Editor.getBoundingBox(obj)
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
    let [x1,x2] = [this.start.x, this.current.x] .sort((a,b) => a-b)
    let [y1,y2] = [this.start.y, this.current.y] .sort((a,b) => a-b)
    selectionBox.box = {
      p1: sceneToGameCoordinates({x: x1, y: y1}),
      p2: sceneToGameCoordinates({x: x2, y: y2}),
    }
    selectionBox.invalidate()
  }
  end() {
    selectionBox.box = null
    selectionBox.invalidate()
  }
}

let currentMouseMovement: MouseMovement | null = null

export function backgroundMouseDown(e: MouseEvent) {
  if(isKeyDown.space)
    currentMouseMovement = new Pan(e)
  else if(0/* creation */) {

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

export function windowMouseMove(e: MouseEvent) {
  /* let {x,y} = getSceneCoordinates(e)
  currentScenePosition.x = x
  currentScenePosition.y = y
  currentScenePosition.invalidate() */
  currentScenePosition.set(getSceneCoordinates(e))

  if(!currentMouseMovement) return

  currentMouseMovement.update(e)


}

export function windowMouseUp(e: MouseEvent) {
  if(currentMouseMovement) {
    currentMouseMovement.end(e)
    currentMouseMovement = null
  }
}

export function windowMouseLeave(e: MouseEvent) {
  isKeyDown.set({
    alt: false,
    ctrl: false,
    shift: false,
    space: false,
  })
  if(currentMouseMovement) {
    currentMouseMovement.end(e)
    currentMouseMovement = null
  }
}

export function wheel(e: WheelEvent) {
  if(isKeyDown.ctrl) {
    e.preventDefault()
    let delta = -0.1*Math.sign(e.deltaY)
    zoom.update(z => z + delta)
    centerPan(e, delta)
    return
  }
  
  let factor = isKeyDown.alt ? 1 : 10
  let delta = Math.sign(e.deltaY) * factor

  /* if(creation) {
    return
  } */
  
  if(isKeyDown.shift) {
    let p = sceneToGameCoordinates(getSceneCoordinates(e))
    selection.rotateAround(delta, p)
  }
  else selection.rotate(delta)

}


function getSceneCoordinates(e: MouseEvent) {
  if(!svgContainer.el) return { x: 0, y: 0 }
  return {
    x: e.clientX - svgContainer.el.offsetLeft,
    y: e.clientY - svgContainer.el.offsetTop,
  }
}
export function sceneToGameCoordinates(p: Point): Point {
  let $zoom = get(zoom)
  return {
    x: (p.x - pan.x) / $zoom,
    y: (p.y - pan.y) / $zoom,
  }
}
export function gameToSceneCoordinates(p: Point): Point {
  let $zoom = get(zoom)
  return {
    x: p.x * $zoom + pan.x,
    y: p.x * $zoom + pan.y,
  }
}
