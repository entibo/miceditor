
<script>
  import { tick } from "svelte"
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo"
  import { faEye } from "@fortawesome/free-solid-svg-icons/faEye"
  import { faEyeSlash } from "@fortawesome/free-solid-svg-icons/faEyeSlash"
  import { faTrashAlt as faTrash } from "@fortawesome/free-solid-svg-icons/faTrashAlt"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"
  import { faCircle } from "@fortawesome/free-solid-svg-icons/faCircle"
  import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle"

  import TextInput from "/components/common/TextInput.svelte"
  import Tooltip from "/components/common/Tooltip.svelte"
  import ColorTextInput from "/components/common/ColorTextInput.svelte"
  import Button from "/components/common/Button.svelte"

  import ImagesSubMenu from "/components/ui/ImagesSubMenu.svelte"
  import MultipleMiceSpawnSubMenu from "/components/ui/MultipleMiceSpawnSubMenu.svelte"

  import { 
    platforms, decorations, shamanObjects, settings, 
    visibility, selection, creation, highlightedObject, buildXML, _ } from "/stores/stores.js"
  import { encodeMapData, mapBooleanProps } from "/xml-utils.js"

  $: data = $settings

  async function updateSettings() {
    await tick()
    encodeMapData(data)
    buildXML()
    settings.update(v => v)
  }

  function updateMiceSpawn() {
    if(data._miceSpawn.type === "multiple") {
      data._miceSpawn.positions = 
        $decorations.filter(({name}) => name === "DS")
        .map(({_x,_y}) => ({x:_x, y:_y}))
    }
    else if(data._miceSpawn.type === "random") {
      data._miceSpawn.axis = "x"
      data._miceSpawn.value = 350
    }
    else if(data._miceSpawn.type === "normal") {
      if(data._miceSpawn.positions && data._miceSpawn.positions.length) {
        creation.setFromType("decoration", "DS")
        creation.create(data._miceSpawn.positions[0])
        $creation = null
      }
    }

    encodeMapData(data)
    buildXML()
    settings.update(v => v)
  }
  
  function updateDecorations() {
  console.log("updateDecorations()")
	decorations.update(v => v)
  }

</script>

