/* 
import { derived } from "svelte/store"
import * as util from "state/util"

import * as selection from "state/selection"
import * as Editor from "data/editor"






function g 
  <T, I extends UnionToIntersection<T>, K0 extends keyof I>
  (t: T, k0: K0)
  : I[K0] | undefined

function g 
  <T, I0 extends UnionToIntersection<T>, K0 extends keyof I0, 
      I1 extends UnionToIntersection<I0[K0]>, K1 extends keyof I1>
  (t: T, k0: K0, k1: K1)
  : I1[K1] | undefined

function g 
  <T, I0 extends UnionToIntersection<T>, K0 extends keyof I0, 
      I1 extends UnionToIntersection<I0[K0]>, K1 extends keyof I1,
      I2 extends UnionToIntersection<I1[K1]>, K2 extends keyof I2>
  (t: T, k0: K0, k1: K1, k2: K2)
  : I2[K2] | undefined

function g(t: any, ...keys: string[]) {
  for(let k of keys) {
    if(!(k in t)) return
    t = t[k]
  }
  return t
}

type Inter = UnionToIntersection<Editor.Platform.Platform>



const proxify = (target: any, ...keys: any[] = []) =>
  new Proxy(target, {
    get(t, k: any) {
      return k in t
        ? t[k]
        : "get_"+k in t
          ? t["get_"+k]
          : get(...keys, k)
    },
    set(t, k: any, v) {
      "set_"+k in t
        ? t["set_"+k]
        : set(v, ...keys, k)
      return true
    }
  })




export default derived(selection.store, objects => {
  let _platforms = objects.filter(x => Editor.isPlatform(x)) 
  let platforms = _platforms as util.Store<UnionToIntersection<Editor.Platform.Platform>>[]


  let p = proxify({
    set_type(v: boolean) {

    },
    set_foreground(v: boolean) {

    },
    image: proxify({
      imageUrl: proxify({}, "image", "imageUrl")
    }, "image")
  })



  function foo<T>(fn: (p: Editor.Platform.Platform) => T | undefined): T | undefined | null {
    let values = platforms.map(fn).filter(x => x !== undefined) as T[]
    return combine(values)
  }



  for(let p of platforms) {
    g(p, "invisible")
    g(p, "image", "imageUrl", "value")
  }



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

  type Head<P extends any[]> =
  P extends [any, ...any[]]
  ? P[0]
  : never

  type Tail<P extends any[]> =
    ((...xs: P)=>any) extends ((x: any, ...xs: infer T)=>any)
    ? T
    : []

  let _x: Tail<[number,string,boolean]>
  let x: Head<[number,string]> = 5

  type _PathType <T extends {}, P extends string[]> =
    P extends []
    ? T
    : Head<P> extends keyof T
      ? T[Head<P>] extends {}
        ? _PathType<T[Head<P>], Tail<P>>
        : never
      : never

  type PathType <T extends {}, P extends string[]> =
    {
      0:  T
      1:  Head<P> extends keyof T
          ? T[Head<P>] extends {}
            ? PathType<T[Head<P>], Tail<P>>
            : never
          : never
    }[ P extends [] ? 0 : 1 ]



  function auto <T extends string, P extends string[]> 
  (alias: T, ...keys: P): { [K in T]: PathType<Inter,P> } {
    return <any>{
      get [alias]()       { return get(...keys) },
      set [alias](v: any) { set(v, ...keys) },
    }
  }

  return {
    ...auto("imageEnabled", "image", "enabled"),

    ...auto("x"),
    ...auto("y"),
    ...auto("width"),
    ...auto("height"),
    ...auto("radius"),
    ...auto("color"),
    ...auto("invisible"),
    ...auto("lua"),
    ...auto("nosync"),

    ...auto("dynamic"),
    ...auto("mass"),
    ...auto("linearDamping"),
    ...auto("angularDamping"),
    ...auto("friction"),
    ...auto("restitution"),
    ...auto("fixedRotation"),
    ...auto("foreground"),
    ...auto("vanish"),
    ...auto("miceCollision"),
    ...auto("objectCollision"),
    ...auto("rotation"),

    get type()  { return get("type") },
    set type(v) {
      for(let platform of platforms) {
        // P.setType(platform, v)
        platform.invalidate()
        // Layer update group
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

    get boosterEnabled()  { return get("booster", "enabled") },
    set boosterEnabled(v) { 
      set(v, "booster", "enabled")
    },
    get boosterAxis()  { return get("booster", "axis") },
    set boosterAxis(v) { 
      set(v, "booster", "axis")
    },
    get boosterPower()  { 
      combine(platforms.map(p => p.booster?.power))
      return get("booster", "power") 
    },
    get 
    set boosterPower(v) { 
      set(v, "booster", "power")
    },

  }
})

function combine<T>(values: T[]): T | null | undefined {
  let value = undefined
  for(let x of values) {
    if(value === undefined) value = x
    else if(value !== x) return null
  }
  return value
} */