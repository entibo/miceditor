
import { writable, Writable, derived, get as storeGet } from "svelte/store"

import { combine } from "common"

import * as Editor from "data/editor"
import { readUrl } from "data/base/Image"

import * as sceneObjects from "state/sceneObjects"
import { SceneObject } from "state/sceneObjects"
import { store, Store } from "state/util"

import * as selection from "state/selection"


type Data = {
  [T in Editor.Object["objectType"]]: Record<string, Descriptor<T>>
}

type Descriptor<T> = {
  path?: string[]

  autoGet?: boolean
  value?: any

  autoSet?: boolean
  set?: (v: any) => void
  sideEffect?: (obj: Store<Extract<Editor.Object,{objectType:T}>>) => void

  reset?: () => void
  defaultValue?: (obj: Extract<Editor.Object,{objectType:T}>) => void
}


const data = store<Data>({
  PLATFORM: {
    type: {
      autoSet: false,
      set: (type: number) => {
        for(let obj of groups.PLATFORM) {
          if(type === obj.type) continue
          let defaults = Editor.Platform.make(Editor.Platform.defaults(type))
          for(let [k,v] of Object.entries(defaults)) {
            if(k in obj) continue
            (obj as any)[k] = v
          }
          if(defaults.type === Editor.Platform.Type.Circle)
            (obj as any).radius = Math.max(10, (obj as any).width/2 ^0)
          if(obj.type === Editor.Platform.Type.Circle)
            (obj as any).width = (obj as any).height = obj.radius*2
          for(let [k,v] of Object.entries(obj)) {
            if(k in defaults) continue
            else delete (obj as any)[k]
          }
          obj.type = type
          obj.invalidate()
        }
      },
    },
    index: {
      // sideEffect: obj => sceneObjects.setIndex(obj, obj.index),
      autoSet: false,
      set: (v: number) => {
        if(groups.PLATFORM.length === 1)
          sceneObjects.setIndex(groups.PLATFORM[0], v)
      },
    },
    x: {},
    y: {},
    invisible: {},
    lua: {},
    nosync: {},
    dynamic: {},
    mass: {
      defaultValue: () => 0,
    },
    linearDamping: {
      defaultValue: () => 0,
    },
    angularDamping: {
      defaultValue: () => 0,
    },
    friction: {
      defaultValue: obj => (Editor.Platform.defaults(obj.type) as any).friction
    },
    restitution: {
      defaultValue: obj => (Editor.Platform.defaults(obj.type) as any).restitution
    },
    fixedRotation: {},
    foreground: {
      sideEffect: () => sceneObjects.groups.platforms.invalidate()
    },
    vanish: {},
    miceCollision: {},
    objectCollision: {},
    color: {},
    width: {},
    height: {},
    radius: {},
    rotation: {
      defaultValue: () => 0,
    },
    imageEnabled: {
      path: ["image", "enabled"],
    },
    imageValue: {
      path: ["image", "imageUrl", "value"],
      sideEffect: obj => obj.image.imageUrl = readUrl(obj.image.imageUrl.value),
    },
    imageX: {
      path: ["image", "x"],
    },
    imageY: {
      path: ["image", "y"],
    },
    boosterEnabled: {
      path: ["booster", "enabled"],
      /* sideEffect: obj => {
        if(!("dynamic" in obj)) return
        if(obj.booster.enabled) {
          obj.dynamic = true
          obj.fixedRotation = false
        }
      }, */
    },
    boosterAngle: {
      path: ["booster", "angle"],
    },
    boosterSpeed: {
      path: ["booster", "speed"],
    },
    physics: {
      autoGet: false,
      autoSet: false,
      set: v => {
        if(v === "BOOSTER")
          data.PLATFORM.boosterEnabled.set!(true)
        else {
          data.PLATFORM.boosterEnabled.set!(false)
          if(v === "DYNAMIC")
            data.PLATFORM.dynamic.set!(true)
          else {
            data.PLATFORM.dynamic.set!(false)
          }
        }
      }
    },
  },
  DECORATION: {
    x: {},
    y: {},
    holeColor: {},
    foreground: {
      sideEffect: () => sceneObjects.groups.decorations.invalidate()
    },
    reverse: {},
    color0: {
      path: ["colors", "0"],
    },
    color1: {
      path: ["colors", "1"],
    },
    color2: {
      path: ["colors", "2"],
    },
    color3: {
      path: ["colors", "3"],
    },
  },
  IMAGE: {
    x: {},
    y: {},
    imageValue: {
      path: ["imageUrl", "value"],
      sideEffect: obj => obj.imageUrl = readUrl(obj.imageUrl.value),
    },
    foreground: {
      sideEffect: () => sceneObjects.groups.images.invalidate()
    },
    disappearing: {
      autoGet: false,
      autoSet: false,
      set: v => {
        for(let obj of groups.IMAGE as any) {
          if(v) {
            delete obj.foreground
            obj.rx = "rx" in obj ? obj.rx : 0
            obj.ry = "ry" in obj ? obj.ry : 0
            obj.rw = "rw" in obj ? obj.rw : 0
            obj.rh = "rh" in obj ? obj.rh : 0
          }
          else {
            obj.foreground = "foreground" in obj ? obj.foreground : false
            delete obj.rx
            delete obj.ry
            delete obj.rw
            delete obj.rh
          }
          obj.invalidate()
          sceneObjects.groups.images.invalidate()
        }
      },
    },
    rx: {},
    ry: {},
    rw: {},
    rh: {},
  },
  SHAMANOBJECT: {
    x: {},
    y: {},
    rotation: {},
    ghost: {},
    power: {},
    speed: {},
    nosync: {},
  },
  JOINT: {
    type: {},
    platform1: {
      sideEffect: obj => sceneObjects.linkJointToPlatform(obj, "platform1", obj.platform1)
    },
    platform2: {
      sideEffect: obj => sceneObjects.linkJointToPlatform(obj, "platform2", obj.platform2)
    },
    point1X: {
      path: ["point1", "x"]
    },
    point1Y: {
      path: ["point1", "y"]
    },
    point1Enabled: {
      path: ["point1", "enabled"]
    },
    point2X: {
      path: ["point2", "x"]
    },
    point2Y: {
      path: ["point2", "y"]
    },
    point2Enabled: {
      path: ["point2", "enabled"]
    },
    point3X: {
      path: ["point3", "x"]
    },
    point3Y: {
      path: ["point3", "y"]
    },
    point3Enabled: {
      path: ["point3", "enabled"]
    },
    point4X: {
      path: ["point4", "x"]
    },
    point4Y: {
      path: ["point4", "y"]
    },
    point4Enabled: {
      path: ["point4", "enabled"]
    },
    controlPoint1X: {
      path: ["controlPoint1", "x"]
    },
    controlPoint1Y: {
      path: ["controlPoint1", "y"]
    },
    controlPoint2X: {
      path: ["controlPoint2", "x"]
    },
    controlPoint2Y: {
      path: ["controlPoint2", "y"]
    },
    fineness: {},
    renderEnabled: {
      sideEffect: () => sceneObjects.groups.joints.invalidate()
    },
    color: {},
    thickness: {},
    opacity: {},
    foreground: {
      sideEffect: () => sceneObjects.groups.joints.invalidate()
    },
  },
})
export const properties = data


