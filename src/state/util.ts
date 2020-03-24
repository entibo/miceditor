
import * as S from "svelte/store"


export function persistentWritable<T>(name: string, defaultValue: T, listen=false) {
  let storedValue = localStorage.getItem(name)
  let value = storedValue !== null ? JSON.parse(storedValue) as T : defaultValue
  let store = S.writable(value)
  store.subscribe(value => localStorage.setItem(name, JSON.stringify(value)))
  if(listen) {
    window.addEventListener("storage", ({ key, newValue }) => {
      if(key !== name || newValue === null) return
      store.set(JSON.parse(newValue))
    })
  }
  return store
}


export type Store<T> = T & S.Writable<T> & { invalidate: () => void }

export function store <T extends object> (object: T): Store<T> {
  let store = S.writable<T>(object)
  Object.defineProperties(object, {
    subscribe: {
      enumerable: false,
      value: store.subscribe,
    },
    set: {
      enumerable: false,
      value: (value: T) => {
        for(let prop in object)
          if(!(prop in value))
            delete object[prop]
        Object.assign(object, value)
        store.set(value)
      },
    },
    update: {
      enumerable: false,
      value: (updater: Function) => {
        store.update(updater as any)
        Object.assign(object, S.get(store))
      },
    },
    invalidate: {
      enumerable: false,
      value: () => store.update(_=>object),
    },
  })
  return object as Store<T>
 
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

