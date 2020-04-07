
<script>
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faPenNib } from "@fortawesome/free-solid-svg-icons/faPenNib"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"
  import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes"

  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import ColorTextInput from "components/common/ColorTextInput.svelte"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"

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

  function updateActiveBrush() {
    $brushPalette = $brushPalette
    creation.invalidate()
  }

</script>

<div class="form">

  <div class="flex flex-wrap">

    {#each $brushPalette as brush}
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
    {/each}

    <Tooltip title={$_("button-add")}>
      <div class="tile dim-40 rounded-sm active opacity-50 hover:opacity-100"
            on:click={addBrush}
      >
        <Icon icon={faPlus} />
      </div>
    </Tooltip>

  </div>

  <div class="mb-2"></div>

  {#if activeBrush}
    <div class="" transition:fly={{duration: 80, y:-50}}>

      <label>
        <span>{$_("color")}</span>
        <TextInput color bind:value={activeBrush.color} set={updateActiveBrush} class="w-16"/>
      </label>

      <div class="mb-1"></div>

      <label>
        <span>{$_("line-width")}</span>
        <TextInput int min={1} max={250} bind:value={activeBrush.thickness} set={updateActiveBrush} class="w-16"/>
      </label>

      <div class="mb-1"></div>

      <label>
        <span>{$_("opacity")}</span>
        <TextInput float min={0} max={1} step={0.01} bind:value={activeBrush.opacity} set={updateActiveBrush} class="w-16"/>
      </label>

      <div class="mb-1"></div>

      <label >
        <span>{$_("foreground")}</span>
        <Checkbox bind:checked={activeBrush.foreground} set={updateActiveBrush} />
      </label>

      <div class="mb-2"></div>

      <label >
        <span> 
          <Icon icon={faPenNib} /> 
          {$_("curve-tool")}
        </span>
        <Checkbox bind:checked={activeBrush.curveToolEnabled}  />
      </label>

      {#if activeBrush.curveToolEnabled}
        <div class="submenu mt-1" transition:fly={{duration: 80, y:-50}}>
          <label>
            <span>{$_("fineness")}</span>
            <TextInput int min={1} sliderMax={16} bind:value={activeBrush.fineness} class="w-16"/>
          </label>
        </div>
      {/if}   

    </div>
  {/if}

</div>


<style lang="postcss">
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
