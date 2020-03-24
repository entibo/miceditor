

import { clone } from "data/base/util"
import { store, Store, persistentWritable } from "state/util"

import { creation } from "state/creation"
import shamanObjectMetadata from "metadata/shamanObject"


const panels = ["left", "right", "bottom"] as const
type PanelName = (typeof panels)[number]

const tabs = ["basic","platforms","decorations","shamanObjects","shamanObjectVariants","lines","mechanics","images","layers","mapSettings","selection"] as const
type TabName = (typeof tabs)[number]

interface Layout {
  panels: Record<PanelName, Panel>
  windows: Window[]
}

interface Panel {
  size: number
  groups: Group[]
}
interface Group {
  size: number
  tabs: TabName[]
  activeTab?: TabName
}

export interface Window {
  tab: TabName
  width: number
  height: number
  x: number
  y: number
}

import _languages from "languages.json"
type LocaleKey = keyof (typeof _languages)["en"]
export const tabToLocaleKey: Record<TabName, LocaleKey> = {
  "platforms": "category-grounds",
  "basic": "mice-stuff",
  "decorations": "category-decorations",
  "shamanObjects": "shaman_objects",
  "shamanObjectVariants": "variants",
  "lines": "category-lines",
  "mechanics": "category-mechanics",
  "images": "category-images",
  "layers": "layers",
  "mapSettings": "map-settings",
  "selection": "select-all",
}


const defaultLayoutConfig: Layout = {
  panels: {
    right: {
      size: 250,
      groups: [
        {
          size: 0,
          tabs: ["mapSettings", "selection"],
          activeTab: "mapSettings",
        },
      ],
    },
    left: {
      size: 250,
      groups: [
        {
          size: 0,
          tabs: ["basic"],
          activeTab: "basic"
        },
        {
          size: 200,
          tabs: ["platforms"],
          activeTab: "platforms",
        },
        {
          size: 0,
          tabs: ["lines", "mechanics"],
          activeTab: "lines",
        },
      ],
    },
    bottom: {
      size: 250,
      groups: [
        {
          size: 600,
          tabs: ["decorations", "shamanObjects"],
          activeTab: "decorations",
        },
        {
          size: 0,
          tabs: ["images"],
          activeTab: "images",
        },
        {
          size: 0,
          tabs: ["layers"],
          activeTab: "layers",
        },
      ],
    },
  },
  windows: [
    {
      tab: "platforms",
      x: 100,
      y: 100,
      width: 160,
      height: 180,
    }
  ],
}

export const layoutConfig = persistentWritable("layoutConfig", clone(defaultLayoutConfig))
layoutConfig.set(clone(defaultLayoutConfig))



export function closeWindow(window: Window) {
  layoutConfig.update(cfg => {
    cfg.windows = cfg.windows.filter(w => w !== window)
    return cfg
  })
}


export function selectTab(panel: PanelName, groupIndex: number, tab: TabName) {
  layoutConfig.update(cfg => {
    cfg.panels[panel].groups[groupIndex].activeTab = tab
    return cfg
  })
}



creation.subscribe(() => {
  let metadata
  if( creation.enabled && 
      creation.creationType === "SHAMANOBJECT" && 
      ( metadata = shamanObjectMetadata[creation.type],
        "variants" in metadata &&
        metadata.variants &&
        metadata.variants.length
      )
  ) {
    layoutConfig.update(cfg => {
      if(!cfg.windows.find(({tab}) => tab === "shamanObjectVariants"))
        cfg.windows.push({
          tab: "shamanObjectVariants",
          x: 0, y: 0,
          width: 200,
          height: 360
        })
      return cfg
    })
  }
  else {
    layoutConfig.update(cfg => {
      cfg.windows = cfg.windows.filter(({tab}) => tab !== "shamanObjectVariants")
      return cfg
    })
  }
})




