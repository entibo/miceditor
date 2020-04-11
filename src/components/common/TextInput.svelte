
<script>
  import { tick } from "svelte"

  import Tooltip from "./Tooltip.svelte"
  import ColorPicker from "./ColorPicker.svelte"
  import Slider from "./Slider.svelte"

  import * as M from "maybe/Maybe"
  import * as util from "data/base/util"
  import { typeNames } from "data/editor/Platform"


  let className = ""
  export { className as class }


  export let value
  export let set = null


  export let disabled = false
  export let placeholder = ""
  export let sub = ""
  export let center = false


  // Type of value

  export let color = false

  export let int = false
  export let float = false
  export let min = -Infinity
  export let max = +Infinity

  export let sliderMin = min !== -Infinity ? min : null
  export let sliderMax = max !== +Infinity ? max : null
  export let step = 1

  export let platform = false


  export let preview = true


  let inputElement
  let internalValue
  let focused = false
  let invalid = false



  $: if(!focused) internalValue = value

  function onFocus() {
    focused = true
  }
  async function onBlur() {
    focused = false
    presentationValue = ""
    await tick()
    internalValue = value
    invalid = false
  }
  function onKeyDown(e) {
    let key = e.key.toLowerCase()

    if((key === "escape" || key === "enter") && focused) {
      inputElement.blur()
      return
    }
    if((int || float) && (key === "arrowup" || key === "arrowdown")) {
      let delta = key === "arrowup" ? 1 : -1
      let factor = e.ctrlKey ? 100 : e.shiftKey ? 10 : e.altKey ? 0.1 : 1
      let newValue = parseFloat((internalValue + delta*factor).toFixed(6))
      newValue = Math.max(min, Math.min(max, newValue))
      setNewValue(newValue)
      return
    }
  }
  

  function onInput(e) {
    let str = e.target.value

    let newValue

    if(color) {
      M.andThen( util.readColor(str), 
                 v => newValue = v)
    }

    else if(int || float) {
      let read = int ? util.readInt : util.readFloat
      M.andThen( read(str), 
                 M.iff(v => v >= min && v <= max), 
                 v => newValue = v)
    }

    else setNewValue(str)

    if(newValue !== undefined) {
      setNewValue(newValue)
    }
    else invalid = true
  }

  function setNewValue(newValue) {
    invalid = false
    console.log("setNewValue", newValue)
    internalValue = newValue
    if(newValue !== value) {
      value = newValue
      if(set) set(value)
    }
  }

  $: presentationValue =
        focused 
          ? internalValue 
          : (internalValue === undefined || internalValue === null) 
              ? "" 
              : float ? Math.round(internalValue*100)/100 
              : int ? Math.round(internalValue) 
              : internalValue

  $: hasTooltip = color || int || float

</script>


<Tooltip noStyle top active={hasTooltip && focused}>

  {#if preview}
    {#if color}
      <div class="preview" style="background: #{internalValue}"></div>
    {:else if platform && internalValue !== undefined && internalValue !== null}
      <img class="preview" src="dist/grounds/{typeNames[internalValue]}.png" alt={typeNames[internalValue]} />
    {/if}
  {/if}

  <div class="material-input {className}" class:disabled={disabled} class:invalid={invalid} >
    <input type="text" 
      bind:this={inputElement} 
      value={presentationValue}
      disabled={disabled} 
      placeholder={placeholder}
      class:text-center={center}
      on:focus={onFocus} on:blur={onBlur} 
      on:input={onInput} 
      on:keydown={onKeyDown} 
      on:focus on:blur on:input on:change on:click on:mousedown on:mouseup
    />
    {#if sub}
      <span class="absolute top-0 right-0 mr-1 text-xs text-gray-400 italic uptop">
        {sub}
      </span>
    {/if}
  </div>

  <div slot="tooltip" on:mousedown|preventDefault|stopPropagation
    class="pointer-events-auto shadow-lg rounded bg-gray-900" 
  >
    {#if color}
      <ColorPicker bind:value={internalValue} on:input={() => setNewValue(internalValue)} on:input />
    {:else if platform}
      <div class="flex flex-wrap justify-center p-2 ">
        {#each typeNames as name, type}
          <div class="tile dim-40" class:active={type == internalValue}
              on:click={() => setNewValue(type)}
          >
            <img class="rounded-sm" src="dist/grounds/{name}.png" alt={name}/>
          </div>
        {/each}
      </div>
    {:else if (sliderMin !== null && sliderMax !== null)}
      <div class="p-2">
        <Slider min={sliderMin} max={sliderMax} {step} 
                bind:value={internalValue} on:input={() => setNewValue(internalValue)} />
      </div>
    {/if}
  </div>

</Tooltip>


<style lang="text/postcss">
  .preview {
    @apply w-4 h-4 mr-2 shadow rounded-sm cursor-pointer;
  }
  .uptop {
    transform: translateY(-100%);
    line-height: 0.8rem;
  }
</style>