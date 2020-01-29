
import { derived } from "svelte/store"
import * as util from "stores/util"

import * as selection from "stores/selection"
import * as Data from "data/Data"


export default derived(selection.store, objects => {
  let platforms = objects.filter(x => Data.isPlatform(x)) 
  platforms

  function get(...keys: string[]) {
    let values = []
    P: for(let p of platforms) {
      let o = p as any
      for(let k of keys) {
        if(!(k in o)) continue P
        o = o[k]
      }
      values.push(o)
    }
    return combine(values)
  }
  function set(v: any, ...keys: string[]) {
    let lastKey = keys.pop() as string
    P: for(let p of platforms) {
      let o = p as any
      for(let k of keys) {
        if(!(k in o)) continue P
        o = o[k]
      }
      if(!(lastKey in o)) continue P
      o[lastKey] = v
      p.invalidate()
    }
  }
  function auto(alias: string, ...keys: string[]) {
    return {
      get [alias]()       { return get(...keys) },
      set [alias](v: any) { set(v, ...keys) },
    }
  }

  return {
    ...auto("x"),
    ...auto("y"),
    ...auto("width"),
    ...auto("height"),
    ...auto("radius"),
    ...auto("invisible"),
    ...auto("lua"),
    ...auto("nosync"),
    ...auto("foreground"),
    ...auto("vanish"),
    ...auto("miceCollision"),
    ...auto("objectCollision"),
    ...auto("color"),
    ...auto("rotation"),

    get type()  { return get("type") },
    set type(v) {
      for(let platform of platforms) {
        // P.setType(platform, v)
        platform.invalidate()
      }
    },

    get foreground()  { return get("foreground") },
    set foreground(v) { 
      set(v, "foreground")
      // Layer update group
    },

    get imageEnabled()  { return get("image", "enabled") },
    set imageEnabled(v) { 
      set(v, "image", "enabled")
    },
    get imageUrl()  { return get("image", "imageUrl", "value") },
    set imageUrl(v) { 
      set(v, "image", "imageUrl", "value")
    },

    get dynamicEnabled()  { return get("dynamic", "enabled") },
    set dynamicEnabled(v) { set("dynamic", "enabled") },

    get dynamicEnabled()  { return get("dynamic", "enabled") },
    set dynamicEnabled(v) { set("dynamic", "enabled") },
    get dynamicEnabled()  { return get("dynamic", "enabled") },
    set dynamicEnabled(v) { set("dynamic", "enabled") },
    get dynamicEnabled()  { return get("dynamic", "enabled") },
    set dynamicEnabled(v) { set("dynamic", "enabled") },
    get dynamicEnabled()  { return get("dynamic", "enabled") },
    set dynamicEnabled(v) { set("dynamic", "enabled") },
    get dynamicEnabled()  { return get("dynamic", "enabled") },
    set dynamicEnabled(v) { set("dynamic", "enabled") },
    get dynamicEnabled()  { return get("dynamic", "enabled") },
    set dynamicEnabled(v) { set("dynamic", "enabled") },
  }
})

function combine<T>(values: T[]): T | null | undefined {
  let value = undefined
  for(let x of values) {
    if(value === undefined) value = x
    else if(value !== x) return null
  }
  return value
}