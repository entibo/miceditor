
<script>
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"
  import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes"

  import Tooltip from "components/common/Tooltip.svelte"
  import BrushMenu from "components/ui/menus/BrushMenu.svelte"

  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import { brushPalette, brushDefaults } from "state/user"

  import { _ } from "state/locale"


  $: activeBrush = $creation.enabled && $creation.creationType === "LINE"
        ? $creation.brush
        : null

  function addBrush() {
    let newBrush = activeBrush
      ? { ...activeBrush }
      : brushDefaults()
    $brushPalette = [...$brushPalette, newBrush]

    Creation.disable()
    Creation.setLine(newBrush)
  }
  function removeBrush(brush) {
    $brushPalette = $brushPalette.filter(b => b !== brush)
    if(brush === activeBrush)
      Creation.disable()
  }

  let clientWidth = 0, clientHeight = 0
  $: displaySettingsInTooltip = true

</script>


<div class="w-full h-full">
    
  <div class="flex flex-wrap">

    {#each $brushPalette as brush, index}
      <Tooltip hoverable right noStyle
               inDelay={500} outDelay={0}
               active={displaySettingsInTooltip ? undefined : false}
      >
      
        <div slot="tooltip" class="opacity-95 hover:opacity-100 border-4 border-gray-800 tabContent">
          <BrushMenu {brush} />
        </div>

        <div class="relative">
          <div class="tile outline-outside dim-40 bg-tfm-blue rounded-sm overflow-hidden relative" 
              class:active={brush === activeBrush}
              on:click={() => Creation.setLine(brush)}
          >
            <div class="brush-preview" 
                style="background: #{brush.color}; opacity: {brush.opacity}; width: {brush.thickness}px; height: {brush.thickness}px;"
            ></div>
            <div class="brush-remove"
                on:click|preventDefault|stopPropagation={() => removeBrush(brush)}
            >
              <Icon icon={faTimes} />
            </div>
          </div>
          {#if index <= 9}
            <div class="brush-badge">{index+1}</div>
          {/if}
        </div>
      
      </Tooltip>
    {/each}

    <Tooltip title={$_("button-add")}>
      <div class="tile dim-40 rounded-sm active opacity-50 hover:opacity-100"
            on:click={addBrush}
      >
        <Icon icon={faPlus} />
      </div>
    </Tooltip>

  </div>

  {#if activeBrush && !displaySettingsInTooltip}
    <div class="w-full" transition:fly={{duration: 80, y:-50}}>
      <div class="mb-2"></div>
      <BrushMenu brush={activeBrush} />
    </div>
  {/if}

</div>


<style lang="postcss">
  .brush-badge {
    @apply pointer-events-none absolute z-10 bottom-0 left-0;
    @apply w-4 h-4 rounded-full bg-gray-700b;
    @apply flex justify-center items-center;
    @apply text-xs font-mono text-gray-200;
    /* transform: translate(-50%, 50%); */
  }
  .brush-preview {
    @apply rounded-full absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .brush-remove {
    @apply absolute text-red-600 text-sm;
    top: -6px;
    right: 0;
    transition: opacity 70ms;
    opacity: 0;
  }
  .tile:hover .brush-remove {
    opacity: 1;
  }
</style>
