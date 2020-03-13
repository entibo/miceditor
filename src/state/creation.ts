
import * as sceneObjects from "state/sceneObjects"

import * as Editor from "data/editor"

import { store, Store } from "state/util"

type Creation = 
  { active: false }
  | 
  { active: true
    platform: Store<Editor.Platform.Platform> }
  | 
  { active: true
    image: Store<Editor.Image.Image> }
  | 
  { active: true
    decoration: Store<Editor.Decoration.Decoration> }
  | 
  { active: true
    shamanObject: Store<Editor.ShamanObject.ShamanObject> }
  | 
  { active: true
    joint: Store<Editor.Joint.Joint>
    /* */ }

export default store<Creation>({ active: false, })  