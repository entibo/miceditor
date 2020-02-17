
import * as sceneObjects from "stores/sceneObjects"
import { SO } from "stores/sceneObjects"

import * as Common from "data/Common"
import * as MapSettings from "data/MapSettings"
import * as Platform from "data/Platform"
/* import * as Decoration from "data/Decoration"
import * as ShamanObject from "data/ShamanObject"
import * as Joint from "data/Joint" */
import * as Data from "data/Data"

import * as util from "stores/util"

type Creation = 
  { active: false }
  | 
  { active: true
    platform: SO<Platform.Platform> }
  | 
  { active: true
    image: SO<Common.Image> }
  | 
  { active: true
    decoration: SO<Decoration.Decoration> }
  | 
  { active: true
    shamanObject: SO<ShamanObject.ShamanObject> }
  | 
  { active: true
    joint: SO<Joint.Joint>
    /* */ }