<div class="p-4 bg-gray-700 shadow-lg absolute right-o h-full w-full overflow-y-auto overflow-x-hidden">

  <div class="mb-2"></div>

  <section>
    <label>
      <span>L</span>
      <TextInput number sub="max: {data._width_max}" bind:value={data._width} on:input={updateSettings} />
    </label>
    <label>
      <span>H</span>
      <TextInput number sub="max: {data._height_max}" bind:value={data._height} on:input={updateSettings} />
    </label>
  </section>

  <div class="mb-2"></div>

  <section>
    <label>
      <span>{$_("gravity")}</span>
      <TextInput number bind:value={data._gravity} on:input={updateSettings} />
    </label>
  </section>
  <div class="mb-1"></div>
  <section>
    <label>
      <span>{$_("wind")}</span>
      <TextInput number bind:value={data._wind} on:input={updateSettings} />
    </label>
  </section>

  <div class="mb-2"></div>

  <section>
    <label>
      <span>{$_("background")}</span>
      <div class="material-input">
        <select bind:value={data._backgroundImageId} on:change={updateSettings}>
          <option value="-1">{$_("none")}</option>
          <option value="-2">{$_("random")}</option>
          <option value="0">{$_("background0")}</option>
          <option value="1">{$_("background1")}</option>
          <option value="2">{$_("background2")}</option>
          <option value="3">{$_("background3")}</option>
          <option value="4">{$_("background4")}</option>
          <option value="5">{$_("background5")}</option>
          <option value="6">{$_("background6")}</option>
          <option value="7">{$_("background7")}</option>
          <option value="8">{$_("background8")}</option>
        </select>
      </div>
    </label>
  </section>

  <div class="mb-2"></div>

  <section>
    <label>
      <span>{$_("theme")}</span>
      <div class="material-input">
        <select bind:value={data._theme} 
		  on:change={() => {
		    updateSettings()
			updateDecorations()
	      }}>
          <option value=""> </option>
          <option value="halloween">{$_("background4")}</option>
        </select>
      </div>
    </label>
  </section>

  <div class="mb-2"></div>

  <section>
    <label style="display: block;">
      <span class="block">{$_("shaman_objects")}: {$_("mass")}</span>
      <TextInput number bind:value={data._shamanObjectsMass} on:input={updateSettings} />
    </label>
  </section>

  <div class="mb-2"></div>

  {#each mapBooleanProps as prop}
  <section>
    <label>
      <span>{$_(prop.titleKey)}</span>
      <input class="" type="checkbox" checked={data[prop.name]} 
        on:change={e => { 
		  data[prop.name] = !!e.target.checked
		  updateSettings()
		  if(prop.updateDecorations) updateDecorations()
		 }} />
    </label>
  </section>
  {/each}

  <div class="mb-2"></div>

  <section>
    <label>
      <span>{$_("defilante-mode")}...</span>
      <input class="" type="checkbox" checked={data._defilanteEnabled} 
        on:change={e => { data._defilanteEnabled = !!e.target.checked, updateSettings()}} />
    </label>
  </section>
  {#if data._defilanteEnabled}
  <div class="mt-1"></div>
  <div transition:fly={{duration: 80, x:50}} class="border-l-2 pl-3 border-white">
    <section>
      <label>
        <span>{$_("defilante-start-speed")}</span>
        <span class="w-1/3">
          <TextInput number bind:value={data._defilanteStartSpeed} on:input={updateSettings} />
        </span>
      </label>
    </section>
    <section>
      <label>
        <span>{$_("defilante-acceleration")}</span>
        <span class="w-1/3">
          <TextInput number bind:value={data._defilanteAcceleration} on:input={updateSettings} />
        </span>
      </label>
    </section>
    <section>
      <label>
        <span>{$_("defilante-maximum-speed")}</span>
        <span class="w-1/3">
          <TextInput number bind:value={data._defilanteMaxSpeed} on:input={updateSettings} />
        </span>
      </label>
    </section>
    <section>
      <label>
        <span>{$_("defilante-free-scroll")}</span>
        <input class="" type="checkbox" checked={data._defilanteFreeScroll} 
          on:change={e => { data._defilanteFreeScroll = !!e.target.checked, updateSettings()}} />
      </label>
    </section>
  </div>
  {/if}

  <div class="mb-2"></div>

  <div
    on:mouseenter={() => $highlightedObject = "miceSpawn"}
    on:mouseleave={() => $highlightedObject = null}
  >
    <section>
      <label>
        <span>{$_("mice-spawn")}</span>
        <div class="material-input">
          <select bind:value={data._miceSpawn.type} on:change={updateMiceSpawn}>
            <option value="normal">{$_("mice-spawn-normal")}</option>
            <option value="multiple">{$_("mice-spawn-multiple")}</option>
            <option value="random">{$_("random-spawn")}</option>
          </select>
        </div>
      </label>
    </section>
    {#if data._miceSpawn.type === "multiple"}
    <section class="flex-col border-l-2 pl-3 border-white mt-1" transition:fly={{duration: 80, x:50}}>
      <MultipleMiceSpawnSubMenu />
    </section>

    {:else if data._miceSpawn.type === "random"}
    <section class="flex-col border-l-2 pl-3 border-white mt-1" transition:fly={{duration: 80, x:50}}>
      <div class="flex w-full">
        <label class="w-1/2">
          <span>{$_("axis")}</span>
        </label>
        <label class="w-1/2">
          <span>{$_("random-spawn")}</span>
        </label>
      </div>
      <div class="flex w-full">
        <label class="w-1/2">
          <span>X</span>
          {#if data._miceSpawn.axis !== "x"}
          <TextInput number bind:value={data._miceSpawn.value} on:input={updateSettings} />
          {/if}
        </label>
        <label class="w-1/2 cursor-pointer" on:click={() => { data._miceSpawn.axis = "x"; updateSettings()}}>
          <Icon icon={data._miceSpawn.axis === "x" ? faCheckCircle : faCircle}/>
        </label>
      </div>
      <div class="flex w-full">
        <label class="w-1/2">
          <span>Y</span>
          {#if data._miceSpawn.axis !== "y"}
          <TextInput number bind:value={data._miceSpawn.value} on:input={updateSettings} />
          {/if}
        </label>
        <label class="w-1/2 cursor-pointer" on:click={() => { data._miceSpawn.axis = "y"; updateSettings()}}>
          <Icon icon={data._miceSpawn.axis === "y" ? faCheckCircle : faCircle}/>
        </label>
      </div>
    </section>
    {/if}
  </div>

  <div class="mb-4"></div>

  <ImagesSubMenu which="backgroundImages" title={$_("background")}/>
  <ImagesSubMenu which="foregroundImages" title={$_("foreground")}/>
  <ImagesSubMenu which="disappearingImages" title={$_("disappearing-images")}/>

</div>


<style lang="text/postcss">
  .rtl-input {
    direction: rtl;
  }
  .rtl-input:focus-within {
    direction: initial;
  }
  .image-list {
    border-left: 2px solid white;
    @apply pl-3 mb-2
  }
  section {
    @apply flex items-center;
  }
  label {
    transition: 200ms;
    @apply flex items-center justify-between;
  }
  label:not(:last-child) {
    @apply mr-4;
  }
  label > span, small-text {
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
</style>