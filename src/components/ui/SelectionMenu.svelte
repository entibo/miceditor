
<script>
  import { tick } from "svelte"
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo"
  import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons/faExchangeAlt"
  import { faCrosshairs } from "@fortawesome/free-solid-svg-icons/faCrosshairs"

  import TextInput from "/components/common/TextInput.svelte"
  import ColorTextInput from "/components/common/ColorTextInput.svelte"
  import Button from "/components/common/Button.svelte"
  import Tooltip from "/components/common/Tooltip.svelte"

  import { platforms, decorations, shamanObjects, settings, selection, creation, groundTypePicker, buildXML, _} from "/stores/stores.js"
  import { encodeObjectData } from "/xml-utils.js"

  let stores = [platforms, decorations, shamanObjects]


  $: objectTypes = [...new Set($selection.map(o => o._objectType))]

  let multi = {}
  $: computeMulti($selection)

  function getComputedProperties(object) {
    return Object.keys(object).filter(key => key[0] === "_")
  }

  function computeMulti() {
    if(!$selection.length) {
      return multi = {}
    }

    if($selection.length === 1) {
      return multi = $selection[0]
    }

    multi = {}
    for(let object of $selection) {
      for(let prop of getComputedProperties(object)) {
        if(multi[prop] === undefined) {
          multi[prop] = object[prop]
        }
        else if(multi[prop] !== object[prop]) {
          multi[prop] = ""
        }
      }
    }
    multi._z = $selection.map(p => p._z).sort((a,b) => a-b).join(", ")
    return multi
  }

  // $: console.log(multi)


  async function updateObjects() {
    await tick()
    for(let object of $selection) {
      for(let prop in multi) {
        if(object[prop] !== undefined && multi[prop] !== "") {
          object[prop] = multi[prop]
        }
      }
      encodeObjectData(object)
    }
    buildXML()
    for(let store of stores) {
      store.update(v => v)
    }
    $selection = $selection
  }

  function resetProperty(prop) {
    if(multi[`_${prop}_default`] === undefined) {
      throw `Prop ${prop} has no default value`
    }
    multi[`_${prop}`] = multi[`_${prop}_default`]
    updateObjects()
  }

  function invertLH() {
    for(let platform of $selection.filter(o => o._objectType === "platform")) {
      let w = platform._width
      platform._width = platform._height
      platform._height = w
    }
    updateObjects()
  }

  function adjustZ({shiftKey,ctrlKey}, sign) {
    let factor = shiftKey ? 10 : ctrlKey ? 100 : 1
    let deltaZ = sign*factor

    for(let [store,storeList,objectType] of [[platforms,$platforms,"platform"],[decorations,$decorations,"decoration"],[shamanObjects,$shamanObjects,"shamanObject"]]) {
      if(!objectTypes.includes(objectType)) continue
      let objects = $selection.filter(({_objectType}) => _objectType === objectType)
      let newOrder = storeList
      console.log(objects, storeList)
      if(deltaZ < 0) {
        let pp = objects.sort((a,b) => a._z - b._z)
        let currentZ = -1
        for(let object of pp) {
          currentZ = Math.max(currentZ+1, object._z + deltaZ)
          newOrder.splice(object._z, 1)
          newOrder = [...newOrder.slice(0,currentZ), object, ...newOrder.slice(currentZ)]
        }
      }
      else {
        let pp = objects.sort((a,b) => b._z - a._z)
        let currentZ = storeList.length
        console.log("max insertion index ", currentZ)
        for(let object of pp) {
          currentZ = Math.min(currentZ-1, object._z + deltaZ)
          console.log("actual index ", object._z)
          console.log("will insert at index ", currentZ)
          newOrder.splice(object._z, 1)
          newOrder = [...newOrder.slice(0,currentZ), object, ...newOrder.slice(currentZ)]
        }
      }
      store.set(newOrder)
    }
    
    buildXML()
    $selection = $selection
  }

  function requestGroundType() {
    groundTypePicker.request(type => {
      clearGroundTypeRequestTimeout()
      multi._type = type
      updateObjects()
    })
  }
  let groundTypeRequestTimeout
  function cancelGroundTypeRequest() {
    groundTypeRequestTimeout = setTimeout(() => {
      groundTypePicker.cancelRequest()
      groundTypeRequestTimeout = null
    }, 1000)
  }
  function clearGroundTypeRequestTimeout() {
    if(groundTypeRequestTimeout !== null) {
      clearTimeout(groundTypeRequestTimeout)
    }
  }

  let flyRight = { duration: 50, x: 100 }
  
