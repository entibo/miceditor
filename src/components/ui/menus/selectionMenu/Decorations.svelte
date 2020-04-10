
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

  <label class:disabled={props.foreground.value === undefined}>
    <span>{$_("foreground")}</span>
    <Checkbox checked={props.foreground.value} set={props.foreground.set} />
  </label>
  
  <div class="mb-2"></div>

  <label class:disabled={props.reverse.value === undefined}>
    <span>{$_("flip-horizontally")}</span>
    <div class="flex">
      <div class="material-input w-16">
        <select value={props.reverse.value.toString()} 
                on:change={e => props.reverse.set(e.target.value === "false" ? false : e.target.value === "true" ? true : "random")}
        >
          <option value="false">{$_("no")}</option>
          <option value="true">{$_("yes")}</option>
          <option value="random">{$_("random")}</option>
        </select>
      </div>
      <div class="mr-1"></div>
      <Checkbox checked={props.reverse.value} set={props.reverse.set} />
    </div>
  </label>
  
  <div class="mb-2"></div>

  <label class:disabled={props.holeColor.value === undefined}>
    <span>{$_("hole")}</span>
    <div class="material-input w-16">
      <select value={props.holeColor.value} 
              on:change={e => props.holeColor.set(e.target.value)}
      >
        <option value=""> </option>
        <option value="1" style="color:#7DB8BF;">1</option>
        <option value="2" style="color:#DDA3E5;">2</option>
      </select>
    </div>
  </label>

  {#if props.color0.value !== undefined}
    <div class="mb-4"></div>
    <label>
      <span>{$_("decoration-colors")}</span>
    </label>
    <div class="submenu mt-1">
      {#each [0,1,2,3].map(k => "color"+k) as name}
        {#if props[name].value !== undefined}
          <div class="mt-1"></div>
          <label>
            <TextInput color value={props[name].value} set={props[name].set}/>
          </label>
        {/if}
      {/each}
    </div>
  {/if}

</div>