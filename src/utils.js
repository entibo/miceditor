
let nextAvailableId = 0
export function getUniqueId() {
  return "generated-id-"+(nextAvailableId++)
}

let fnToTimeout = new WeakMap()
export function debounce(fn, ms) {
  let timeout = fnToTimeout.get(fn)
  if(timeout !== undefined) {
    clearTimeout(timeout)
  }
  timeout = setTimeout(() => {
    fnToTimeout.delete(fn)
    fn()
  }, ms)
  fnToTimeout.set(fn, timeout)
}
