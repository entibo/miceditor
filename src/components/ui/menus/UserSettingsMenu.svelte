
<script>
  import { tick } from "svelte"
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo"
  import { faLink } from "@fortawesome/free-solid-svg-icons/faLink"
  import { faUnlink } from "@fortawesome/free-solid-svg-icons/faUnlink"

  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"


  import { _ } from "state/locale"
  import { showGameGUI, showMapBorder, showInvisibleGrounds, showMechanics, highQuality, grid } from "state/user"
  import { setSmallLayout, setLargeLayout } from "state/layout"

  function onSetWidth(v) {
    if($grid.widthHeightLinked) {
      let factor = v / $grid.width
      $grid.height = $grid.height * factor
    }
    $grid.width = v
  }
  function onSetHeight(v) {
    if($grid.widthHeightLinked) {
      let factor = v / $grid.height
      $grid.width = $grid.width * factor
    }
    $grid.height = v
  }

</script>


<div class="form tabContent">

  <label>
    <span>{$_("show-game-gui")}</span>
    <Checkbox bind:checked={$showGameGUI}  />
  </label>

  <label>
    <span>{$_("show-map-border")}</span>
    <Checkbox bind:checked={$showMapBorder}  />
  </label>

  <label>
    <span>{$_("show-invisible-grounds")}</span>
    <Checkbox bind:checked={$showInvisibleGrounds}  />
  </label>

  <label>
    <span>{$_("show-mechanics")}</span>
    <Checkbox bind:checked={$showMechanics}  />
  </label>

  <label>
    <span>{$_("high-resolution")}</span>
    <Checkbox bind:checked={$highQuality}  />
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
          <span class="incompressible w-6">L</span>
          <TextInput int min={0} step={10} sliderMax={800} value={$grid.width} set={onSetWidth} class="w-16" bgColor="bg-gray-700"/>
        </label>
        <label class="icon-btn text-xs mx-1" on:click={() => $grid.widthHeightLinked = !$grid.widthHeightLinked} >
          <Icon icon={$grid.widthHeightLinked ? faLink : faUnlink} />
        </label>
        <label>
          <span class="incompressible w-6">H</span>
          <TextInput int min={0} step={10} sliderMax={800} value={$grid.height} set={onSetHeight} class="w-16" bgColor="bg-gray-700"/>
        </label>
      </div>
      <div class="mb-1"></div>
      <label>
        <span>{$_("color")}</span>
        <TextInput color bind:value={$grid.color} class="w-16" bgColor="bg-gray-700"/>
      </label>
    </div>
  {/if}

  <div class="mb-4"></div>

  <label>
    <span>{$_("layout")}</span>
    <input type="checkbox" class="hidden"/>
    <div class="flex">
      <Button on:click={setSmallLayout} class="text-xs h-6">{$_("small")}</Button>
      <div class="mr-1"></div>
      <Button on:click={setLargeLayout} class="text-sm h-6">{$_("large")}</Button>
    </div>
  </label>

</div>

