
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

export function randInt(min,max) {
  let range = max - min
  let rand = Math.floor(Math.random() * (range + 1))
  return min + rand
}

Array.prototype.move = function(from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};