type TabMovement
  = { enabled: boolean
      mouseDownPosition: Point
      active: boolean
      source: {
        panel: PanelName
        groupIndex: number
        tab: TabName
      }
      target: {
        panel: PanelName
        groupIndex: number
      }
    }
export const tabMovement: Store<TabMovement> = store({ 
  enabled: false,
  mouseDownPosition: { x: 0, y: 0 },
  active: false,
  source: { panel: "left", groupIndex: -1, tab: "basic" },
  target: { panel: "left", groupIndex: -1 },
})

export function tabMouseDown(e: MouseEvent, panel: PanelName, groupIndex: number, tab: TabName) {
  tabMovement.set({
    enabled: true,
    mouseDownPosition: { x: e.x, y: e.y },
    active: false,
    source: { panel, groupIndex, tab },
    target: { panel, groupIndex },
  })
}

window.addEventListener("mousemove", e => {
  if(!tabMovement.enabled) return
  if(!tabMovement.active) {

    let dist = Math.sqrt((e.x-tabMovement.mouseDownPosition.x)**2 + (e.y-tabMovement.mouseDownPosition.y)**2)
    if(dist < 10) return

    tabMovement.update(tm => {
      tm.active = true
      return tm
    })

    layoutConfig.update(cfg => {
      let srcPanel = cfg.panels[tabMovement.source.panel]
      let srcGroup = srcPanel.groups[tabMovement.source.groupIndex]

      for(let panelName of panels) {
        let panel = cfg.panels[panelName]
        let groups = [...panel.groups]
        panel.groups = []
        let pushDummy = () => panel.groups.push({ activeTab: undefined, size: 0, tabs: [] })
        for(let k=0; k < groups.length; k++) {
          pushDummy()
          panel.groups.push(groups[k])
        }
        pushDummy()
      }

      tabMovement.source.groupIndex = srcPanel.groups.indexOf(srcGroup)

      return cfg
    })
  }
})

export function tabMouseMoveOverGroup(panel: PanelName, groupIndex: number) {
  if(!tabMovement.enabled) return
  tabMovement.target = { panel, groupIndex }
  tabMovement.invalidate()
}

export function finishMovement(p: Point, toWindow = false) {
  if(!tabMovement.enabled) return

  console.log("finishMovement >", p)

  if(tabMovement.active) {
    layoutConfig.update(cfg => {
      let srcPanel = cfg.panels[tabMovement.source.panel]
      let srcGroup = srcPanel.groups[tabMovement.source.groupIndex]
      let srcTab = tabMovement.source.tab

      if(toWindow) {
        if(srcGroup.activeTab === srcTab) {
          srcGroup.activeTab = undefined
          for(let tab of srcGroup.tabs) {
            if(tab !== srcTab) {
              srcGroup.activeTab = tab
              break
            }
          }
        }
        cfg.windows = cfg.windows.filter(w => w.tab !== srcTab)
        cfg.windows.push({
          tab: srcTab,
          x: p.x,
          y: p.y,
          width: 240,
          height: 360,
        })
      }
      else {
        
        // Remove
        srcGroup.tabs.splice(srcGroup.tabs.indexOf(srcTab), 1)
        if(srcGroup.activeTab === srcTab) {
          srcGroup.activeTab = srcGroup.tabs[0]
        }

        // Add
        let tgtGroup = cfg.panels[tabMovement.target.panel].groups[tabMovement.target.groupIndex]
        if(tgtGroup === srcGroup) { }
        tgtGroup.tabs.push(srcTab)
        tgtGroup.activeTab = srcTab

      }
      
      // Remove empty groups
      for(let panelName of panels) {
        cfg.panels[panelName].groups =
          cfg.panels[panelName].groups.filter(group => group.tabs.length > 0)
      }

      return cfg
    })
  }

  tabMovement.enabled = tabMovement.active = false
  tabMovement.invalidate()
}

window.addEventListener("mouseup",    finishMovement)
window.addEventListener("mouseleave", finishMovement)