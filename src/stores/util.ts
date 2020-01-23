
import * as S from "svelte/store"

// https://stackoverflow.com/a/50375286/1183577
export type UnionToIntersection<U> = 
  (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never

/* export type CustomStore<T> = T & {
  subscribe <T> (run: (value: T) => void): () => void
  set <T> (value: T): void
  update <T> (updater: (value: T) => T): void
} */
/* export type CustomStore<T> = T & {
  subscribe <T> (run: (value: T) => void, invalidate?: (value?: T) => void): () => void
  set <T> (value: T): void
  update <T> (updater: (value: T) => T): void
  invalidate: () => void
} */

export type CustomStore<T> = T & S.Writable<T> & { invalidate: () => void }

export function customStore <T extends object> (object: T): CustomStore<T> {
  let store = S.writable<T>(object)
  Object.defineProperties(object, {
    subscribe: {
      enumerable: false,
      value: store.subscribe,
    },
    set: {
      enumerable: false,
      value: store.set,
    },
    update: {
      enumerable: false,
      value: store.update,
    },
    invalidate: {
      enumerable: false,
      value: () => store.update(x=>x),
    },
  })
  return object as CustomStore<T>
 
}



export function getStore <T> (store: S.Readable<T>): T {
  let value: T
  store.subscribe(v => value = v)()
  return value!
}


type SetterHandler<S> 
  = (previousValue: S, 
    newValue: S) 
    => (S | void)
export function setterProxy <T extends object> (obj: T) {
  let handlers: { [K in keyof T]?: SetterHandler<T[K]>[] } = {}
  let proxy = new Proxy(obj, {
    set<K extends keyof T> (_: any, k: K, newValue: T[K]) {
      let previousValue = obj[k]
      obj[k] = newValue
      let fns: SetterHandler<T[K]>[] | undefined = handlers[k]
      if(fns !== undefined) {
        for(let fn of fns) {
          let v = fn(previousValue, obj[k])
          if(v === undefined) continue
          obj[k] = v
        }
        console.log("setterProxy.set", k, obj[k])
      }
      return true
    }
  })

  return [
    proxy,
    function onPropertyChange<K extends keyof T>(key: K, handler: SetterHandler<T[K]>) {
      let fns = handlers[key]
      if(fns === undefined) {
        fns = handlers[key] = []
      }
      fns.push(handler)
    }
  ] as const
}


/* type SetterHandler<S> 
  = (currentValue: S, 
    newValue: S) 
    => (S | void)
export interface WritableWithSetterProxy<T> extends S.Writable<T> {
  onPropertyChange<K extends keyof T>(key: K, handler: SetterHandler<T[K]>): void
}
export function writableWithSetterProxy <T extends object> (obj: T): WritableWithSetterProxy<T> {
  let handlers: { [K in keyof T]?: SetterHandler<T[K]>[] } = {}
  let proxy = new Proxy(obj, {
    set<K extends keyof T> (_, k: K, newValue: T[K]) {
      let currentValue = obj[k]
      let fns: SetterHandler<T[K]>[] | undefined = handlers[k]
      if(fns !== undefined) {
        for(let fn of fns) {
          let v = fn(currentValue, newValue)
          if(v === undefined) continue
          newValue = v
        }
      }
      obj[k] = newValue
      return true
    }
  })
  return {
    ...S.writable(obj),
    onPropertyChange(k, fn) {
      let fns = handlers[k]
      if(fns === undefined) {
        fns = handlers[k] = []
      }
      fns.push(fn)
    }
  }
} */

