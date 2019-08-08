<script>
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faEye } from "@fortawesome/free-solid-svg-icons/faEye"
  import { faEyeSlash } from "@fortawesome/free-solid-svg-icons/faEyeSlash"
  import { faTrashAlt as faTrash } from "@fortawesome/free-solid-svg-icons/faTrashAlt"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"

  import TextInput from "/components/common/TextInput.svelte"
  import Tooltip from "/components/common/Tooltip.svelte"

  import { settings, visibility, buildXML, highlightedObject } from "/stores/stores.js"
  import { encodeMapData } from "/xml-utils.js"

  export let which
  export let title

  $: data = $settings

  function updateSettings() {
    encodeMapData(data)
    buildXML()
    settings.update(v => v)
  }

</script>


<section class="flex-col">
  <div class="text-sm text-gray-100 w-full flex justify-between">
    <span>{title} images</span>
    <Tooltip inline title="Add">
      <div class="cursor-pointer text-green-500"
        on:click={() => {
          $settings["_"+which].push({url:"",x:0,y:0})
          updateSettings()
        }}
      >
        <Icon icon={faPlus} /></div></Tooltip>
    <Tooltip inline bottom end title="Toggle visibility">
      <div class="cursor-pointer" class:text-red-500={!$visibility[which]}
        on:click={() => visibility.toggle(which)}
      >
        <Icon icon={$visibility[which] ? faEye : faEyeSlash} /></div></Tooltip>
  </div>
  <div class="flex flex-col">
    {#each $settings["_"+which] as data, index}
    <div class="indented">

      <div class="flex my-1">
        <label>
          <span>X</span>
          <TextInput number value={data.x} on:input={e => { data.x = e.target.value, updateSettings()}} />
        </label>
        <label>
          <span>Y</span>
          <TextInput number value={data.y} on:input={e => { data.y = e.target.value, updateSettings()}} />
        </label>
        <Tooltip inline bottom end title="Remove">
          <div class="cursor-pointer text-red-500 text-sm"
            on:click|stopPropagation={() => {
              $settings["_"+which].splice(index, 1)
              updateSettings()
            }}
          >
            <Icon icon={faTrash} />
          </div>
        </Tooltip>
      </div>

      <div class="flex">
        <label>
          <span>Url</span>
          <div class="rtl-input">
            <TextInput placeholder="x_transformice/x_evt/x_evt_19/svtrixcv/bateau.png"
              value={data.url} on:input={e => { data.url = e.target.value, updateSettings()}} />
          </div>
        </label>
      </div>

      {#if which === "disappearingImages"}
      <div class="indented mt-1"
        on:mouseenter={() => $highlightedObject = data.index}
        on:mouseleave={() => $highlightedObject = null}
      >
        <div class="text-xs text-gray-300">Disappearing rectangle</div>
        <div class="flex">
          <label>
            <span class="text-xs">Left</span>
            <TextInput number value={data.rx} on:input={e => { data.rx = e.target.value, updateSettings()}} />
          </label>
          <label>
            <span class="text-xs">Top</span>
            <TextInput number value={data.ry} on:input={e => { data.ry = e.target.value, updateSettings()}} />
          </label>
        </div>
        <div class="flex">
          <label>
            <span>L</span>
            <TextInput number value={data.rw} on:input={e => { data.rw = e.target.value, updateSettings()}} />
          </label>
          <label>
            <span>H</span>
            <TextInput number value={data.rh} on:input={e => { data.rh = e.target.value, updateSettings()}} />
          </label>
        </div>
      </div>
      {/if}

    </div>
    {/each}
  </div>
</section>

<style lang="text/postcss">
  .rtl-input {
    direction: rtl;
  }
  .rtl-input:focus-within {
    direction: initial;
  }
  .indented {
    @apply border-l-2 border-white pl-3 mb-2
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
  label > span{
    user-select: none;
    white-space: nowrap;
    @apply mr-3 text-sm text-gray-300;
  }
</style>