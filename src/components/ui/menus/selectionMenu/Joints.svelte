
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
  import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons/faExchangeAlt"
  import { faCrosshairs } from "@fortawesome/free-solid-svg-icons/faCrosshairs"

  import TextInput from "/components/common/TextInput.svelte"
  import Tooltip from "/components/common/Tooltip.svelte"
  import ColorTextInput from "/components/common/ColorTextInput.svelte"
  import Button from "/components/common/Button.svelte"
  import Checkbox from "/components/common/Checkbox.svelte"


  import { _ } from "/state/locale"
  
  export let props


  import * as selection from "/state/selection"
  import { groups } from "/state/selectionProperties"
  import * as Creation from "/state/creation"

  function selectPlatform(which) {
    Creation.setMechanic("", {
      which,
      joints: $groups.JOINT
    })
  }
  
</script>


<div class="form">

  <label>
    <span>Type</span>
    <TextInput disabled value={props.type.value} class="w-16" />
  </label>

  <div class="mb-2"></div>

  <label>
    <span>Platform 1</span>
    <div class="flex">
      <label class="icon-btn text-xs mr-2" on:click={() => selectPlatform("platform1")} >
        <Icon icon={faCrosshairs} />
      </label>
      <TextInput int value={props.platform1.value} set={props.platform1.set} class="w-16" />
    </div>
  </label>
  <div class="mb-1"></div>
  <label>
    <span>Platform 2</span>
    <div class="flex">
      <label class="icon-btn text-xs mr-2" on:click={() => selectPlatform("platform2")} >
        <Icon icon={faCrosshairs} />
      </label>
      <TextInput int value={props.platform2.value} set={props.platform2.set} class="w-16" />
    </div>
  </label>

  <div class="mb-4"></div>

  {#each [1,2,3,4] as idx}
    <div class="flex">
      <label class:disabled={props[`point${idx}Enabled`].value === undefined}>
        <span>P{idx}</span>
        <Checkbox checked={props[`point${idx}Enabled`].value} set={props[`point${idx}Enabled`].set} />
      </label>
      <div class="mr-3"></div>
      <div class="flex" class:disabled={props[`point${idx}Enabled`].value === false || props[`point${idx}X`].value === undefined}>
        <label>
          <span>X</span>
          <TextInput int value={props[`point${idx}X`].value} set={props[`point${idx}X`].set} />
        </label>
        <div class="mr-3"></div>
        <label>
          <span>Y</span>
          <TextInput int value={props[`point${idx}Y`].value} set={props[`point${idx}Y`].set} />
        </label>
      </div>
    </div>
    <div class="mb-1"></div>
  {/each}

  <div class="mb-4"></div>

  {#each [1,2] as idx}
    <div class="flex" class:disabled={props[`controlPoint${idx}X`].value === undefined}>
      <label>
        <span>CP{idx}</span>
      </label>
      <div class="mr-5"></div>
      <label>
        <span>X</span>
        <TextInput int value={props[`controlPoint${idx}X`].value} set={props[`controlPoint${idx}X`].set} />
      </label>
      <div class="mr-3"></div>
      <label>
        <span>Y</span>
        <TextInput int value={props[`controlPoint${idx}Y`].value} set={props[`controlPoint${idx}Y`].set} />
      </label>
    </div>
    <div class="mb-1"></div>
  {/each}

  <div class="mb-2"></div>

  <div class:disabled={props.fineness.value === undefined}>
    <label>
      <span>{$_("fineness")}</span>
      <TextInput int min={1} sliderMax={16} value={props.fineness.value} set={props.fineness.set} />
    </label>  
  </div>

  <div class="mb-4"></div>


  <label class:disabled={props.controlPoint1X.value !== undefined || props.renderEnabled.value === undefined}>
    <span>Draw...</span>
    <Checkbox checked={props.renderEnabled.value} set={props.renderEnabled.set} />
  </label>
  {#if props.renderEnabled.value !== undefined && props.renderEnabled.value !== false}
    <div class="submenu" transition:fly={{duration: 80, y:50}}>
      <label>
        <span>{$_("color")}</span>
        <TextInput color value={props.color.value} set={props.color.set} class="w-16" />
      </label>
      <div class="mb-1"></div>
      <label>
        <span>{$_("line-width")}</span>
        <TextInput int min={1} max={250} value={props.thickness.value} set={props.thickness.set} class="w-16"/>
      </label>
      <div class="mb-1"></div>
      <label>
        <span>{$_("opacity")}</span>
        <TextInput float min={0} max={1} step={0.01} value={props.opacity.value} set={props.opacity.set} class="w-16"/>
      </label>
      <div class="mb-1"></div>
      <label >
        <span>{$_("foreground")}</span>
        <Checkbox checked={props.foreground.value} set={props.foreground.set} />
      </label>
    </div>
  {/if}

</div>