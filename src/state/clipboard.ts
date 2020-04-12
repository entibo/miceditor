

import { persistentWritable } from "state/util"

import * as Editor from "data/editor"
import * as sceneObjects from "state/sceneObjects"
import * as selection from "state/selection"

const {subscribe, set} = persistentWritable<string|null>("clipboard", null)

let jsonValue: string|null = null
subscribe(v => jsonValue = v)

export default {
  subscribe,
  copy: () => {
    let objects = selection.getAll()
    if(!objects.length) return
    let [platforms, rest] = objects.split(Editor.isPlatform)
    objects = platforms.concat(rest)
    set(JSON.stringify(objects))
  },
  paste: () => {
    if(jsonValue === null) return
    let objects = JSON.parse(jsonValue) as Editor.Object[]
    if(!objects.length) return
    selection.clear()
    for(let obj of objects)
      selection.select(sceneObjects.add(obj))
  },
}