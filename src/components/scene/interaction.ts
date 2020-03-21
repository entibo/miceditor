
import { get } from "svelte/store"

import { rotate } from "@/util"
import { clamp } from "data/base/util"

import * as Editor from "data/editor"

import { store, Store } from "state/util"

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
  if(e.ctrlKey)     isKeyDown.update(() => (isKeyDown.ctrl  = true, isKeyDown))
  if(e.altKey)      isKeyDown.update(() => (isKeyDown.alt   = true, isKeyDown))
  if(key === " ")   isKeyDown.update(() => (isKeyDown.space = true, isKeyDown))

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



export function resetPan() {
  pan.x = Math.round( svgContainer.width/2  - mapSettings.width/2 )
  pan.y = Math.round( svgContainer.height/2 - mapSettings.height/2 )
  pan.invalidate()
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

class JointAction extends MouseMovement {
  constructor(
    e: MouseEvent, 
    public obj: Store<Editor.Joint.Joint>, 
    public startPoint: Point & {name:Editor.Joint.PointName}) 
  {
    super(e)
  }
  update(e: MouseEvent) {
    super.update(e)
    let $zoom = get(zoom)
    let delta = this.deltaStart()
    
    let dx = delta.x/$zoom
    let dy = delta.y/$zoom

    let nx = this.startPoint.x + dx
    let ny = this.startPoint.y + dy

    if(isKeyDown.ctrl || isKeyDown.shift) {
      let relativePoint = Editor.Joint.getRelativePoint(this.obj, this.startPoint.name)
      if(relativePoint) {
        let cx = relativePoint.x
        let cy = relativePoint.y

        let dist = Math.sqrt((cx-nx)**2 + (cy-ny)**2)

        let angleIncrement = 15 * Math.PI/180
        let angle = ( Math.atan2(ny-cy, nx-cx) + Math.PI*2 ) % (Math.PI*2)
        let newAngle = angleIncrement * Math.round(angle/angleIncrement)

        nx = cx + Math.round( dist * Math.cos(newAngle) )
        ny = cy + Math.round( dist * Math.sin(newAngle) )
      }
    }

    let point: Point = (this.obj as any)[this.startPoint.name]
    point.x = nx
    point.y = ny
    this.obj.invalidate()
  }
}

class PlatformCircleResizeAction extends MouseMovement {
  constructor(
    e: MouseEvent, 
    public obj: Store<Extract<Editor.Platform.Platform, Editor.Platform.Circle>>) 
  {
    super(e)
  }
  update(e: MouseEvent) {
    super.update(e)
    let gamePosition = sceneToGameCoordinates(this.current)
    
    let dx = gamePosition.x - this.obj.x
    let dy = gamePosition.y - this.obj.y

    let dist = Math.sqrt(dx**2 + dy**2)
    this.obj.radius = Math.max(10, dist)
    this.obj.invalidate()
  }
}

class PlatformRectangleResizeAction extends MouseMovement {
  startPosition: Point
  startDimensions: Point
  constructor(
    e: MouseEvent, 
    public obj: Store<Extract<Editor.Platform.Platform, Editor.Platform.Rectangle>>,
    public knob: number)
  {
    super(e)
    this.startPosition = { x: obj.x, y: obj.y }
    this.startDimensions = { x: obj.width, y: obj.height }
  }
  update(e: MouseEvent) {
    super.update(e)
    let $zoom = get(zoom)
    
    let delta = this.deltaStart()
    let dx = delta.x/$zoom
    let dy = delta.y/$zoom

    let rotation = "rotation" in this.obj ? this.obj.rotation : 0

    let [rdx,rdy] = rotate(dx, dy, -rotation)
    if([1,5].includes(this.knob)) rdx = 0
    if([3,7].includes(this.knob)) rdy = 0

    let sign = { x: 1, y: 1 }
    if([4,5,6].includes(this.knob)) sign.y = -1
    if([6,7,0].includes(this.knob)) sign.x = -1

    let newWidth =  sign.x*(+rdx) + this.startDimensions.x
    let newHeight = sign.y*(-rdy) + this.startDimensions.y
    let extraWidth = newWidth < 10 ? 10 - newWidth : 0
    let extraHeight = newHeight < 10 ? 10 - newHeight : 0
    this.obj.width = Math.max(10, newWidth)
    this.obj.height = Math.max(10, newHeight)

    let [a,b] = rotate(rdx + sign.x*extraWidth, rdy - sign.y*extraHeight, rotation)
    this.obj.x = Math.round(this.startPosition.x + a/2)
    this.obj.y = Math.round(this.startPosition.y + b/2)

    this.obj.invalidate()
  }
}

import * as layout from "state/layout"
class WindowMoveAction extends MouseMovement {
  constructor(
    e: MouseEvent, 
    public window: layout.Window)
  {
    super(e)
  }
  update(e: MouseEvent) {
    super.update(e)
    let delta = this.deltaLast()
    let newX = this.window.x + delta.x
    let newY = this.window.y + delta.y
    this.window.x = clamp(newX, 0, svgContainer.width-this.window.width)
    this.window.y = clamp(newY, 0, svgContainer.height-this.window.height)
    layout.layoutConfig.update(x => x)
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
  if(isKeyDown.space) return
  e.stopPropagation()

  if(isKeyDown.shift)
    return selection.has(obj)
      ? selection.unselect(obj)
      : selection.select(obj)

  if(!selection.has(obj)) {
    selection.clear()
    selection.select(obj)
  }

  currentMouseMovement = new Move(e)
}

export function jointMouseDown(e: MouseEvent, obj: Store<Editor.Joint.Joint>, startPoint: Point & {name:Editor.Joint.PointName}) {
  if(isKeyDown.space) return
  e.stopPropagation()

  currentMouseMovement = new JointAction(e, obj, startPoint)
}

export function platformResizeKnobMouseDown(e: MouseEvent, obj: Store<Editor.Platform.Platform>, knob: number) {
  if(isKeyDown.space) return
  e.stopPropagation()

  currentMouseMovement = Editor.Platform.isCircle(obj)
    ? new PlatformCircleResizeAction(e, obj as any)
    : new PlatformRectangleResizeAction(e, obj as any, knob)
}

export function windowTitleMouseDown(e: MouseEvent, window: layout.Window) {
  if(isKeyDown.space) return
  e.stopPropagation()
  windowPanelMouseDown(window)

  currentMouseMovement = new WindowMoveAction(e, window)
}

export function windowPanelMouseDown(window: layout.Window) {
  layout.layoutConfig.update(cfg => {
    let idx = cfg.windows.indexOf(window)
    if(idx === cfg.windows.length-1) return cfg
    cfg.windows.splice(idx, 1)
    cfg.windows.push(window)
    return cfg
  })
}

export function windowMouseMove(e: MouseEvent) {
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

import { tabMovement, finishMovement } from "state/layout"
export function backgroundMouseUp(e: MouseEvent) {
  if(!tabMovement.enabled || !tabMovement.active) return
  console.log("interaction > backgroundMouseUp > ", getSceneCoordinates(e))
  e.preventDefault()
  e.stopPropagation()
  finishMovement(getSceneCoordinates(e), true)
}


function changeZoom(e: WheelEvent) {
  e.preventDefault()
  let delta = -0.1*Math.sign(e.deltaY)
  let zoomChangeRatio = 1
  zoom.update(z => {
    let oldZoom = z
    let newZoom = oldZoom + delta
    zoomChangeRatio = newZoom / oldZoom
    return newZoom
  })
  let p1 = getSceneCoordinates(e)
  let a = {
    x: p1.x - pan.x,
    y: p1.y - pan.y,
  }
  let b = {
    x: a.x * (zoomChangeRatio),
    y: a.y * (zoomChangeRatio),
  }
  pan.x = pan.x - (b.x-a.x)
  pan.y = pan.y - (b.y-a.y)
  pan.invalidate()
}


export function wheel(e: WheelEvent) {
  if(isKeyDown.ctrl) {
    changeZoom(e)
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
