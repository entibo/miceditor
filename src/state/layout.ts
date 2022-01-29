

import { clone } from "data/base/util"
import { store, Store, persistentWritable } from "state/util"

import { creation } from "state/creation"
import { selection } from "state/selection"
import shamanObjectMetadata from "metadata/shamanObject"


const panels = ["left", "right", "bottom"] as const
type PanelName = (typeof panels)[number]

const tabs = [
  "basic",
  "platforms",
  "decorations",
  "shamanObjects",
  "shamanObjectVariants",
  "lines",
  "mechanics",
  "images",
  "layers",
  "tree",
  "mapSettings",
  "selection",
  "colorPalette",
] as const
type TabName = (typeof tabs)[number]

export interface Layout {
  panels: Record<PanelName, Panel>
  windows: Window[]
}

interface Panel {
  size: number
  groups: Group[]
}
interface Group {
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

import { TranslationId } from "state/locale"
export const tabToTranslationId: Record<TabName, TranslationId> = {
  "platforms": "category-grounds",
  "basic": "mice-stuff",
  "decorations": "category-decorations",
  "shamanObjects": "shaman_objects",
  "shamanObjectVariants": "variants",
  "lines": "category-lines",
  "mechanics": "category-mechanics",
  "images": "category-images",
  "layers": "layers",
  "tree": "tree-menu",
  "mapSettings": "map-settings",
  "selection": "selection-menu",
  "colorPalette": "color-palette",
}


import smallLayout from "layouts/small"
import largeLayout from "layouts/large"
import { storeGet } from "common"
import { mapSettings } from "./map"

const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
const defaultLayout = 
  windowWidth > 1300
    ? largeLayout
    : smallLayout

export const layoutConfig = persistentWritable("layoutConfig", clone(defaultLayout))

export const setSmallLayout = () => layoutConfig.set(clone(smallLayout))
export const setLargeLayout = () => layoutConfig.set(clone(largeLayout))



export function closeWindow(window: Window) {
  layoutConfig.update(cfg => {
    cfg.windows = cfg.windows.filter(w => w !== window)
    return cfg
  })
}

type Dimensions = { width: number, height: number }
const windowDimensions: Partial<Record<TabName,Dimensions>> = {
  basic: { 
    width: 120, height: 150,
  },
  platforms: { 
    width: 120, height: 340,
  },
  mechanics: { 
    width: 210, height: 110,
  },
  images: { 
    width: 460, height: 100,
  },
  lines: {
    width: 220, height: 340,
  },
}

const getWindowDimensions = (tab: TabName) =>
  windowDimensions[tab] || {
    width: 240,
    height: 340,
  }


export function selectTab(panelName: PanelName, groupIndex: number, tab: TabName) {
  layoutConfig.update(cfg => {
    let group = cfg.panels[panelName].groups[groupIndex]
    if(group.activeTab === tab)
      group.activeTab = undefined
    else
      group.activeTab = tab
    return cfg
  })
}


function findTabPanelGroup(targetTab: TabName): [Panel, Group] | undefined {
  let cfg = storeGet(layoutConfig)
  for(let panel of panels.map(k => cfg.panels[k])) {
    for(let group of panel.groups) {
      for(let tab of group.tabs) {
        if(tab === targetTab)
          return [panel, group]
      }
    }
  }
}


creation.subscribe(() => {
  let metadata
  if( creation.enabled && 
      creation.creationType === "SHAMANOBJECT" && 
      ( metadata = shamanObjectMetadata.get(creation.type),
        "variants" in metadata &&
        metadata.variants &&
        metadata.variants.length && 
        !(metadata.defilanteVariant && mapSettings.defilante.enabled)
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


selection.subscribe(list => {
  let r = findTabPanelGroup("selection")
  if(!r) return
  let [panel, group] = r
  layoutConfig.update(cfg => {
    if(list.length) {
      group.activeTab = "selection"
    }
    else if(group.activeTab === "selection") {
      let idx = group.tabs.indexOf("selection")
      group.activeTab = group.tabs[idx-1] || group.tabs[0]
    }
    return cfg
  })
  
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

addEventListener("mousemove", e => {
  if(!tabMovement.enabled) return
  if(tabMovement.active) return
  
  // Only make it "active" after a minimum movement of ~10px
  // to avoid unintentional dragging while clicking
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
      let dimensions = getWindowDimensions(srcTab)
      cfg.windows.push({
        tab: srcTab,
        x: tabMovement.target.x,
        y: tabMovement.target.y,
        ...dimensions,
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