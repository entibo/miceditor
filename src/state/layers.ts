
import { clone } from "data/base/util"

import * as Editor from "data/editor"
type P = Editor.Platform.Platform
type J = Editor.Joint.Joint
type Layer = Editor.MapSettings.Layer
type Animation = Editor.MapSettings.Animation

import { Store } from "state/util"
import { mapSettings } from "state/map"
import * as sceneObjects from "state/sceneObjects"
import * as selection from "state/selection"



function findFirstAvailableId() {
  let id = 0
  let list = mapSettings.animations.map(animation => animation.id)
    .concat( mapSettings.layers.map(layer => layer.id) )
    .sort((a,b) => a-b)
  while(id < list.length && id === list[id]) 
    id++
  return id
}




const getLayerIndex = (layerId: number) =>
  mapSettings.layers.findIndex(layer => layer.id === layerId)

const getLayerJoints = (layerId: number) =>
  sceneObjects.groups.joints.filter(joint => joint.layerId === layerId)


export function addLayer(index?: number): Layer {
  let newLayer = {
    id: findFirstAvailableId(),
    name: "",
    opacity: 1,
  }
  if(index !== undefined)
    mapSettings.layers = [...mapSettings.layers.slice(0,index), newLayer, ...mapSettings.layers.slice(index)]
  else
    mapSettings.layers.push(newLayer)

  mapSettings.currentLayerId = newLayer.id

  mapSettings.invalidate()
  return newLayer
}

export function duplicateLayer(layerId: number): Layer {
  let srcLayerIndex = getLayerIndex(layerId)
  if(srcLayerIndex < 0) throw "duplicateLayer: Layer "+srcLayerIndex+" doesn't exist"
  let newLayer = addLayer(srcLayerIndex+1)
  
  let srcName = mapSettings.layers[srcLayerIndex].name
  if(srcName !== "") newLayer.name = srcName + " - Copy"

  let toBeDuplicated = getLayerJoints(layerId)
  if(!toBeDuplicated.length)
    return newLayer
  let duplicates = [] as Store<Editor.Joint.Joint>[]
  let lastIndex = toBeDuplicated[toBeDuplicated.length-1].index
  for(let k=0; k < toBeDuplicated.length; k++) {
    let joint = clone(toBeDuplicated[k])
    joint.layerId = newLayer.id
    duplicates.push(
      sceneObjects.add(joint, lastIndex+1+k)
    )
  }
  selection.set(duplicates)
  return newLayer
}

export function removeLayer(layerId: number) {
  if(mapSettings.layers.length <= 1) return

  getLayerJoints(layerId)
    .forEach(sceneObjects.remove)

  let srcLayerIndex = getLayerIndex(layerId)

  if(mapSettings.currentLayerId === layerId) {
    mapSettings.currentLayerId =
      (mapSettings.layers[srcLayerIndex-1] || mapSettings.layers[srcLayerIndex+1]).id
  }
  
  mapSettings.layers.splice(srcLayerIndex, 1)
  mapSettings.invalidate()
}




const getAnimationIndex = (animationId: number) =>
  mapSettings.animations.findIndex(animation => animation.id === animationId)


export function addAnimation(): Animation {
  let frame0 = addLayer()
  let newAnimation: Animation = {
    id: findFirstAvailableId(),
    name: "",
    type: "circular",
    frames: [{
      duration: 300,
      layerId: frame0.id,
      platform: null,
    }]
  }
  mapSettings.animations.push(newAnimation)
  mapSettings.invalidate()
  return newAnimation
}

export function removeAnimation(animationId: number) {
  let srcAnimationIndex = getAnimationIndex(animationId)
  let animation = mapSettings.animations[srcAnimationIndex]
  for(let frame of animation.frames) {
    removeLayer(frame.layerId)
    removeAnimationFrameBackgroundPlatform(frame)
  }

  mapSettings.animations.splice(srcAnimationIndex, 1)
  mapSettings.invalidate()
}

export function addAnimationFrame(animationId: number) {
  let animation = mapSettings.animations.find(animation => animation.id === animationId)!
  let lastFrame = animation.frames[animation.frames.length-1]
  let lastFrameLayerIndex = getLayerIndex(lastFrame.layerId)
  let newLayer = addLayer(lastFrameLayerIndex+1)
  animation.frames.push({
    layerId: newLayer.id,
    duration: lastFrame.duration,
    platform: null,
  })
  mapSettings.invalidate()
}

export function removeAnimationFrame(animation: Animation, layerId: number) {
  let frame =  animation.frames.find(frame => frame.layerId === layerId)!
  if(frame.platform !== null) {
    removeAnimationFrameBackgroundPlatform(frame)
  }
  animation.frames.splice(animation.frames.indexOf(frame), 1)
  mapSettings.invalidate()
}

export function addAnimationFrameFromDuplicateLayer(animation: Animation, oldLayer: Layer, newLayer: Layer) {
  let duration = animation.frames.find(frame => frame.layerId === oldLayer.id)!.duration
  animation.frames.push({
    layerId: newLayer.id,
    duration,
    platform: null,
  })
  mapSettings.invalidate()
}

export function addAnimationFrameBackgroundPlatform(frame: Editor.MapSettings.Frame) {
  if(frame.platform !== null) return
  let p = Editor.Platform.make(Editor.Platform.defaults(0)) as Extract<Editor.Platform.Platform, Editor.Platform.NonStatic&Editor.Platform.Rectangle>
  p.dynamic = true
  p.fixedRotation = true
  p.mass = 1
  p.width = 100
  p.height = 100
  p.miceCollision = false
  p.objectCollision = false
  let store = sceneObjects.add(p)
  frame.platform = store.index
  store.subscribe(() => frame.platform = store.index)
  // TODO: watch when platform is removed OR prevent this platform from being removed
}

export function removeAnimationFrameBackgroundPlatform(frame: Editor.MapSettings.Frame) {
  if(frame.platform !== null) {
    sceneObjects.remove(sceneObjects.groups.platforms[frame.platform])
  }
  frame.platform = null
}


