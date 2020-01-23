
import * as Common from "data/Common"
import * as MapSettings from "data/MapSettings"
import * as Platform from "data/Platform"
/* import * as Decoration from "data/Decoration"
import * as ShamanObject from "data/ShamanObject"
import * as Joint from "data/Joint" */
import * as Data from "data/Data"

import { writable, Writable, derived, readable, Readable, get } from "svelte/store"

import * as util from "stores/util"

import { clamp } from "data/util"



type BaseMetadata = {
  visible: boolean
  interactive: boolean
}
const baseMetadataDefaults: () => BaseMetadata = () => ({
  visible: true,
  interactive: true,
})
type Indexed = {
  index: number
}
type ExtraMetadata<T extends Data.Data>
  = T extends Common.Image 
    ? { foreground: boolean
        APS: boolean } 
  : {}
type Metadata<T extends Data.Data> = BaseMetadata & Indexed & ExtraMetadata<T>

type PlatformWithMetadata = Platform.Platform & Metadata<Platform.Platform>
type ImageWithMetadata = Common.Image & Metadata<Common.Image>

type PlatformSceneObject = util.CustomStore<Platform.Platform & Metadata<Platform.Platform>>
type ImageSceneObject = util.CustomStore<Common.Image & Metadata<Common.Image>>

export type SO<T extends Data.Data> = util.CustomStore<T & Metadata<T>>

export type SceneObject
  = SO<Platform.Platform>
  | SO<Common.Image>



export const groups = {
  platforms: util.customStore([] as PlatformSceneObject[]),
  images: util.customStore([] as ImageSceneObject[]),
}

function setIndex(group: util.CustomStore<SceneObject[]>, obj: SceneObject, target: number) {
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

function removeFromGroup(group: util.CustomStore<SceneObject[]>, obj: SceneObject) {
  for(let i=obj.index; i < group.length-1; i++) {
    group[i] = group[i+1]
  }
  group.pop()
  group.invalidate()
}


export function add
  (data: Data.Data, 
  _base?: Partial<BaseMetadata>, 
  _extra?: Partial<ExtraMetadata<Data.Data>>, 
  _index?: number): SceneObject {

  let base = Object.assign(_base||{}, baseMetadataDefaults())
  let extra = _extra||{}
  let index = _index ? _index : getGroup(data).length

  return Data.isPlatform(data) ? addPlatform(data, base, index) 
     //: Data._ ? add_(data, meta)
       : addImage(data, base, extra, index)
}


function addPlatform(data: Platform.Platform, base: BaseMetadata, index: number): SceneObject {
  console.log("addPlatform")
  let group = groups.platforms
  let withMeta = { ...data, ...base, index}

  if("foreground" in withMeta) {
    let [proxy, onPropertyChange] = util.setterProxy(withMeta)
    onPropertyChange("foreground", group.invalidate)
    withMeta = proxy
  }

  let obj = util.customStore(withMeta)
  group.push(obj)
  setIndex(group, obj, obj.index)
  return obj
}

function addImage(data: Common.Image, base: BaseMetadata, _extra: any, index: number): SceneObject {
  let group = groups.images
  let extra: ExtraMetadata<Common.Image> 
    = Object.assign(_extra, { foreground: false, APS: false, })
  let withMeta = { ...data, ...base, ...extra, index}
  
  let [proxy, onPropertyChange] = util.setterProxy(withMeta)
  onPropertyChange("foreground", group.invalidate)
  onPropertyChange("APS", group.invalidate)
  withMeta = proxy
  
  let obj = util.customStore(withMeta)
  group.push(obj)
  setIndex(group, obj, obj.index)
  return obj
}

export function remove(obj: SceneObject) {
  let group 
    = Data.isPlatform(obj) ? groups.platforms
    : Data.isImage(obj)    ? groups.images
    : null
  removeFromGroup(group!, obj)
}

export function getAll() {
  return Object.values(groups).map(get).flat() as SceneObject[]
}



function getGroup(data: Data.Data): util.CustomStore<SceneObject[]> {
  if(Data.isPlatform(data)) return groups.platforms
  if(Data.isImage(data)) return groups.images
  throw "never"
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
