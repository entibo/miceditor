
import * as Common from "data/Common"
import * as MapSettings from "data/MapSettings"
import * as Platform from "data/Platform"
/* import * as Decoration from "data/Decoration"
import * as ShamanObject from "data/ShamanObject"
import * as Joint from "data/Joint" */
import * as Editor from "editor"

import { writable, Writable, derived, readable, Readable, get } from "svelte/store"

import { store, Store } from "stores/util"

import { clamp } from "data/util"



export type SceneObject
  = Store<Editor.Object>
  // |



export const groups = {
  platforms: store([] as Store<Editor.Platform.Platform>[]),
/*   platforms: util.customStore([] as util.CustomStore<Data.Platform>[]),
  images: util.customStore([] as ImageSceneObject[]), */
}

function getGroup(obj: Editor.Object): Store<SceneObject[]> {
  if(Editor.isPlatform(obj)) return groups.platforms
  if(Editor.isImage(obj)) return groups.images
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
  setIndex(s, group, index ?? group.length)
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

export const platforms = derive(groups.platforms, list => {
  let background = [] as PlatformSceneObject[], 
      foreground = [] as PlatformSceneObject[]
  for(let obj of list) {
    console.log("(derived) platforms", "foreground:", (obj as any).foreground)
    if(Platform.isForeground(obj)) {
      foreground.push(obj)
    } else {
      background.push(obj)
    }
  }
  return {background, foreground}
})

/* export const platforms = readable({ background: [], foreground: []}, set => {
  groups.platforms.subscribe(list => {
    console.log("(derived) platforms")
    let background = [] as PlatformSceneObject[], 
        foreground = [] as PlatformSceneObject[]
    for(let obj of list) {
      if(Platform.isForeground(obj)) {
        foreground.push(obj)
      } else {
        background.push(obj)
      }
    }
    set({background, foreground})
  })
}) */

/* type PlatformWithMetadata 
  = Platform.Platform
  & { group: "platforms"
      index: number }
type ImageWithMetadata 
  = Common.Image
  & { group: "images", layer: "background" | "foreground" | "APS"
      index: number } */

/* type DataWithMetadata
  = ImageWithMetadata
  | PlatformWithMetadata
  | DecorationWithMetaData
  | ShamanObjectWithMetaData
  | JointWithMetaData 
*/



/*
  Store containing a list of (stores) all
  interactive/renderable/selectable things

  Updates when:
    * an object is added/removed
    * objects are re-ordered
    * a property of an object that affects how it should be rendered
      beyond the scope of its respective component is changed
      e.g: background/foreground
*/
/* let $sceneObjects = [] as Array<Writable<SceneObject.SceneObject>>
let { subscribe, set, update } = writable($sceneObjects)
subscribe(list => $sceneObjects = list)

function createStoreFromSceneObject(obj: SceneObject.SceneObject): Writable<SceneObject.SceneObject> {
  if(SceneObject.isPlatform(obj)) {
    if("foreground" in obj) {
      let store = writableWithSetterProxy(obj)
      store.onPropertyChange("foreground", () => update(x=>x))
      return store
    }
  }
  return writableWithSetterProxy(obj)
} */

/* export function add(obj: SceneObject.SceneObject) {
  let store = createStoreFromSceneObject(obj)
  update(list => {
    list.push(store)
    return list
  })
  //store.subscribe(() => update(x=>x)) // why ?
}
 */

// export { subscribe }

/* export const platforms = derived({subscribe}, 
  () => $sceneObjects)



export const visiblePlatforms 
  = derived([{subscribe}, visibility.platforms], ([_, visible]) => {
    let r = { 
      background: [] as Writable<Platform.Platform>[], 
      foreground: [] as Writable<Platform.Platform>[],
    }
    if(!visible) return r
    for(let store of $sceneObjects) {
      let obj = getStore(store)
      if(!SceneObject.isPlatform(obj)) continue
      if(Platform.isForeground(obj)) {
        r.foreground.push(store)
      } else {
        r.background.push(store)
      }
    }
    return r
  })


 */
