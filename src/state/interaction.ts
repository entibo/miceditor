
import { get } from "svelte/store"

import { rotate } from "common"
import { clamp } from "data/base/util"

import * as Editor from "data/editor"

import { store, Store } from "state/util"

import * as selection from "state/selection"
import * as Creation from "state/creation"

import { mapSettings } from "state/map"
import * as sceneObjects from "state/sceneObjects"
import { SceneObject } from "state/sceneObjects"

import { zoom, brushPalette } from "state/user"
import clipboard from "state/clipboard"

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
  if(Creation.creation.enabled) 
    Creation.disable()
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


  let target = e.target as Node
  if(target && "nodeName" in target && ["INPUT","SELECT"].includes(target.nodeName.toUpperCase()))
    return


  if(key === "escape") cancel()

  if(isKeyDown.ctrl) {

    if(key === "z") {
      if(isKeyDown.shift) redo()
      else undo()
    }
    else if(key === "y") redo()

    if(key === "c")
      clipboard.copy()
    else if(key === "v")
      clipboard.paste()

  }

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
  "+": () => selection.shiftIndex(+1),
  "-": () => selection.shiftIndex(-1),
  "a": (e) => {
    if(!isKeyDown.ctrl) return
    e.preventDefault()
    Creation.disable()
    if(isKeyDown.shift)
      selection.clear()
    else
      selection.selectAll()
  },
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
        .filter(obj => obj.interactive)
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
    public knob: number,
    relativeToKnob = false)
  {
    super(e)
    this.startPosition = { x: obj.x, y: obj.y }
    this.startDimensions = { x: obj.width, y: obj.height }
    if(relativeToKnob) {
      let rotation = "rotation" in obj ? obj.rotation : 0
      let [vx,vy] = [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]][knob]
      let [dx,dy] = rotate(vx*obj.width/2, vy*obj.height/2, rotation)
      this.start = this.last = this.current = gameToSceneCoordinates({
        x: obj.x + dx,
        y: obj.y + dy,
      })
    }
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


    if(this.obj.width === 10 && newWidth < 0) {
      let knob = ({ 0:2, 1:1, 2:0, 3:7, 4:6, 5:5, 6:4, 7:3 } as any)[this.knob]
      let [offsetX,offsetY] = rotate(-10 * sign.x, 0, rotation)
      this.obj.x += offsetX
      this.obj.y += offsetY
      this.obj.invalidate()
      currentMouseMovement = new PlatformRectangleResizeAction(e, this.obj, knob, true)
      return
    }
    if(this.obj.height === 10 && newHeight < 0) {
      let knob = ({ 0:6, 1:5, 2:4, 3:3, 4:2, 5:1, 6:0, 7:7 } as any)[this.knob]
      let [offsetX,offsetY] = rotate(0, 10 * sign.y, rotation)
      this.obj.x += offsetX
      this.obj.y += offsetY
      this.obj.invalidate()
      currentMouseMovement = new PlatformRectangleResizeAction(e, this.obj, knob, true)
      return
    }

    
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

export const platformBoosterVectorMinLength = 30
export const platformBoosterVectorSpeedLengthRatio = 5
class PlatformBoosterVectorResizeAction extends MouseMovement {
  constructor(
    e: MouseEvent, 
    public obj: Store<Extract<Editor.Platform.Platform, Editor.Platform.NonStatic>>) 
  {
    super(e)
  }
  update(e: MouseEvent) {
    super.update(e)
    let gamePosition = sceneToGameCoordinates(this.current)
    
    let dx = gamePosition.x - this.obj.x
    let dy = gamePosition.y - this.obj.y

    let length = Math.sqrt(dx**2 + dy**2)
    let angle = Math.atan2(dy, dx) * 180 / Math.PI
    if(isKeyDown.ctrl || isKeyDown.shift) {
      let angleIncrement = 15
      angle = angleIncrement * Math.round(angle/angleIncrement)
    }

    this.obj.booster.angle = angle
    this.obj.booster.speed = 
      Math.max(0, (length - platformBoosterVectorMinLength) / platformBoosterVectorSpeedLengthRatio)
    this.obj.invalidate()
  }
}


import * as layout from "state/layout"

