
let nextAvailableId = 0
export function getUniqueId() {
  return "generated-id-"+(nextAvailableId++)
}

let fnToTimeout = new WeakMap()
export function debounce(fn: Function, ms: number) {
  let timeout = fnToTimeout.get(fn)
  if(timeout !== undefined) {
    clearTimeout(timeout)
  }
  timeout = setTimeout(() => {
    fnToTimeout.delete(fn)
    fn()
  }, ms)
  fnToTimeout.set(fn, timeout)
}

import { Readable } from "svelte/store"
export function storeGet<T>(store: Readable<T>): T {
  let value: T
  store.subscribe(v => value = v)()
  return value!
}


/**
  - No values --> undefined
  - All values are the same --> value
  - Not all values are the same --> null
*/
export function combine<T>(values: T[]): T | null | undefined {
  let value = undefined
  for(let x of values) {
    if(value === undefined) value = x
    else if(value !== x) return null
  }
  return value
}

export function range(a: number, b: number) {
  let arr = []
  for(let k=a; k <= b; k++)
    arr.push(k)
  return arr
}

export function randInt(min: number, max: number) {
  let range = max - min
  let rand = Math.floor(Math.random() * (range + 1))
  return min + rand
}

export function rotate(x: number, y: number, deg: number, cx=0, cy=0) {
  let rad = (Math.PI / 180) * deg,
      cos = Math.cos(rad),
      sin = -Math.sin(rad),
      nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) - (sin * (x - cx)) + cy
  return [nx, ny]
}

export function scale(x: number, y: number, fX: number, fY: number, cx=0, cy=0) {
  return [
    (x-cx)*fX + cx,
    (y-cy)*fY + cy,
  ]
}

export const bezier1d = (t: number, a: number, b: number, c: number, d: number) => {
  let v = a * ((1-t)**3) + 
          c * 3*((1-t)**2)*t +
          d * 3*(1-t)*(t**2) +
          b * (t**3)
  return Math.round(v)
}
export const bezier = (t: number, p1: Point, p2: Point, c1: Point, c2: Point) => ({
  x: bezier1d(t, p1.x, p2.x, c1.x, c2.x),
  y: bezier1d(t, p1.y, p2.y, c1.y, c2.y),
})

export const deg = (v: number) => v * 180/Math.PI
export const rad = (v: number) => v * Math.PI/180

declare global {
  interface Array<T> {
    move(from: number, to: number): Array<T>
    split(test: (t: T) => boolean): [Array<T>,Array<T>]
  }
}
Array.prototype.move = function(from: number, to: number) {
  this.splice(to, 0, this.splice(from, 1)[0])
  return this
}
Array.prototype.split = function(test) {
  let a = [], b = []
  for(let x of this)
    test(x) ? a.push(x) : b.push(x)
  return [a,b]
}