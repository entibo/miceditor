
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

  import * as selection from "state/selection"

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

  <label>
    <span>Url</span>
    <TextInput value={props.imageValue.value} set={props.imageValue.set} />
  </label> 
  
  <div class="mb-4"></div>

  <label class:disabled={props.foreground.value === undefined}>
    <span>{$_("foreground")}</span>
    <Checkbox checked={props.foreground.value} set={props.foreground.set} />
  </label>
  
  <div class="mb-2"></div>

  <label>
    <span>{$_("disappearing-images")}...</span>
    <Checkbox checked={props.disappearing.value} set={props.disappearing.set} />
  </label>
  {#if props.disappearing.value !== false}
    <div class="submenu mt-1">
      <div class="flex">
        <label>
          <span>X</span>
          <TextInput int value={props.rx.value} set={props.rx.set} />
        </label>
        <div class="mr-3"></div>
        <label>
          <span>Y</span>
          <TextInput int value={props.ry.value} set={props.ry.set} />
        </label>
      </div>
      <div class="mb-1"></div>
      <div class="flex">
        <label>
          <span>L</span>
          <TextInput int min={0} value={props.rw.value} set={props.rw.set} />
        </label>
        <div class="mr-3"></div>
        <label>
          <span>H</span>
          <TextInput int min={0} value={props.rh.value} set={props.rh.set} />
        </label>
      </div>      
    </div>
  {/if}

</div>