class WindowMoveAction extends MouseMovement {
  startWindow: layout.Window
  constructor(e: MouseEvent, public window: layout.Window) {
    super(e)
    this.startWindow = { ...window }
  }
  update(e: MouseEvent) {
    super.update(e)
    let delta = this.deltaStart()
    let newX = this.startWindow.x + delta.x
    let newY = this.startWindow.y + delta.y
    this.window.x = clamp(newX, 0, svgContainer.width-this.window.width)
    this.window.y = clamp(newY, 0, svgContainer.height-this.window.height)
    layout.layoutConfig.update(x => x)
  }
}

class WindowResizeAction extends MouseMovement {
  startWindow: layout.Window
  constructor(e: MouseEvent, public window: layout.Window) {
    super(e)
    this.startWindow = { ...window }
  }
  update(e: MouseEvent) {
    super.update(e)
    let delta = this.deltaStart()
    let newW = this.startWindow.width  + delta.x
    let newH = this.startWindow.height + delta.y
    this.window.width  = clamp(newW, 80,  svgContainer.width-this.window.x)
    this.window.height = clamp(newH, 80, svgContainer.height-this.window.y)
    layout.layoutConfig.update(x => x)
  }
}


let currentMouseMovement: MouseMovement | null = null

export function backgroundMouseDown(e: MouseEvent) {
  if(e.defaultPrevented) {
    let activeElement = document.activeElement as HTMLElement
    activeElement && activeElement.blur && activeElement.blur()
    return
  }

  if(isKeyDown.space)
    currentMouseMovement = new Pan(e)

  else if(Creation.creation.enabled) {
    let {x,y} = sceneToGameCoordinates(getSceneCoordinates(e))
    Creation.create(e, x, y)
    //selection.set([obj])
  }

  else {
    if(!isKeyDown.shift)
      selection.clear()
    currentMouseMovement = new Select(e)
  }
}


export function objectMouseDown(e: MouseEvent, obj: SceneObject) {
  if(isKeyDown.space) return

  e.preventDefault()

  if(Creation.creation.enabled && Creation.creation.creationType === "MECHANIC") {
    if(!Editor.isPlatform(obj)) return
    Creation.createMechanic(obj.index)
    return
  }

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
  e.preventDefault()

  currentMouseMovement = new JointAction(e, obj, startPoint)
}

export function platformResizeKnobMouseDown(e: MouseEvent, obj: Store<Editor.Platform.Platform>, knob: number, relativeToKnob = false) {
  if(isKeyDown.space) return
  e.preventDefault()

  currentMouseMovement = Editor.Platform.isCircle(obj)
    ? new PlatformCircleResizeAction(e, obj as any)
    : new PlatformRectangleResizeAction(e, obj as any, knob, relativeToKnob)
}

export function platformBoosterVectorMouseDown(e: MouseEvent, obj: Store<Editor.Platform.Platform>) {
  if(isKeyDown.space) return
  e.preventDefault()

  currentMouseMovement = new PlatformBoosterVectorResizeAction(e, obj as any)
}

export function windowTitleMouseDown(e: MouseEvent, window: layout.Window) {
  if(isKeyDown.space) return
  //windowPanelMouseDown(window)

  currentMouseMovement = new WindowMoveAction(e, window)
}

export function windowBottomMouseDown(e: MouseEvent, window: layout.Window) {
  if(isKeyDown.space) return
  e.preventDefault()
  //windowPanelMouseDown(window)

  currentMouseMovement = new WindowResizeAction(e, window)
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

export function backgroundMouseMove(e: MouseEvent) {
  layout.setTabMovementTarget({
    type: "window",
    ...getSceneCoordinates(e)
  })
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

  if(Creation.creation.enabled) {
    if(Creation.creation.creationType === "SHAMANOBJECT") {
      Creation.creation.rotation += delta
      Creation.creation.invalidate()
    }
    else if(Creation.creation.creationType === "LINE") {
      Creation.creation.brush.thickness = clamp(Creation.creation.brush.thickness - Math.sign(e.deltaY), 1, 250)
      Creation.creation.invalidate()
      brushPalette.update(x => x)
    }
    return
  }
  
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
    y: p.y * $zoom + pan.y,
  }
}
