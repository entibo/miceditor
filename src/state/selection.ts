
import { writable, Writable, derived, get as storeGet } from "svelte/store"

import * as Editor from "data/editor"
import * as sceneObjects from "state/sceneObjects"
import { SceneObject } from "state/sceneObjects"
import { store, Store } from "state/util"
import { Joint } from "@/data/base"

const blank = store({})
let selectionMap = new Map<SceneObject, ()=>void>()

export function size(): number {
  return selectionMap.size
}

export function clear() {
  for(let [obj,unsubscribe] of selectionMap.entries()) {
    obj.selected = false
    obj.invalidate()
    unsubscribe()
  }
  selectionMap.clear()
  blank.invalidate()
}
export function set(objs: SceneObject[]) {
  clear()
  selectionMap = new Map()
  for(let obj of objs) {
    obj.selected = true
    obj.invalidate()
    let unsubscribe = obj.subscribe(blank.invalidate)
    selectionMap.set(obj, unsubscribe)
  }
  blank.invalidate()
}
export function selectAll() {
  set(sceneObjects.getAll().filter(obj => obj.interactive))
}
export function select(obj: SceneObject) {
  if(selectionMap.has(obj)) return
  obj.selected = true
  obj.invalidate()
  selectionMap.set(obj, obj.subscribe(blank.invalidate))
  blank.invalidate()
}
export function unselect(obj: SceneObject) {
  let unsubscribe = selectionMap.get(obj)
  if(!unsubscribe) return
  unsubscribe()
  obj.selected = false
  obj.invalidate()
  selectionMap.delete(obj)
  blank.invalidate()
}
export function has(obj: SceneObject): boolean {
  return selectionMap.has(obj)
}
export function getAll(): SceneObject[] {
  return [...selectionMap.keys()]
}

export function remove() {
  for(let unsubscribe of selectionMap.values())
    unsubscribe()

  let toBeRemoved = [...selectionMap.keys()].sort((a,b) => b.index-a.index)

/*   let platforms = toBeRemoved.filter(Editor.isPlatform)
  let joints = sceneObjects.groups.joints
    .filter(obj => !obj.selected)
    .filter(obj => (platforms.includes(obj.platform1 as any) && (obj.platform1 as any).index > 0)
                || (platforms.includes(obj.platform2 as any) && (obj.platform2 as any).index > 0)) */

  for(let obj of toBeRemoved)
    sceneObjects.remove(obj)
  selectionMap.clear()
  blank.invalidate()
}

export function duplicate() {
  let duplicates = []
  for(let obj of selectionMap.keys()) {
    let data = Editor.clone(obj)
    duplicates.push(
      sceneObjects.add(data, data.index+1)
    )
  }
  clear()
  for(let obj of duplicates)
    select(obj)
  move(40, 0)
}

export function move(dx: number, dy: number) {
  for(let obj of selectionMap.keys()) {
    Editor.move(obj, dx, dy)
    obj.invalidate()
  }
}

export function resize(dx: number, dy: number) {
  for(let obj of selectionMap.keys()) {
    if(!Editor.isPlatform(obj)) continue
    Editor.Platform.resize(obj, dx, dy)
    obj.invalidate()
  }
}

export function scale(fX: number, fY: number) {
  let p = Editor.getPositionInformation([...selectionMap.keys()]).center
  for(let obj of selectionMap.keys()) {
    Editor.scaleAround(obj, fX, fY, p)
    obj.invalidate()
  }
}

