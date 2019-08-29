<script>
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faEye } from "@fortawesome/free-solid-svg-icons/faEye"
  import { faEyeSlash } from "@fortawesome/free-solid-svg-icons/faEyeSlash"
  import { faTrashAlt as faTrash } from "@fortawesome/free-solid-svg-icons/faTrashAlt"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"

  import TextInput from "/components/common/TextInput.svelte"
  import Tooltip from "/components/common/Tooltip.svelte"

  import { settings, visibility, buildXML, _ } from "/stores/stores.js"
  import { encodeMapData } from "/xml-utils.js"

  function updateSettings() {
    encodeMapData($settings)
    buildXML()
    settings.update(v => v)
  }

</script>

{#if $settings._miceSpawn.type === "multiple" && $settings._miceSpawn.positions !== undefined}

<section class="flex-col">
  <div class="text-sm text-gray-100 w-full flex justify-between">
    <span>{$_("positions")}</span>
    <Tooltip inline title={$_("button-add")}>
      <div class="cursor-pointer text-green-500"
        on:click={() => {
          $settings._miceSpawn.positions.push({x:400,y:200})
          updateSettings()
        }}
      >
        <Icon icon={faPlus} /></div></Tooltip>
    <Tooltip inline bottom end title={$_("toggle-visibility")}>
      <div class="cursor-pointer" class:text-red-500={!$visibility.basic}
        on:click={() => visibility.toggle("basic")}
      >
        <Icon icon={$visibility.basic ? faEye : faEyeSlash} /></div></Tooltip>
  </div>
  <div class="flex flex-col">
    {#each $settings._miceSpawn.positions as pos, index}
    <div class="indented flex my-1">
      <label>
        <span>X</span>
        <TextInput number value={pos.x} on:input={e => { pos.x = e.target.value, updateSettings()}} />
      </label>
      <label>
        <span>Y</span>
        <TextInput number value={pos.y} on:input={e => { pos.y = e.target.value, updateSettings()}} />
      </label>
      <Tooltip inline bottom end title={$_("button-delete")}>
        <div class="cursor-pointer text-red-500 text-sm"
          on:click|stopPropagation={() => {
            $settings._miceSpawn.positions.splice(index, 1)
            updateSettings()
          }}
        >
          <Icon icon={faTrash} />
        </div>
      </Tooltip>
    </div>
    {/each}
  </div>
</section>

{/if}


<style lang="text/postcss">
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