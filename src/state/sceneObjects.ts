
import * as Editor from "data/editor"

import { writable, Writable, derived, readable, Readable, get } from "svelte/store"

import { store, Store } from "state/util"

import { clamp } from "data/base/util"

import * as history from "state/history"



export type SceneObject = Store<Editor.Object>



export const groups = {
  platforms:     store([] as Store<Editor.Platform.Platform>[]),
  decorations:   store([] as Store<Editor.Decoration.Decoration>[]),
  shamanObjects: store([] as Store<Editor.ShamanObject.ShamanObject>[]),
  joints:        store([] as Store<Editor.Joint.Joint>[]),
  images:        store([] as Store<Editor.Image.Image>[]),
}
groups.platforms.subscribe(history.invalidate)
groups.decorations.subscribe(history.invalidate)
groups.shamanObjects.subscribe(history.invalidate)
groups.joints.subscribe(history.invalidate)
groups.images.subscribe(history.invalidate)

export function clear() {
  groups.platforms.splice(0)
  groups.platforms.invalidate()
  groups.decorations.splice(0)
  groups.decorations.invalidate()
  groups.shamanObjects.splice(0)
  groups.shamanObjects.invalidate()
  groups.joints.splice(0)
  groups.joints.invalidate()
  groups.images.splice(0)
  groups.images.invalidate()
}

function getGroup(obj: Editor.Object): Store<SceneObject[]> {
  if(Editor.isPlatform(obj))     return groups.platforms
  if(Editor.isDecoration(obj))   return groups.decorations
  if(Editor.isJoint(obj))        return groups.joints
  if(Editor.isShamanObject(obj)) return groups.shamanObjects
  if(Editor.isImage(obj))        return groups.images
  throw "never"
}

function setIndex(obj: SceneObject, group: Store<SceneObject[]>, target: number) {
  target = clamp(target, 0, group.length-1)
  let src = obj.index
  //if(target === src) return
  if(target < src) {
    for(let i=src; i > target; i--) {
      group[i] = group[i-1]
      group[i].index = i
      group[i].invalidate()
    }
  } else {
    for(let i=src; i < target; i++) {
      group[i] = group[i+1]
      group[i].index = i
      group[i].invalidate()
    }
  }
  group[target] = obj
  obj.index = target
  obj.invalidate()
  group.invalidate()
  console.log("setIndex [end]", group === groups.platforms ? "groups.platforms was invalidated": "")
}

function removeFromGroup(group: Store<SceneObject[]>, obj: SceneObject) {
  for(let i=obj.index; i < group.length-1; i++) {
    group[i] = group[i+1]
    group[i].index--
    group[i].invalidate()
  }
  group.pop()
  group.invalidate()
}


export function add(obj: Editor.Object, index?: number): SceneObject {
  let group = getGroup(obj)
  let s = store(obj)
  s.index = group.length
  group.push(s)
  setIndex(s, group, index !== undefined ? index : group.length)
  s.subscribe(history.invalidate)
  return s
}

export function remove(obj: SceneObject) {
  removeFromGroup(getGroup(obj), obj)
}

export function getAll() {
  return Object.values(groups).flat() //as SceneObject[]
}



function derive <T,S> (store: Readable<T>, transform: (value: T) => NonNullable<S>): Readable<S> {
  let init: S
  store.subscribe(value => init = transform(value))()
  return readable(init!, set =>
    store.subscribe(value => set(transform(value))))
}



export const platforms = derive(groups.platforms, all => {
  let [foreground,background] = all.split(Editor.Platform.isForeground)
  return {all,foreground,background}
})

export const decorations = derive(groups.decorations, all => {
  let [foreground,background] = all.split(Editor.Decoration.isForeground)
  return {all,foreground,background}
})

export const shamanObjects = derive(groups.shamanObjects, all => {
  let [foreground,background] = all.split(Editor.ShamanObject.isForeground)
  return {all,foreground,background}
})

export const joints = derive(groups.joints, all => {
  let [foreground,background] = all.filter(Editor.Joint.isRendered).split(Editor.Joint.isForeground)
  return {all,foreground,background}
})

export const images = derive(groups.images, all => {
  let [disappearing,rest] = all.split(Editor.Image.isDisappearing)
  let [foreground,background] = rest.split(Editor.Image.isForeground)
  return {all,disappearing,foreground,background}
})