/**
 * Keep track of the different groups of objects in the selection
 */
export const groups = store< Groups >({
  PLATFORM: [],
  DECORATION: [],
  IMAGE: [],
  JOINT: [],
  SHAMANOBJECT: [],
})
type Groups = { [K in keyof Data]: Store< Extract<Editor.Object,{objectType:K}>>[] };

/**
 * Initialize every property's `set` function
 */
for(let _objectType in data) {
  let objectType = _objectType as keyof Data
  for(let [alias,_desc] of Object.entries(data[objectType])) {
    let desc = _desc as Descriptor<typeof objectType>
    let path = desc.path || [alias]
    if(desc.autoSet === false) continue
    desc.set = v => {
      let changedObjects = setValue(groups[objectType], v, ...path)
      for(let obj of changedObjects) {
        if(desc.sideEffect)
          desc.sideEffect(obj as any)
        obj.invalidate()
      }
    }
    if(desc.defaultValue) {
      desc.reset = () => {
        let changedObjects = setValue(groups[objectType], desc.defaultValue, ...path)
        for(let obj of changedObjects) {
          if(desc.sideEffect)
            desc.sideEffect(obj as any)
          obj.invalidate()
        }
      }
    }
  }
}


selection.selection.subscribe(list => {

  for(let _objectType in groups)
    groups[_objectType as keyof Groups] = []
  for(let obj of list)
    groups[obj.objectType].push(obj as any)
  groups.invalidate()

  /**
   * Every time the selection update, compute each property's value
   */
  for(let _objectType in data) {
    let objectType = _objectType as keyof Data
    for(let [alias,_desc] of Object.entries(data[objectType])) {
      let desc = _desc as Descriptor<typeof objectType>
      if(desc.autoGet === false) continue
      let path = desc.path || [alias]
      desc.value = getValue(groups[objectType], ...path)
    }
  }

  data.PLATFORM.physics.value =
    data.PLATFORM.boosterEnabled.value === true ? "BOOSTER" :
    data.PLATFORM.dynamic.value === true ? "DYNAMIC" :
    (data.PLATFORM.boosterEnabled.value === false && data.PLATFORM.dynamic.value === false) ? "STATIC" :
    ""

  data.IMAGE.disappearing.value =
    data.IMAGE.rx.value === undefined ? false :
    data.IMAGE.foreground.value === undefined ? true :
    null

  data.invalidate()

})




function getValue(list: Store<Editor.Object>[], ...keys: string[]) {
  let values = []
  P: for(let obj of list) {
    let o = obj as any
    for(let k of keys) {
      if(!(k in o)) continue P
      o = o[k]
    }
    values.push(o)
  }
  return combine(values)
}

/**
 * @return subset of objects which have been changed
 */
function setValue(list: Store<Editor.Object>[], valueOrFunction: any, ...keys: string[]): Store<Editor.Object>[] {
  let changedObjects = []
  let lastKey = keys.pop() as string
  P: for(let obj of list) {
    let o = obj as any
    for(let k of keys) {
      if(!(k in o)) continue P
      o = o[k]
    }
    if(!(lastKey in o)) continue P
    let value = typeof valueOrFunction === "function"
      ? valueOrFunction(obj)
      : valueOrFunction
    if(value !== undefined && o[lastKey] !== value) {
      o[lastKey] = value
      changedObjects.push(obj)
    }
  }
  return changedObjects
}

