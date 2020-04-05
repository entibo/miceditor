
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
  import ColorTextInput from "components/common/ColorTextInput.svelte"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"


  import { _ } from "state/locale"


  export let props
  
</script>


<div class="form">

  <div class="flex">
    <label>
      <span>X</span>
      <TextInput int value={props.x.value} set={props.x.set} />
    </label>
    <div class="mr-3"></div>
    <label>
      <span>Y</span>
      <TextInput int value={props.y.value} set={props.y.set} />
    </label>
  </div>
  
  <div class="mb-4"></div>

  <div class:disabled={props.rotation.value === undefined}>
    <label>
      <span>{$_("rotation")}</span>
      <TextInput float value={props.rotation.value} set={props.rotation.set} class="w-16"/>
    </label>
  </div>
  
  <div class="mb-2"></div>

  <label class:disabled={props.ghost.value === undefined}>
    <span>{$_("ghost")}</span>
    <Checkbox checked={props.ghost.value} set={props.ghost.set} />
  </label>
  
  <div class="mb-4"></div>

  <div class:disabled={props.power.value === undefined}>
    <label>
      <span>{$_("power")}</span>
      <TextInput float value={props.power.value} set={props.power.set} class="w-16"/>
    </label>
    <div class="mb-1"></div>
    <label>
      <span>{$_("speed")}</span>
      <TextInput float value={props.speed.value} set={props.speed.set} class="w-16"/>
    </label>
  </div>
  
  <div class="mb-2"></div>

  <label class:disabled={props.nosync.value === undefined}>
    <span>nosync</span>
    <Checkbox checked={props.nosync.value} set={props.nosync.set} />
  </label>

</div>