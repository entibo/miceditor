
<script>
  import { tick } from "svelte"

  import Tooltip from "./Tooltip.svelte"
  import ColorPicker from "./ColorPicker.svelte"
  import Slider from "./Slider.svelte"
  import ShamanObjectsMenu from "components/ui/menus/ShamanObjectsMenu.svelte"
  import ShamanObjectVariantsMenu from "components/ui/menus/ShamanObjectVariantsMenu.svelte"
  import ShamanToolsMenu from "components/ui/menus/ShamanToolsMenu.svelte"

  import * as M from "maybe/Maybe"
  import * as util from "data/base/util"
  import * as Platform from "data/editor/Platform"
  import shamanObjectMetadata from "metadata/shamanObject/index"

  let className = ""
  export { className as class }
  export let outerClass = undefined

  export let textColor = "text-white"

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
  export let shamanObject = false
  export let shamanTools = false


  export let preview = true


  $: hasValidation = int || float || color || platform || shamanObject

  let inputElement
  let internalValue
  let temporaryValue = null
  let focused = false
  let invalid = false



  $: if(!focused) internalValue = value

  function onFocus() {
    focused = true
  }
  async function onBlur() {
    focused = false
    temporaryValue = null
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

    if(!hasValidation) {
      invalid = false
      setNewValue(str)
      return
    }

    temporaryValue = str

    let newValue

    if(color) {
      M.andThen( Platform.readColor(str), 
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
    temporaryValue = null
    internalValue = newValue
    if(newValue !== value) {
      value = newValue
      if(set) set(value)
    }
  }

  $: presentationValue =
        focused 
          ? temporaryValue !== null
              ? temporaryValue
              : internalValue 
          : (internalValue === undefined || internalValue === null) 
              ? "" 
              : float ? Math.round(internalValue*100)/100 
              : int ? Math.round(internalValue) 
              : internalValue

  $: hasTooltip = color || int || float || shamanTools

</script>


<Tooltip noStyle top active={hasTooltip && focused} class={outerClass}>

  {#if preview && (color || platform)}
    <div class="preview-container w-6 h-6 flex items-center justify-center">
      {#if color}
        <div class="preview rounded-full" style="background: #{internalValue}"></div>
      {:else if platform && internalValue !== undefined && internalValue !== null}
        <img class="preview shadow" src="dist/grounds/{Platform.typeNames[internalValue]}.png" alt={Platform.typeNames[internalValue]} />
      {/if}
    </div>
  {/if}

  <div class="material-input {className}" class:disabled={disabled} class:invalid={invalid} >
    <input type="text" 
      bind:this={inputElement} 
      value={presentationValue}
      disabled={disabled} 
      placeholder={placeholder}
      class:text-center={center}
      class="{textColor}"
      on:focus={onFocus} on:blur={onBlur} 
      on:input={onInput} 
      on:keydown={onKeyDown} 
      on:focus on:blur on:input on:change on:click on:mousedown on:mouseup
    />
    {#if sub}
      <span class="absolute top-0 right-0 mr-1 uptop">
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
        {#each Platform.typeNames as name, type}
          <div class="tile dim-40" class:active={type == internalValue}
              on:click={() => setNewValue(type)}
          >
            <img class="rounded-sm" src="dist/grounds/{name}.png" alt={name}/>
          </div>
        {/each}
      </div>
    {:else if shamanObject}
      <div class="p-2 ">
        {#if shamanObjectMetadata.get(internalValue||0).variants}
          <ShamanObjectVariantsMenu typeProp={internalValue} onSelect={type => setNewValue(type)}/>
        {:else}
          <ShamanObjectsMenu typeProp={internalValue} onSelect={type => setNewValue(type)}/>
        {/if}
      </div>
    {:else if shamanTools}
      <div class="p-2 ">
        <ShamanToolsMenu value={internalValue} onChange={value => setNewValue(value)}/>
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
  .preview-container {
    background: rgba(143, 160, 213, 0.5);
  }
  .preview {
    @apply w-4 h-4 cursor-pointer;
  }
  .uptop {
    @apply text-xs text-gray-500 italic;
    transform: translateY(-100%);
    line-height: 0.8rem;
    white-space: nowrap;
  }
</style>