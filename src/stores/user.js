
import { writable } from "svelte/store"

export function persistentWritable(name, defaultValue, listen=false) {
  let storedValue = localStorage.getItem(name)
  let value = storedValue !== null ? JSON.parse(storedValue) : defaultValue
  let store = writable(value)
  store.subscribe(value => localStorage.setItem(name, JSON.stringify(value)))
  if(listen) {
    window.addEventListener("storage", ({ key, newValue }) => {
      if(key !== name) return
      store.set(JSON.parse(newValue))
    })
  }
  return store
}

export const highQuality = persistentWritable("highQuality", true)
export const showGameGUI = persistentWritable("showGameGUI", true)
export const showMapBorder = persistentWritable("showMapBorder", true)
export const showInvisibleGrounds = persistentWritable("showInvisibleGrounds", true)

export const gridSettings = persistentWritable("gridSettings", {
  enabled: false,
  width: 40, height: 40,
  sticky: false,
  color: "0e0e0e",
})

export const parkour = persistentWritable("parkour", false)

export const zoom = (() => {
  let {subscribe, set, update} = writable(1)
  let clamp = v => {
    v = Math.round(100*v)/100
    v = Math.max(0.1, Math.min(5, v))
    return v
  }
  return { 
    subscribe,
    set(v) { set(clamp(v)) },
    update(f) { update(v => clamp(v)) },
  }
})()

export const jointPalette = persistentWritable("jointPalette", [
  { 
    color: "000000",
    thickness: 20,
    opacity: 0.8,
    foreground: false,
  },
])

export const drawingData = writable({
  curveToolEnabled: false,
  curveToolFineness: 10,
})

export const firstVisit = false === Boolean(localStorage.getItem("firstVisit"))
localStorage.setItem("firstVisit", "firstVisit")