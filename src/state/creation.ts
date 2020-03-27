
import { store, Store } from "state/util"
import { eq } from "data/base/util"

import * as sceneObjects from "state/sceneObjects"
import * as interaction from "components/scene/interaction"

import * as Editor from "data/editor"
import * as Base from "data/base"
import { Brush, curveTool } from "state/user"
import * as selection from "state/selection"
import { rotate } from "@/util"

type Creation = 
  { enabled: false }
  | 
  { enabled: true, creationType: "PLATFORM"
    type: Editor.Platform.Type }
  | 
  { enabled: true, creationType: "DECORATION"
    type: Editor.Decoration.Type }
  | 
  { enabled: true, creationType: "SHAMANOBJECT"
    type: Editor.ShamanObject.Type
    rotation: number }
  | 
  { enabled: true, creationType: "IMAGE"
    imageUrl: Editor.Image.ImageUrl }
  | 
  { enabled: true, creationType: "LINE"
    brush: Brush }
  | 
  { enabled: true, creationType: "MECHANIC"
    type: Editor.Joint.BaseType }

export const creation = store<Creation>({ enabled: false })  


export const disable = () => creation.set({ enabled: false })  


function set(value: Creation) {
  if(creation.enabled && value.enabled && eq(value)(creation))
    return disable()
  creation.set(value)
}

export const setPlatform = (type: Editor.Platform.Type) =>
  set({ enabled: true, creationType: "PLATFORM", 
        type })

export const setDecoration = (type: Editor.Decoration.Type) =>
  set({ enabled: true, creationType: "DECORATION", 
        type })

export const setShamanObject = (type: Editor.ShamanObject.Type) =>
  set({ enabled: true, creationType: "SHAMANOBJECT",   
        type, rotation: 0 })

export const setImage = (imageUrl: Editor.Image.ImageUrl) =>
  set({ enabled: true, creationType: "IMAGE", imageUrl })

export const setLine = (brush: Brush) =>
  set({ enabled: true, creationType: "LINE", brush })

export const setMechanic = (type: Editor.Joint.BaseType) =>
  set({ enabled: true, creationType: "MECHANIC", type })


export const create = (e: MouseEvent, x: number, y: number) => {
  if(!creation.enabled) throw "create was called when creation was disabled"

  if(creation.creationType === "PLATFORM") {
    let obj = Editor.Platform.make(Editor.Platform.defaults(creation.type))
    if(Editor.Platform.isCircle(obj)) {
      obj.x = x
      obj.y = y
    }
    else {
      obj.x = x+5
      obj.y = y+5
    }
    let store = sceneObjects.add(obj)
    interaction.platformResizeKnobMouseDown(e, store, 4, true)
    selection.set([store])
  }

  else if(creation.creationType === "DECORATION") {
    let obj = Editor.Decoration.make(Editor.Decoration.defaults(creation.type))
    obj.x = x
    obj.y = y
    selection.set([ sceneObjects.add(obj) ])
  }

  else if(creation.creationType === "SHAMANOBJECT") {
    let obj = Editor.ShamanObject.make(Editor.ShamanObject.defaults(creation.type))
    obj.x = x
    obj.y = y
    if("rotation" in obj) obj.rotation = creation.rotation
    selection.set([ sceneObjects.add(obj) ])
  }

  else if(creation.creationType === "IMAGE") {
    if(creation.imageUrl.value === "")
      return
    let obj = Editor.Image.make(Editor.Image.defaults(), false)
    obj.x = x
    obj.y = y
    obj.imageUrl = creation.imageUrl
    selection.set([ sceneObjects.add(obj) ])
  }

  else if(creation.creationType === "LINE") {

    let setRenderProperties = (obj: Extract<Editor.Joint.Joint,Editor.Joint.Renderable>) => {
      obj.renderEnabled = true
      obj.color = creation.brush.color
      obj.thickness = creation.brush.thickness
      obj.opacity = creation.brush.opacity
      obj.foreground = creation.brush.foreground
    }

    if(curveTool.enabled) {
      let selectionObjects = selection.getAll()
      let lastCurve = selectionObjects.length === 1
        ? selectionObjects.find(x => Editor.isJoint(x) && x.type === "VC") as Store<Extract<Editor.Joint.Joint,{type:"VC"}>>
        : undefined

      if(!lastCurve) {
        let obj = Editor.Joint.make(Editor.Joint.defaults("VC")) as Extract<Editor.Joint.Joint,{type:"VC"}>

        obj.fineness = curveTool.fineness
        setRenderProperties(obj)
        Editor.Joint.move(obj, x, y)

        let store = sceneObjects.add(obj)
        interaction.jointMouseDown(e, store, { name: "controlPoint1", ...store.controlPoint1 })
        selection.set([store])
      }

      else {
        if(eq(lastCurve.point1)(lastCurve.point2)) {
          lastCurve.point2 = {x,y}
          lastCurve.controlPoint2 = {x,y}
          lastCurve.invalidate()
          interaction.jointMouseDown(e, lastCurve, { name: "controlPoint2", ...lastCurve.controlPoint2 })
        }

        else {
          let obj = Editor.Joint.make(Editor.Joint.defaults("VC")) as Extract<Editor.Joint.Joint,{type:"VC"}>

          obj.fineness = curveTool.fineness
          setRenderProperties(obj)
          Editor.Joint.move(obj, x, y)

          obj.point1 = { ...lastCurve.point2 }
          let [px,py] = rotate(lastCurve.controlPoint2.x, lastCurve.controlPoint2.y, 180, lastCurve.point2.x, lastCurve.point2.y)
          obj.controlPoint1 = { x: px, y: py }

          let store = sceneObjects.add(obj)
          interaction.jointMouseDown(e, store, { name: "controlPoint2", ...store.controlPoint2 })
          selection.set([store])
        }
      }

    }

    else {
      let obj = Editor.Joint.make(Editor.Joint.defaults("JD")) as Extract<Editor.Joint.Joint,{type:"JD"}>

      setRenderProperties(obj)
      Editor.Joint.move(obj, x, y)
      obj.point1.enabled = obj.point2.enabled = true

      let store = sceneObjects.add(obj)
      interaction.jointMouseDown(e, store, { name: "point2", ...obj.point2 })
      selection.set([store])      
    }

  }


}


export function createMechanic(platform1Index: number, platform2Index: number) {
  if(!creation.enabled) return
  if(creation.creationType !== "MECHANIC") return
  let {type} = creation
  let obj = Editor.Joint.make(Editor.Joint.defaults(type)) as Extract<Editor.Joint.Joint,{type: typeof type}>
  obj.platform1Index = platform1Index
  obj.platform2Index = platform2Index

  let store = sceneObjects.add(obj)
  selection.set([store])
}
