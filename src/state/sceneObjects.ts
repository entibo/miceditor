
import * as Editor from "data/editor"

import { writable, Writable, derived, readable, Readable, get } from "svelte/store"

import { store, Store } from "state/util"

import { clamp } from "data/base/util"

import * as history from "state/history"
import * as selection from "state/selection"



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

export function getGroup<T extends Editor.Object>(obj: T): Store<Store<T>[]>
export function getGroup(obj: Editor.Object) {
  if(Editor.isPlatform(obj))     return groups.platforms
  if(Editor.isDecoration(obj))   return groups.decorations
  if(Editor.isShamanObject(obj)) return groups.shamanObjects
  if(Editor.isJoint(obj))        return groups.joints
  if(Editor.isImage(obj))        return groups.images
  throw "never"
}

export function setIndex(obj: SceneObject, target: number) {
  let group = getGroup(obj as Editor.Object)
  target = clamp(target, 0, group.length-1)
  // let src = obj.index
  let src = group.indexOf(obj)
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
  if(group[obj.index] !== obj) {
    console.error("removeFromGroup: index is invalid", obj, group)
    return
  }
  for(let i=obj.index; i < group.length-1; i++) {
    group[i] = group[i+1]
    group[i].index--
    group[i].invalidate()
  }
  group.pop()
  group.invalidate()
}

export function add <T extends Editor.Object> (obj: T, index?: number): Store<T>
export function add(obj: Editor.Object, index?: number) {
  let group = getGroup(obj)
  let s = store(obj)
  s.index = group.length
  group.push(s)
  if(index !== undefined)
    setIndex(s, index)
  group.invalidate()
  s.subscribe(history.invalidate)

  if(Editor.isJoint(s))
    onJointAdded(s as J)

  else if(Editor.isPlatform(s))
    onPlatformAdded(s as P)

  return s
}

export function remove(obj: SceneObject) {
  removeFromGroup(getGroup(obj), obj)
  if(obj.selected) selection.unselect(obj)

  if(Editor.isJoint(obj))
    onJointRemoved(obj as J)

  else if(Editor.isPlatform(obj))
    onPlatformRemoved(obj as P)
}

export function getAll() {
  return Object.values(groups).flat() //as SceneObject[]
}




type P = Store<Editor.Platform.Platform>
type J = Store<Editor.Joint.Joint>

type PlatformLink = { obj: P, unsubscribe: () => void }

const links = {
  joints: new WeakMap<
    J, 
    { platform1?: PlatformLink,
      platform2?: PlatformLink }
  >(),
  platforms: new WeakMap<P, Set<J>>(),
}

export function getJointPlatforms(joint: J) {
  let value = links.joints.get(joint)
  if(!value) return { platform1: null, platform2: null }
  return {
    platform1: value.platform1 ? value.platform1.obj : null,
    platform2: value.platform2 ? value.platform2.obj : null,
  }
}

export function linkJointToPlatform(joint: J, which: "platform1"|"platform2", platformIndex: number) {
  let value = links.joints.get(joint)
  if(!value) links.joints.set(joint, value = {})

  // Disconnect previous platform, if any
  let data = value[which]
  if(data) {
    data.unsubscribe()
    // Remove joint from platform's set, unless still connected
    let otherData = value[which === "platform1" ? "platform2" : "platform1"]
    if(otherData && otherData.obj === data.obj) {}
    else {
      let jointSet = links.platforms.get(data.obj)
      jointSet && jointSet.delete(joint)
    }
  }

  // Connect to new platform, if it exists
  let platform = groups.platforms[platformIndex]
  if(platform === undefined) {
    delete value[which]
    return
  }
  value[which] = {
    obj: platform,
    unsubscribe: platform.subscribe(obj => {
      joint[which] = obj.index
      ;(joint as any)[which+"Ref"] = obj
      joint.invalidate()
    }),
  }
  let jointSet = links.platforms.get(platform)
  if(!jointSet) links.platforms.set(platform, jointSet = new Set())
  jointSet.add(joint)

}


function onJointAdded(joint: J) {
  linkJointToPlatform(joint, "platform1", joint.platform1)
  linkJointToPlatform(joint, "platform2", joint.platform2)
}

function onPlatformAdded(platform: P) {
  if(!Editor.Platform.isStatic(platform)) return
  for(let joint of groups.joints) {
    let value = links.joints.get(joint)
    if(!value) continue
    for(let which of (["platform1","platform2"] as const)) {
      if(joint[which] !== platform.index) continue
      let data = value[which]
      if(data) continue
      linkJointToPlatform(joint, which, platform.index)
    }
  }
}

function onJointRemoved(joint: J) {
  let value = links.joints.get(joint)
  if(!value) return
  for(let which of (["platform1","platform2"] as const)) {
    let data = value[which]
    if(!data) continue
    data.unsubscribe()
    let jointSet = links.platforms.get(data.obj)
    jointSet && jointSet.delete(joint)
  }
}

function onPlatformRemoved(platform: P) {
  let joints = links.platforms.get(platform) || []

  if(!Editor.Platform.isStatic(platform)) {
    for(let joint of joints)
      remove(joint)
    return
  }

  let firstStaticPlatformIndex = groups.platforms.findIndex(obj => Editor.Platform.isStatic(obj))
  if(firstStaticPlatformIndex === -1) firstStaticPlatformIndex = 0
  
  for(let joint of joints) {
    let value = links.joints.get(joint)
    if(!value) continue
    for(let which of (["platform1","platform2"]) as const) {
      let data = value[which]
      if(!data) continue
      if(data.obj !== platform) continue
      joint[which] = firstStaticPlatformIndex
      linkJointToPlatform(joint, which, firstStaticPlatformIndex)
    }
  }

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
  let [spawns,rest] = all.split(Editor.Decoration.isSpawn)
  let [foreground,background] = rest.split(Editor.Decoration.isForeground)
  return {all,spawns,foreground,background}
})

export const shamanObjects = derive(groups.shamanObjects, all => {
  let [foreground,background] = all.split(Editor.ShamanObject.isForeground)
  return {all,foreground,background}
})

export const joints = derive(groups.joints, all => {
  let [renderable,hidden] = all.split(Editor.Joint.isRendered)
  let [foreground,background] = renderable.split(Editor.Joint.isForeground)
  return {all,foreground,background,hidden}
})

export const images = derive(groups.images, all => {
  let [disappearing,rest] = all.split(Editor.Image.isDisappearing)
  let [foreground,background] = rest.split(Editor.Image.isForeground)
  return {all,disappearing,foreground,background}
})

