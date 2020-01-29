
import * as Data from "data/Data"
import * as P from "data/Platform"
/* import * as Common from "data/Common"
import * as MapSettings from "data/MapSettings"
import * as Platform from "data/Platform"
import * as Decoration from "data/Decoration"
import * as ShamanObject from "data/ShamanObject"
import * as Joint from "data/Joint"
*/
import * as util from "stores/util"
import { readable, writable } from "svelte/store"


interface BaseMetadata {
  visible: boolean
  interactive: boolean  
}

interface PlatformMetadata extends BaseMetadata {
  booster: boolean
  boosterAxis: "x" | "y"
  boosterPower: number

  joints: Joint[]
}

class Base<T> implements util.CustomStore<T> {

  constructor() {
    this.store = writable(this)
  }
}

class Platform extends Base<Platform> {
  data: Data.Platform
  meta: PlatformMetadata

  constructor(data: Data.Platform, meta?: Partial<PlatformMetadata>) {
    super()

    this.data = data
    this.meta = meta
  }
}


