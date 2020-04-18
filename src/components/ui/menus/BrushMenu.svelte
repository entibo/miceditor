
<script>

  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faPenNib } from "@fortawesome/free-solid-svg-icons/faPenNib"
  import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo"

  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"

  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import { brushPalette, brushDefaults } from "state/user"

  import { _ } from "state/locale"


  export let brush

  function updateBrush() {
    $brushPalette = $brushPalette
    if($creation.enabled && $creation.creationType === "LINE")
      creation.invalidate()
  }

</script>

<div class="form">

    <label>
      <span>{$_("color")}</span>
      <TextInput color bind:value={brush.color} set={updateBrush} class="w-16"/>
    </label>

    <label>
      <span>{$_("line-width")}</span>
      <TextInput int min={1} max={250} bind:value={brush.thickness} set={updateBrush} class="w-16"/>
    </label>

    <label>
      <span>{$_("opacity")}</span>
      <div class="flex">
        <label class="icon-btn text-xs mr-1" on:click={() => (brush.opacity = 1, updateBrush())} >
          <Icon icon={faUndo} />
        </label>
        <TextInput float min={0} max={1} step={0.01} bind:value={brush.opacity} set={updateBrush} class="w-16"/>
      </div>
    </label>

    <label >
      <span>{$_("foreground")}</span>
      <Checkbox bind:checked={brush.foreground} set={updateBrush} />
    </label>

    <label >
      <span class="flex items-center"> 
        <Icon icon={faPenNib} />
        <div class="mr-1"></div> 
        {$_("curve-tool")}
      </span>
      <Checkbox bind:checked={brush.curveToolEnabled} set={updateBrush} />
    </label>
    {#if brush.curveToolEnabled}
      <div class="submenu">
        <label>
          <span>{$_("fineness")}</span>
          <TextInput int min={1} sliderMax={16} bind:value={brush.fineness} set={updateBrush} class="w-16"/>
        </label>
      </div>
    {/if}   

</div>