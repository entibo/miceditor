
<script>
  import { tick } from "svelte"
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo"

  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"


  import { _ } from "state/locale"
  import { showGameGUI, showMapBorder, showInvisibleGrounds, grid } from "state/user"

</script>


<div class="form">

  <label>
    <span>{$_("show-game-gui")}</span>
    <Checkbox bind:checked={$showGameGUI}  />
  </label>

  <div class="mb-2"></div>

  <label>
    <span>{$_("show-map-border")}</span>
    <Checkbox bind:checked={$showMapBorder}  />
  </label>

  <div class="mb-2"></div>

  <label>
    <span>{$_("show-invisible-grounds")}</span>
    <Checkbox bind:checked={$showInvisibleGrounds}  />
  </label>

  <div class="mb-4"></div>

  <label>
    <span>{$_("show-grid")}...</span>
    <Checkbox bind:checked={$grid.enabled}  />
  </label>
  {#if $grid.enabled}
    <div class="submenu" transition:fly={{duration: 80, y:-50}}>
      <div class="flex">
        <label>
          <span>L</span>
          <TextInput int min={1} sliderMax={800} bind:value={$grid.width} class="w-16"  bgColor="bg-gray-700"/>
        </label>
        <div class="mr-3"></div>
        <label>
          <span>H</span>
          <TextInput int min={1} sliderMax={800} bind:value={$grid.height} class="w-16"  bgColor="bg-gray-700"/>
        </label>
      </div>
      <div class="mb-1"></div>
      <label>
        <span>{$_("color")}</span>
        <TextInput color bind:value={$grid.color} class="w-16" bgColor="bg-gray-700"/>
      </label>
    </div>
  {/if}

</div> 