</script>


{#if $selection.length} <!-- Global if -->


<section class="text-sm flex justify-between action-buttons">
  <Tooltip inline title="Delete" bottom>
    <Button on:click={selection.remove}>{$_("button-delete")}</Button></Tooltip>
  <Tooltip inline title="D" bottom>
    <Button on:click={selection.duplicate}>{$_("button-duplicate")}</Button></Tooltip>
  <Tooltip inline title="Ctrl+C" bottom>
    <Button on:click={selection.copy}>{$_("button-copy")}</Button></Tooltip>
</section>

<section>
  <label for="" class="w-1/2">
    <div class="flex">
      <Button on:click={e => adjustZ(e, -1)}>-</Button>
      <div class="flex">
        <TextInput number disabled={true} center value={multi._z} />
      </div>
      <Button on:click={e => adjustZ(e, +1)}>+</Button>
    </div>
  </label>
  {#if multi._foreground !== undefined}
  <label transition:fly={flyRight}>
    <span>{$_("foreground")}</span>
    <input class="" type="checkbox" bind:checked={multi._foreground} on:change={updateObjects} />
  </label>
  {/if}
</section>

<div class="mb-2"></div>




<section>
  <label>
    <span>X</span>
    <TextInput number bind:value={multi._x} on:input={updateObjects} />
  </label>
  <label>
    <span>Y</span>
    <TextInput number bind:value={multi._y} on:input={updateObjects} />
  </label>
</section>

{#if objectTypes.includes("platform")}
<section>
  <label>
    <span>L</span>
    <TextInput number bind:value={multi._width} on:input={updateObjects} />
  </label>
  <label class="icon" on:click={invertLH} >
    <Icon icon={faExchangeAlt} /></label>
  <label>
    <span>H</span>
    <TextInput number bind:value={multi._height} on:input={updateObjects} />
  </label>
</section>

<div class="mb-2"></div>

{#if objectTypes.length === 1 && objectTypes[0] === "platform"}
<section>
  <label>
    <span class="input-text text-sm">{$_("ground-type")}</span>
    <TextInput number bind:value={multi._type} on:input={updateObjects} 
      on:blur={cancelGroundTypeRequest} on:focus={clearGroundTypeRequestTimeout}
    />
    <div class="icon ml-3" on:click={requestGroundType} >
      <Icon icon={faCrosshairs} />
    </div>
  </label>
</section>
{/if}

{#if multi._color !== undefined}
<div class="mb-2"></div>
<section transition:fly={flyRight}>
  <label class="">
    <span>{$_("ground-color")}</span>
    <div class="color-tile cursor-pointer" style="background: {multi._displayColor}"></div>
    <ColorTextInput bind:value={multi._color} on:input={updateObjects} />
  </label>
</section>
{/if}

<div class="mb-2"></div>

{#if multi._friction !== undefined}
<section>
  <label>
    <span>{$_("friction")}</span>
    <TextInput number bind:value={multi._friction} on:input={updateObjects} />
    <div class="icon ml-3" 
      class:disabled={multi._friction_default === "" || multi._friction === multi._friction_default}
      on:click={() => resetProperty("friction")}
    ><Icon icon={faUndo} /></div>
  </label>
</section>
<section>
  <label>
    <span>{$_("restitution")}</span>
    <TextInput number bind:value={multi._restitution} on:input={updateObjects} />
    <div class="icon ml-3" 
      class:disabled={multi._restitution_default === "" || multi._restitution === multi._restitution_default}
      on:click={() => resetProperty("restitution")}
    ><Icon icon={faUndo} /></div>
  </label>
</section>
{/if}
{/if}

{#if multi._rotation !== undefined}
<section transition:fly={flyRight}>
  <label>
    <span class="input-text text-sm">{$_("rotation")}</span>
    <TextInput number bind:value={multi._rotation} on:input={updateObjects} />
    <div class="icon ml-3" 
      class:disabled={multi._rotation_default === "" || multi._rotation === multi._rotation_default}
      on:click={() => resetProperty("rotation")}
    ><Icon icon={faUndo} /></div>
  </label>
</section>
{#if multi._dynamic}
<section transition:fly={flyRight}>
  <label transition:fly={flyRight}>
    <span class="input-text text-sm">{$_("fixed-rotation")}</span>
    <input class="" type="checkbox" bind:checked={multi._fixedRotation} on:change={updateObjects} />
  </label>
</section>
{/if}
{/if}

{#if multi._friction !== undefined}
<div class="mb-2"></div>

<section>
  <label>
    <span>{$_("mice-collision")}</span>
    <input class="" type="checkbox" bind:checked={multi._miceCollision} on:change={updateObjects} />
  </label>
</section>
<section>
  <label>
    <span>{$_("ground-collision")}</span>
    <input class="" type="checkbox" bind:checked={multi._groundCollision} on:change={updateObjects} />
  </label>
</section>

<div class="mb-2"></div>

<section>
  <label>
    <span>{$_("dynamic")}...</span>
    <input class="" type="checkbox" bind:checked={multi._dynamic} on:change={updateObjects} />
  </label>
</section>
{#if multi._dynamic}
<div transition:fly={flyRight} class="border-l-2 pl-3 border-white">
  <section>
    <label>
      <span>{$_("mass")}</span>
      <TextInput number bind:value={multi._mass} on:input={updateObjects} />
    </label>
  </section>
  <section>
    <label>
      <span>{$_("linear-damping")}</span>
      <TextInput number bind:value={multi._linearDamping} on:input={updateObjects} />
    </label>
  </section>
  <section>
    <label>
      <span>{$_("angular-damping")}</span>
      <TextInput number bind:value={multi._angularDamping} on:input={updateObjects} />
    </label>
  </section>
</div>
{/if}
{/if}

{#if multi._invisible !== undefined}
<div class="mb-2"></div>
<section transition:fly={flyRight}>
  <label>
    <span class="input-text text-sm">{$_("invisible")}</span>
    <input class="" type="checkbox" bind:checked={multi._invisible} on:change={updateObjects} />
  </label>
</section>
{/if}

{#if multi._vanish !== undefined}
<div class="mb-2"></div>
<section transition:fly={flyRight}>
  <label>
    <span>{$_("vanish")}</span>
    <TextInput number bind:value={multi._vanish} on:input={updateObjects} />
  </label>
</section>
{/if}

{#if multi._nosync !== undefined}
<div class="mb-2"></div>
<section transition:fly={flyRight}>
  <label>
    <span>nosync</span>
    <input class="" type="checkbox" bind:checked={multi._nosync} on:change={updateObjects} />
  </label>
</section>
{/if}

{#if multi._lua !== undefined}
<div class="mb-2"></div>
<section transition:fly={flyRight}>
  <label>
    <span class="input-text text-sm">Lua ID</span>
    <TextInput bind:value={multi._lua} on:input={updateObjects} />
  </label>
</section>
{/if}

{#if multi._groundImageEnabled !== undefined}
<div class="mb-2"></div>
<section transition:fly={flyRight}>
  <label>
    <span class="input-text text-sm">{$_("ground-image")}...</span>
    <input class="" type="checkbox" bind:checked={multi._groundImageEnabled} on:change={updateObjects} />
  </label>
</section>
{#if multi._groundImageEnabled}
<div transition:fly={flyRight} class="border-l-2 pl-3 border-white">
  <div class="mb-1"></div>
  <section>
    <label>
      <span class="input-text text-sm">Url</span>
      <div class="rtl-input">
        <TextInput placeholder="1651b30c284.png"
          bind:value={multi._groundImageUrl} on:input={updateObjects} />
      </div>
    </label>
  </section>
  <section>
    <label>
      <span>X</span>
      <TextInput number bind:value={multi._groundImageX} on:input={updateObjects} />
    </label>
    <label>
      <span>Y</span>
      <TextInput number bind:value={multi._groundImageY} on:input={updateObjects} />
    </label>
  </section>
</div>
{/if}
{/if}

{#if multi._holeColor !== undefined}
<div class="mb-2"></div>

<section transition:fly={flyRight}>
  <label>
    <span>{$_("hole")}</span>
    <div class="material-input">
      <select bind:value={multi._holeColor} on:change={updateObjects} >
        <option value=""> </option>
        <option value="1" style="color:#7DB8BF;">1</option>
        <option value="2" style="color:#DDA3E5;">2</option>
      </select>
    </div>
  </label>
</section>
{/if}

{#if multi._reverse !== undefined}
<div class="mb-2"></div>

<section transition:fly={flyRight}>
  <label>
    <span class="input-text text-sm">{$_("flip-horizontally")}</span>
    <input class="" type="checkbox" bind:checked={multi._reverse} on:change={updateObjects} />
  </label>
</section>
{/if}

{#if multi._numColors !== undefined && multi._numColors !== 0}
<div class="mb-2"></div>

<section transition:fly={flyRight} class="flex-wrap">
  <label>
    <span>{$_("decoration-colors")}</span>
  </label>
  {#each [0,1,2,3,4,5] as i}
  {#if multi["_color"+i] !== undefined}
  <section class="mt-1">
    <label>
      <div class="color-tile cursor-pointer" style="background: {multi["_displayColor"+i]}"></div>
      <ColorTextInput bind:value={multi["_color"+i]} on:input={updateObjects} />
    </label>
  </section>
  {/if}
  {/each}
</section>
{/if}

{#if multi._ghost !== undefined}
<div class="mb-2"></div>

<section transition:fly={flyRight}>
  <label>
    <span class="input-text text-sm">{$_("ghost")}</span>
    <input class="" type="checkbox" bind:checked={multi._ghost} on:change={updateObjects} />
  </label>
</section>
{/if}

{#if multi._nailPower !== undefined}
<div class="mb-2"></div>

<section transition:fly={flyRight}>
  <label>
    <span class="input-text text-sm">{$_("power")}</span>
    <TextInput number bind:value={multi._nailPower} on:input={updateObjects} />
  </label>
</section>
<section transition:fly={flyRight}>
  <label>
    <span class="input-text text-sm">{$_("speed")}</span>
    <TextInput number bind:value={multi._nailSpeed} on:input={updateObjects} />
  </label>
</section>
{/if}


{/if} <!-- Global if-->


<style lang="text/postcss">
  :global(.action-buttons > div) {
    display: flex;
    flex-grow: 1;
  }
  :global(.action-buttons > div > button) {
    flex-grow: 1;
    padding: 0.25rem 0 !important;
    margin: 0 0.1rem !important;
  }
  .rtl-input {
    direction: rtl;
  }
  .rtl-input:focus-within {
    direction: initial;
  }
  section {
    @apply flex items-center mb-1;
  }
  label {
    transition: 200ms;
    @apply flex items-center justify-between;
  }
  label:not(:last-child) {
    @apply mr-4;
  }
  label > span {
    user-select: none;
    white-space: nowrap;
    @apply mr-3 text-sm text-gray-300;
  }
  .icon {
    @apply text-sm text-gray-300 cursor-pointer;
  }
  .icon.disabled {
    @apply pointer-events-none;
    opacity: 0.4;
  }
  .color-tile {
    @apply p-3 mr-2 shadow rounded;
  }
  
</style>
