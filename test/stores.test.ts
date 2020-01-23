
import { tick } from "svelte"
import * as sceneObjects from "stores/sceneObjects"

import * as Platform from "data/Platform"


let $platforms: any // derived store
let mockSubscriber = jest.fn(v => {
  $platforms = v
})
let nCalls = 0

it("subscribes", () => {
  expect(mockSubscriber).toHaveBeenCalledTimes(nCalls)
  sceneObjects.platforms.subscribe(mockSubscriber)
  expect(mockSubscriber).toHaveBeenCalledTimes(++nCalls)
  expect($platforms).toEqual({ background: [], foreground: [] })
})

let obj: any
it("adds an object",  () => {
  let p = Platform.defaults(Platform.Type.Snow)
  obj = sceneObjects.add(p, { visible: false, })
  
  expect(mockSubscriber).toHaveBeenCalledTimes(++nCalls)
  expect($platforms.background.length).toEqual(1)
  expect($platforms.foreground.length).toEqual(0)
})

it("object can change", () => {
  expect(obj.invisible).toBe(false)
  obj.invisible = true
  expect(obj.invisible).toBe(true)

  obj.invisible = false
  obj.invalidate()
  expect(obj.invisible).toBe(false)
})

it("updates on layer change",  () => {
  console.log("changing foreground")
  obj.foreground = true
  obj.invalidate()
  
  expect(mockSubscriber).toHaveBeenCalledTimes(++nCalls)
  expect($platforms.background.length).toEqual(0)
  expect($platforms.foreground.length).toEqual(1)
})

it("doesn't update on other property change",  () => {
  obj.x += 5
  obj.invalidate()
  
  expect(mockSubscriber).toHaveBeenCalledTimes(nCalls)
  expect($platforms.background.length).toEqual(0)
  expect($platforms.foreground.length).toEqual(1)
})

