
<script>
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
    visibility, selection, creation, highlightedObject, buildXML } from "/stores/stores.js"
  import { encodeMapData, mapBooleanProps } from "/xml-utils.js"

  $: data = $settings

  function updateSettings() {
    encodeMapData(data)
    buildXML()
    settings.update(v => v)
  }

  function updateMiceSpawn() {
    console.log(data._miceSpawn.type, data._miceSpawn)
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
      <span>Gravity</span>
      <TextInput number bind:value={data._gravity} on:input={updateSettings} />
    </label>
  </section>
  <div class="mb-1"></div>
  <section>
    <label>
      <span>Wind</span>
      <TextInput number bind:value={data._wind} on:input={updateSettings} />
    </label>
  </section>

  <div class="mb-2"></div>

  <section>
    <label>
      <span>Background</span>
      <div class="material-input">
        <select bind:value={data._backgroundImageId} on:change={updateSettings}>
          <option value="-1">None</option>
          <option value="0">Daylight</option>
          <option value="1">Dawn</option>
          <option value="2">Twilight</option>
          <option value="3">Full moon</option>
          <option value="4">Halloween</option>
          <option value="5">Christmas</option>
          <option value="6">Valentine</option>
          <option value="7">Storm clouds</option>
          <option value="8">Storm clouds 2</option>
        </select>
      </div>
    </label>
  </section>

  <div class="mb-2"></div>

  <section>
    <label>
      <span>Mass of shaman objects</span>
      <TextInput number bind:value={data._shamanObjectsMass} on:input={updateSettings} />
    </label>
  </section>

  <div class="mb-2"></div>

  {#each mapBooleanProps as {name, title}}
  <section>
    <label>
      <span>{title}</span>
      <input class="" type="checkbox" checked={data[name]} 
        on:change={e => { data[name] = !!e.target.checked, updateSettings()}} />
    </label>
  </section>
  {/each}

  <div class="mb-2"></div>

  <section>
    <label>
      <span>Defilante mode...</span>
      <input class="" type="checkbox" checked={data._defilanteEnabled} 
        on:change={e => { data._defilanteEnabled = !!e.target.checked, updateSettings()}} />
    </label>
  </section>
  {#if data._defilanteEnabled}
  <div class="mt-1"></div>
  <div transition:fly={{duration: 80, x:50}} class="border-l-2 pl-3 border-white">
    <section>
      <label>
        <span>Starting speed</span>
        <span class="w-1/3">
          <TextInput number bind:value={data._defilanteStartSpeed} on:input={updateSettings} />
        </span>
      </label>
    </section>
    <section>
      <label>
        <span>Acceleration</span>
        <span class="w-1/3">
          <TextInput number bind:value={data._defilanteAcceleration} on:input={updateSettings} />
        </span>
      </label>
    </section>
    <section>
      <label>
        <span>Maximum speed</span>
        <span class="w-1/3">
          <TextInput number bind:value={data._defilanteMaxSpeed} on:input={updateSettings} />
        </span>
      </label>
    </section>
    <section>
      <label>
        <span>Free scroll</span>
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
        <span>Mice spawn</span>
        <div class="material-input">
          <select bind:value={data._miceSpawn.type} on:change={updateMiceSpawn}>
            <option value="normal">Normal</option>
            <option value="multiple">Multiple</option>
            <option value="random">Random</option>
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
          <span>Axis</span>
        </label>
        <label class="w-1/2">
          <span>Random</span>
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

  <ImagesSubMenu which="backgroundImages" title="Background"/>
  <ImagesSubMenu which="foregroundImages" title="Foreground"/>
  <ImagesSubMenu which="disappearingImages" title="Disappearing"/>

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