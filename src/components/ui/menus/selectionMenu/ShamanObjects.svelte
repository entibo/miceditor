
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

  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"


  import { _ } from "state/locale"
  import { parkourMode } from "state/mapExtra"


  export let props
  
</script>


<div class="form">

  <div class="flex">
    <label>
      <span class="incompressible w-6">X</span>
      <TextInput int value={props.x.value} set={props.x.set} />
    </label>
    <div class="w-2"></div>
    <label>
      <span class="incompressible w-6">Y</span>
      <TextInput int value={props.y.value} set={props.y.set} />
    </label>
  </div>
  
  {#if props.rotation.value !== undefined}
    <div class="mb-4"></div>

    <div class:disabled={props.rotation.value === undefined}>
      <label>
        <span>
          {$_("rotation")}
          <span class="text-xs opacity-75">(deg)</span>
        </span>
        <div class="flex">
          <label class="icon-btn text-xs mr-1" on:click={() => props.rotation.set(0)} >
            <Icon icon={faUndo} />
          </label>
          <TextInput float sliderMin={-180} sliderMax={180} value={props.rotation.value} set={props.rotation.set} class="w-16"/>
        </div>
      </label>
    </div>

    <label class:disabled={props.ghost.value === undefined}>
      <span>{$_("ghost")}</span>
      <Checkbox checked={props.ghost.value} set={props.ghost.set} />
    </label>

    <label class:disabled={props.invisible.value === undefined}>
      <span>{$_("invisible")}</span>
      <Checkbox checked={props.invisible.value} set={props.invisible.set} />
    </label>
  {/if}

  {#if props.power.value !== undefined}
    <div class="mb-4"></div>

    <div class:disabled={props.power.value === undefined}>
      <label>
        <span>{$_("power")}</span>
        <TextInput float value={props.power.value} set={props.power.set} class="w-16"/>
      </label>
      <label>
        <span>{$_("speed")}</span>
        <TextInput float value={props.speed.value} set={props.speed.set} class="w-16"/>
      </label>
    </div>
  {/if}
  
  <div class="mb-4"></div>

  <label class:disabled={props.nosync.value === undefined}>
    <span>nosync</span>
    <Checkbox checked={props.nosync.value} set={props.nosync.set} />
  </label>

  
  {#if props.stop.value !== undefined && $parkourMode}
    <div class="mb-4"></div>

    <label>
      <span>stop</span>
      <Checkbox checked={props.stop.value} set={props.stop.set} />
    </label>
  {/if}

</div>