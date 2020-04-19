
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
      <span class="incompressible w-6">X</span>
      <TextInput int value={props.x.value} set={props.x.set} />
    </label>
    <div class="w-2"></div>
    <label>
      <span class="incompressible w-6">Y</span>
      <TextInput int value={props.y.value} set={props.y.set} />
    </label>
  </div>
  
  <div class="mb-1"></div>
  
  <Tooltip hoverable noStyle left>
    <label slot="tooltip" class="icon-btn text-xs" on:click={selection.invertLH} >
      <Icon icon={faExchangeAlt} />
    </label>
    <div class="flex" class:disabled={props.height.value === undefined}>
      <label>
        <span class="incompressible w-6">L</span>
        <TextInput int min={10} sliderMax={800} value={props.width.value} set={props.width.set} />
      </label>
      <div class="w-2"></div>
      <label>
        <span class="incompressible w-6">H</span>
        <TextInput int min={10} sliderMax={800} value={props.height.value} set={props.height.set} />
      </label>
    </div>
  </Tooltip>

  {#if props.radius.value !== undefined}
    <div class="mb-1"></div>

    <div class:disabled={props.radius.value === undefined}>
      <label>
        <span>Radius</span>
        <TextInput int min={10} sliderMax={400} value={props.radius.value} set={props.radius.set} class="w-16"/>
      </label>
    </div>
  {/if}

  <div class="mb-4"></div>

  <label>
    <span>{$_("ground-type")}</span>
    <TextInput platform int min={0} value={props.type.value} set={props.type.set} class="w-16"/>
  </label>  

  <div class:disabled={props.rotation.value === undefined}>
    <label>
      <span>
        {$_("rotation")}
        <span class="text-xs opacity-75">(deg)</span>
      </span>
      <TextInput float sliderMin={-180} sliderMax={180} value={props.rotation.value} set={props.rotation.set} class="w-16"/>
    </label>
  </div>

  <label>
    <span>{$_("invisible")}</span>
    <Checkbox checked={props.invisible.value} set={props.invisible.set} />
  </label>

  {#if props.color.value !== undefined}
    <div class:disabled={props.color.value === undefined}>
      <label>
        <span>{$_("color")}</span>
          <TextInput color value={props.color.value} set={props.color.set} class="w-16"/>
      </label>
    </div>
  {/if}

  
  <div class="mb-4"></div>
  
  <div class:disabled={props.friction.value === undefined}>
    <label>
      <span>{$_("friction")}</span>
      <TextInput float min={0} value={props.friction.value} set={props.friction.set} class="w-16"/>
    </label>
    <label>
      <span>{$_("restitution")}</span>
      <TextInput float min={0} value={props.restitution.value} set={props.restitution.set} class="w-16"/>
    </label>
  </div>

  <label class:disabled={props.dynamic.value === undefined}>
    <span>Mode</span>
    <div class="material-input w-24">
      <select value={props.physics.value} 
              on:change={e => props.physics.set(e.target.value)}
      >
        <option hidden value=""></option>
        <option value="STATIC">Static</option>
        <option value="DYNAMIC">{$_("dynamic")}</option>
        <option value="BOOSTER">Booster</option>
      </select>
    </div>
  </label>

  {#if props.physics.value === "BOOSTER"}
    <div class="submenu">
      <label>
        <span>
          {$_("rotation")}
          <span class="text-xs opacity-75">(deg)</span>
        </span>
        <TextInput class="w-16" int sliderMin={-180} sliderMax={180} step={45} value={props.boosterAngle.value} set={props.boosterAngle.set} />
      </label>
      <label>
        <span>
          {$_("speed")}
          <span class="text-xs opacity-75">(px/s)</span>
        </span>
        <TextInput class="w-16" int min={0} value={props.boosterSpeed.value} set={props.boosterSpeed.set} />
      </label>
    </div>
  {:else if props.physics.value === "DYNAMIC"}
    <div class="submenu">
      <label >
        <span>{$_("fixed-rotation")}</span>
        <Checkbox checked={props.fixedRotation.value} set={props.fixedRotation.set} />
      </label>
      <label>
        <span>{$_("mass")}</span>
        <TextInput class="w-16" float value={props.mass.value} set={props.mass.set} />
      </label>
      <label>
        <span>{$_("linear-damping")}</span>
        <TextInput class="w-16" float min={0} value={props.linearDamping.value} set={props.linearDamping.set} />
      </label>
      <label>
        <span>{$_("angular-damping")}</span>
        <TextInput class="w-16" float min={0} value={props.angularDamping.value} set={props.angularDamping.set} />
      </label>
    </div>
  {/if}

  <div class:disabled={props.miceCollision.value === undefined}>
    <label>
      <span>{$_("mice-collision")}</span>
      <Checkbox checked={props.miceCollision.value} set={props.miceCollision.set} />
    </label> 
    <label>
      <span>{$_("ground-collision")}</span>
      <Checkbox checked={props.objectCollision.value} set={props.objectCollision.set} />
    </label> 
  </div>

  <div class="mb-4"></div>

  <div class:disabled={props.vanish.value === undefined}>
    <label>
      <span>{$_("vanish")}</span>
      <TextInput float min={0} value={props.vanish.value} set={props.vanish.set} class="w-16"/>
    </label>   
  </div>
  
  <div class="mb-1"></div>
  
  <label>
    <span>nosync</span>
    <Checkbox checked={props.nosync.value} set={props.nosync.set} />
  </label>

  <div class="mb-4"></div>

  <label>
    <span>{$_("ground-image")}...</span>
    <Checkbox checked={props.imageEnabled.value} set={props.imageEnabled.set} />
  </label> 
  {#if props.imageEnabled.value}
    <div class="submenu" transition:fly={{duration: 80, x:50}}>
      <div class="flex">
        <label>
          <span class="incompressible">X</span>
          <TextInput int value={props.imageX.value} set={props.imageX.set} />
        </label>
        <div class="w-2"></div>
        <label>
          <span class="incompressible">Y</span>
          <TextInput int value={props.imageY.value} set={props.imageY.set} />
        </label>
      </div>
      <div class="mb-1"></div>
      <label>
        <span class="incompressible">Url</span>
        <TextInput value={props.imageValue.value} set={props.imageValue.set} />
      </label> 
    </div>
  {/if}  

  <div class="mb-1"></div>

  <label>
    <span>lua</span>
    <TextInput value={props.lua.value} set={props.lua.set} class="w-16"/>
  </label>

</div>