
import { writable } from "svelte/store"

export function persistentWritable<T>(name: string, defaultValue: T, listen=false) {
  let storedValue = localStorage.getItem(name)
  let value = storedValue !== null ? JSON.parse(storedValue) as T : defaultValue
  let store = writable(value)
  store.subscribe(value => localStorage.setItem(name, JSON.stringify(value)))
  if(listen) {
    window.addEventListener("storage", ({ key, newValue }) => {
      if(key !== name || newValue === null) return
      store.set(JSON.parse(newValue))
    })
  }
  return store
}

export const highQuality = persistentWritable("highQuality", true)
export const showGameGUI = persistentWritable("showGameGUI", true)
export const showMapBorder = persistentWritable("showMapBorder", true)
export const showInvisibleGrounds = persistentWritable("showInvisibleGrounds", true)

export const grid = persistentWritable("grid", {
  enabled: false,
  width: 40, height: 40,
  sticky: false,
  color: "0e0e0e",
})

export const parkour = persistentWritable("parkour", false)

export const zoom = (() => {
  let {subscribe, set, update} = writable(1)
  let clamp = (v: number) => {
    v = Math.max(0.1, Math.min(500, v))
    v = Math.round(100*v)/100
    return v
  }
  return { 
    subscribe,
    set(v: number) { set(clamp(v)) },
    update(f: (v: number) => number) { update(v => clamp(f(v))) },
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