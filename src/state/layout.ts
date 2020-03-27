

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
          size: 0,
          tabs: ["decorations", "shamanObjects"],
          activeTab: undefined,
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
    /* {
      tab: "platforms",
      x: 100,
      y: 100,
      width: 160,
      height: 180,
    } */
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


export function selectTab(panelName: PanelName, groupIndex: number, tab: TabName) {
  layoutConfig.update(cfg => {
    cfg.panels[panelName].groups[groupIndex].activeTab = tab
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
  = { enabled: false }
  | { enabled: true
      active: boolean 
      mouseDownPosition: Point
      source: {
        panelName: PanelName
        groupIndex: number
        tab: TabName
      }
      target: TabMovementTarget
    }

type TabMovementTarget
  = { type: "group" 
      panelName: PanelName
      groupIndex: number
    }
  | { type: "newGroup"
      panelName: PanelName
      groupIndex: number
    }
  | { type: "window"
      x: number
      y: number
    }

export const tabMovement = store<TabMovement>({ enabled: false })

export function tabMouseDown(e: MouseEvent, panelName: PanelName, groupIndex: number, tab: TabName) {
  tabMovement.set({
    enabled: true,
    active: false,
    mouseDownPosition: { x: e.x, y: e.y },
    source: { panelName, groupIndex, tab },
    target: { type: "group", panelName, groupIndex },
  })
}

// Only make it "active" after a minimum movement of ~10px
// to avoid unintentional dragging while clicking
addEventListener("mousemove", e => {
  if(!tabMovement.enabled) return
  if(tabMovement.active) return

  let dist = Math.sqrt((e.x-tabMovement.mouseDownPosition.x)**2 + (e.y-tabMovement.mouseDownPosition.y)**2)
  if(dist < 10) return

  tabMovement.active = true
  tabMovement.invalidate()
})

export function setTabMovementTarget(target: TabMovementTarget) {
  if(!tabMovement.enabled) return
  tabMovement.target = target
  tabMovement.invalidate()
}

addEventListener("mouseup", () => {
  if(!tabMovement.enabled) return

  if(!tabMovement.active)
    return tabMovement.set({ enabled: false })

  layoutConfig.update(cfg => {
    let srcPanel = cfg.panels[tabMovement.source.panelName]
    let srcGroup = srcPanel.groups[tabMovement.source.groupIndex]
    let srcTab = tabMovement.source.tab

    if(tabMovement.target.type === "window") {

      if(srcGroup.activeTab === srcTab) {
        srcGroup.activeTab = undefined
        for(let tab of srcGroup.tabs) {
          if(tab !== srcTab) {
            srcGroup.activeTab = tab
            break
          }
        }
      }

      cfg.windows = cfg.windows.filter(({tab}) => tab !== srcTab)
      cfg.windows.push({
        tab: srcTab,
        x: tabMovement.target.x,
        y: tabMovement.target.y,
        width: 240,
        height: 360,
      })

      return cfg

    }
      
    let removeSrcTab = () => {
      let idx = srcGroup.tabs.indexOf(srcTab)
      srcGroup.tabs.splice(idx, 1)
      if(srcGroup.activeTab === srcTab)
        srcGroup.activeTab = srcGroup.tabs[idx-1] || srcGroup.tabs[0]
    }

    if(tabMovement.target.type === "group") {

      let tgtGroup = cfg.panels[tabMovement.target.panelName].groups[tabMovement.target.groupIndex]
      if(tgtGroup === srcGroup)
        return cfg

      removeSrcTab()
      tgtGroup.tabs.push(srcTab)
      tgtGroup.activeTab = srcTab

    }

    if(tabMovement.target.type === "newGroup") {

      removeSrcTab()
      let newGroup: Group = {
        size: 0,
        tabs: [srcTab],
        activeTab: srcTab,
      }
      let tgtPanel = cfg.panels[tabMovement.target.panelName]
      let idx = tabMovement.target.groupIndex
      tgtPanel.groups =
        [ ...tgtPanel.groups.slice(0, idx), 
          newGroup, 
          ...tgtPanel.groups.slice(idx),
        ]

    }

    // Make sure we don't have any empty groups
    for(let panelName of panels)
      cfg.panels[panelName].groups = cfg.panels[panelName].groups.filter(g => g.tabs.length > 0)

    return cfg
  })

  tabMovement.set({ enabled: false })
})

addEventListener("mouseleave", () =>
  tabMovement.set({ enabled: false }))