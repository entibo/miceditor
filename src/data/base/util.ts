
import * as M from "maybe/Maybe"
//import * as XML from "./XML"


export function makeChecker <T extends object, S extends T> (key: keyof S) {
  return function(obj: T): obj is S {
    return key in obj
  }
}

type F<A,B> = (a: A) => M.Maybe<B>

export function makeGetter <T> (obj: Partial<T>) {
  // : <S> (f: (x: T[K]) => M.Maybe<S>) => M.Maybe<S>
  return <K extends keyof T> (k: K) => {
    let m = M.iffDefined<T[K]>(obj[k])
    // return M.bind(m)

    let foo: {
      ():     M.Maybe<T[K]>
      <A>     (a: F<T[K],A>): M.Maybe<A>
      <A,B>   (a: F<T[K],A>, b: F<A,B>): M.Maybe<B>
      <A,B,C> (a: F<T[K],A>, b: F<A,B>, c: F<B,C>): M.Maybe<C>
    } = <A,B,C> (a?: F<T[K],A>, b?: F<A,B>, c?: F<B,C>) =>
      a ?
        b ?
          c ? M.andThen(m, a, b, c)
          : M.andThen(m, a, b)
        : M.andThen(m, a)
      : m
    
    return foo
  }
}
export function makeSetter <T> (obj: Partial<T>) {
  return <K extends keyof T> (k: K) => {
    return (m: M.Maybe<T[K]>) => {
      if(M.is(m) && k in obj)
        obj[k] = m
    }
  }
}


export function clone<T>(obj: T): T {
  if(typeof obj !== "object")
    return obj

  if(obj instanceof Array)
    return [...obj].map(clone) as any

  let r = {} as any
  for(let k in obj) {
    r[k] = clone(obj[k])
  }
  return r
}

export function eq <T> (a: T) {
  return (b: T) => {
    if(typeof a !== typeof b) return false
    let type = typeof a
    if(a == b) return true
    else if(type === "object") {
      if(a instanceof Array && b instanceof Array) {
        if(a.length !== b.length) return false
        for(let i=0; i < a.length; i++) {
          if(!eq(a[i])(b[i])) return false
        }
        return true
      }
      for(let [k,v] of Object.entries(a)) {
        if(k in b && eq((<any>b)[k])(v)) continue
        return false
      }
      return true
    }
    return false
  }
}


export const omitOn: <T> (on: T) => <S> (value: S) => M.Maybe<S>
  = on => value => eq(value)(on as any) ? M.None : value


export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v))
}

export function readInt(str: string): M.Maybe<number> {
  let int = M.unless(isNaN)(parseInt(str))
  if(M.is(int)) return int
  return M.andThen(str, readFloat, M.unless(isFinite))
}
export function writeInt(x: number): string {
  return normalizeSerializedNumber(Math.round(x).toString())
}

export function readFloat(str: string): M.Maybe<number> {
  return M.unless(isNaN)(parseFloat(str))
}
export function writeFloat(x: number, decimals?: number): string {
  if(decimals) {
    let f = (10**decimals)
    x = Math.round(x*f)/f
  }
  return normalizeSerializedNumber(x.toString())
}

export function readBool(str: string): M.Maybe<boolean> {
  return str === "1"
}
export function writeBool(v: boolean): string {
  return v ? "1" : "0"
}

// Format: "abcdef"
export function readColor(str: string): M.Maybe<string> {
  return str.match(/^[a-f0-9]+$/i)
    ? str.padStart(6, "0").slice(-6)
    : M.None
}

// Remove the "+" in large numbers: 1e+30 -> 1e30
export function normalizeSerializedNumber(x: string): string {
  return x.replace(/\+/, '')
}


