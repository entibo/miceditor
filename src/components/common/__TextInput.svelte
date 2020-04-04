
<script>
  import { tick } from "svelte"

  let className = ""
  export { className as class }

  export let value = ""
  export let disabled = false
  export let center = false

  export let placeholder = ""
  export let sub = ""

  export let number = false



  let currentValue

  let locked = false
  function lock() {
    locked = true
  }
  function unlock() {
    locked = false
  }
  function pullValue() {
    if(value !== currentValue)
      currentValue = value
  }
  $: if(!locked) pullValue(value)

  function getCurrentValue() {
    if(number) {
      let float = parseFloat(currentValue)
      return isNaN(float) ? undefined : float
    }
    return currentValue
  }

  $: exportedValue = getCurrentValue(currentValue)
  $: if(exportedValue !== undefined) value = exportedValue


  $: valueIsNumber = !isNaN(parseFloat(currentValue))


  let inputElement

  async function onKeydown(e) {
    if(!number) return
    if(!valueIsNumber) return
    if(!(e.key === "ArrowUp" || e.key === "ArrowDown")) return
    e.preventDefault()
    let delta = e.key === "ArrowUp" ? 1 : -1
    let factor = e.ctrlKey ? 100 : e.shiftKey ? 10 : e.altKey ? 0.1 : 1
    currentValue = parseFloat((parseFloat(currentValue) + delta*factor).toFixed(6))
    await tick()
    inputElement.dispatchEvent(new Event("input"))
  }
</script>

<div class="material-input {className}" class:disabled={disabled} >
  <input type="text" disabled={disabled} 
    placeholder={placeholder}
    class:text-center={center}
    on:focus={lock} on:blur={unlock} on:change={pullValue} 
    on:focus on:blur on:input on:change on:click on:mousedown on:mouseup
    bind:this={inputElement} bind:value={currentValue}
    on:keydown={onKeydown} 
  />
  {#if sub}
  <span class="absolute top-0 right-0 mr-1 text-xs text-gray-400 italic uptop">
    {sub}
  </span>
  {/if}
</div>

<style lang="text/postcss">
  .uptop {
    transform: translateY(-100%);
    line-height: 0.8rem;
  }
</style>