export function shiftIndex(dz: number) {
  let groupToListMap = new Map<ReturnType<typeof sceneObjects.getGroup>, SceneObject[]>()
  for(let obj of selectionMap.keys()) {
    let group = sceneObjects.getGroup(obj)
    let list = groupToListMap.get(group)
    if(!list) (list = [], groupToListMap.set(group, list))
    list.push(obj)
  }
  for(let [group, list] of groupToListMap.entries()) {
    list = list.sort((a,b) => a.index - b.index)
    if(dz < 0) {
      let min = 0
      for(let obj of list) {
        let target = Math.max(obj.index + dz, min)
        sceneObjects.setIndex(obj, target)
        min = target + 1
      }
    }
    else {
      let max = group.length - 1
      for(let obj of list.reverse()) {
        let target = Math.min(obj.index + dz, max)
        sceneObjects.setIndex(obj, target)
        max = target - 1
      }      
    }
  }
}

export function flipX() {
  if(selectionMap.size <= 0) return

  let cx = Editor.getPositionInformation([...selectionMap.keys()]).center.x

  for(let obj of selectionMap.keys()) {
    Editor.flipX(obj, cx)
    obj.invalidate()
  }
}
export function flipY() {
  if(selectionMap.size <= 0) return

  let cy = Editor.getPositionInformation([...selectionMap.keys()]).center.y

  for(let obj of selectionMap.keys()) {
    Editor.flipY(obj, cy)
    obj.invalidate()
  }
}

export function alignXLeft() {
  if(selectionMap.size <= 0) return

  let left = Editor.getPositionInformation([...selectionMap.keys()]).box.p1.x

  for(let obj of selectionMap.keys()) {
    let dx = left - Editor.getBoundingBox(obj).p1.x
    Editor.move(obj, dx, 0)
    obj.invalidate()
  }
}
export function alignXRight() {
  if(selectionMap.size <= 0) return

  let right = Editor.getPositionInformation([...selectionMap.keys()]).box.p2.x

  for(let obj of selectionMap.keys()) {
    let dx = right - Editor.getBoundingBox(obj).p2.x
    Editor.move(obj, dx, 0)
    obj.invalidate()
  }
}
export function alignXCenter() {
  if(selectionMap.size <= 0) return

  let center = Editor.getPositionInformation([...selectionMap.keys()]).center.x

  for(let obj of selectionMap.keys()) {
    let box = Editor.getBoundingBox(obj)
    let dx = center - (box.p1.x + box.p2.x)/2
    Editor.move(obj, dx, 0)
    obj.invalidate()
  }
}

export function alignYTop() {
  if(selectionMap.size <= 0) return

  let top = Editor.getPositionInformation([...selectionMap.keys()]).box.p1.y

  for(let obj of selectionMap.keys()) {
    let dy = top - Editor.getBoundingBox(obj).p1.y
    Editor.move(obj, 0, dy)
    obj.invalidate()
  }
}
export function alignYBottom() {
  if(selectionMap.size <= 0) return

  let bottom = Editor.getPositionInformation([...selectionMap.keys()]).box.p2.y

  for(let obj of selectionMap.keys()) {
    let dy = bottom - Editor.getBoundingBox(obj).p2.y
    Editor.move(obj, 0, dy)
    obj.invalidate()
  }
}
export function alignYCenter() {
  if(selectionMap.size <= 0) return

  let center = Editor.getPositionInformation([...selectionMap.keys()]).center.y

  for(let obj of selectionMap.keys()) {
    let box = Editor.getBoundingBox(obj)
    let dy = center - (box.p1.y + box.p2.y)/2
    Editor.move(obj, 0, dy)
    obj.invalidate()
  }
}

export function rotate(a: number) {
  for(let obj of selectionMap.keys()) {
    Editor.rotate(obj, a)
    obj.invalidate()
  }
}

export function rotateAround(a: number, p?: Point) {
  if(!p) p = Editor.getPositionInformation([...selectionMap.keys()]).center
  for(let obj of selectionMap.keys()) {
    Editor.rotateAround(obj, a, p)
    obj.invalidate()
  }
}

export function invertLH() {
  for(let obj of selectionMap.keys()) {
    if(!("height" in obj)) continue
    let height = obj.height
    obj.height = obj.width
    obj.width = height
    obj.invalidate()
  }
}

export const selection = derived(blank, getAll)

