
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

  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"


  import { _ } from "state/locale"
  
  export let props


  import * as selection from "state/selection"
  import { groups } from "state/selectionProperties"
  import * as Creation from "state/creation"

  function selectPlatform(which) {
    Creation.setMechanic("", {
      which,
      joints: $groups.JOINT
    })
  }
  
</script>


<div class="form">

  <label>
    <span>{$_("type")}</span>
    <TextInput disabled value={props.type.value} class="w-16" />
  </label>

  <div class="mb-1"></div>

  <label>
    <span>{$_("platform")} 1</span>
    <div class="flex">
      <label class="icon-btn text-xs mr-1" on:click={() => selectPlatform("platform1")} >
        <Icon icon={faCrosshairs} />
      </label>
      <TextInput int value={props.platform1.value} set={props.platform1.set} class="w-16" />
    </div>
  </label>
  <label>
    <span>{$_("platform")} 2</span>
    <div class="flex">
      <label class="icon-btn text-xs mr-1" on:click={() => selectPlatform("platform2")} >
        <Icon icon={faCrosshairs} />
      </label>
      <TextInput int value={props.platform2.value} set={props.platform2.set} class="w-16" />
    </div>
  </label>

  <div class="mb-4"></div>

  <label class:disabled={props.controlPoint1X.value !== undefined || props.renderEnabled.value === undefined}>
    <span>{$_("draw")}...</span>
    <Checkbox checked={props.renderEnabled.value} set={props.renderEnabled.set} />
  </label>
  {#if props.renderEnabled.value !== undefined && props.renderEnabled.value !== false}
    <div class="submenu" transition:fly={{duration: 80, x:50}}>
      <label>
        <span>{$_("color")}</span>
        <TextInput color value={props.color.value} set={props.color.set} class="w-16" />
      </label>
      <label>
        <span>{$_("line-width")}</span>
        <TextInput int min={1} max={250} value={props.thickness.value} set={props.thickness.set} class="w-16"/>
      </label>
      <label>
        <span>{$_("opacity")}</span>
        <TextInput float min={0} max={1} step={0.01} value={props.opacity.value} set={props.opacity.set} class="w-16"/>
      </label>
      <label >
        <span>{$_("foreground")}</span>
        <Checkbox checked={props.foreground.value} set={props.foreground.set} />
      </label>
    </div>
  {/if}

  {#if props.fineness.value !== undefined}
    <div class:disabled={props.fineness.value === undefined}>
      <label>
        <span>{$_("fineness")}</span>
        <TextInput int min={1} sliderMax={16} value={props.fineness.value} set={props.fineness.set} class="w-16"/>
      </label>  
    </div>

    <div class="mb-1"></div>

    {#each [1,2] as idx}
      <div class="flex" class:disabled={props[`controlPoint${idx}X`].value === undefined}>
        <label>
          <span>CP{idx}</span>
        </label>
        <div class="w-2"></div>
        <label>
          <span class="incompressible w-6">X</span>
          <TextInput int value={props[`controlPoint${idx}X`].value} set={props[`controlPoint${idx}X`].set} />
        </label>
        <div class="w-2"></div>
        <label>
          <span class="incompressible w-6">Y</span>
          <TextInput int value={props[`controlPoint${idx}Y`].value} set={props[`controlPoint${idx}Y`].set} />
        </label>
      </div>
      <div class="mb-1"></div>
    {/each}
  {/if}  
    
  <div class="mb-4"></div>

  {#each [1,2,3,4] as idx}
    <div class="flex">
      <label class:disabled={props[`point${idx}Enabled`].value === undefined}>
        <span>P{idx}</span>
        <Checkbox checked={props[`point${idx}Enabled`].value} set={props[`point${idx}Enabled`].set} />
      </label>
      <div class="w-2"></div>
      <div class="flex" class:disabled={props[`point${idx}Enabled`].value === false || props[`point${idx}X`].value === undefined}>
        <label>
          <span class="incompressible w-6">X</span>
          <TextInput int value={props[`point${idx}X`].value} set={props[`point${idx}X`].set} />
        </label>
        <div class="w-2"></div>
        <label>
          <span class="incompressible w-6">Y</span>
          <TextInput int value={props[`point${idx}Y`].value} set={props[`point${idx}Y`].set} />
        </label>
      </div>
    </div>
    <div class="mb-1"></div>
  {/each}

  <!-- JD -->
  {#if props.frequency.value !== undefined}
    <div class="mb-4"></div>
    <label>
      <span>{$_("frequency")}</span>
      <TextInput float value={props.frequency.value} set={props.frequency.set} class="w-16"/>
    </label>
    <label>
      <span>{$_("damping")}</span>
      <TextInput float value={props.damping.value} set={props.damping.set} class="w-16"/>
    </label>
  {/if}

  <!-- JPL -->
  {#if props.ratio.value !== undefined}
    <div class="mb-4"></div>
    <label>
      <span>{$_("ratio")}</span>
      <TextInput float value={props.ratio.value} set={props.ratio.set} class="w-16"/>
    </label>
  {/if}

  <!-- JP, JR -->
  {#if props.power.value !== undefined}

    <div class="mb-4"></div>

    {#if props.axisX.value !== undefined}
      <div class="flex">
        <label>
          <span>{$_("axis")}</span>
        </label>
        <div class="w-2"></div>
        <label>
          <span class="incompressible w-6">X</span>
          <TextInput int min={-1} max={1} value={props.axisX.value} set={props.axisX.set} />
        </label>
        <div class="w-2"></div>
        <label>
          <span class="incompressible w-6">Y</span>
          <TextInput int min={-1} max={1} value={props.axisY.value} set={props.axisY.set} />
        </label>
      </div>
      <div class="mb-1"></div>
    {/if}

    {#if props.angle.value !== undefined}
      <label>
        <span>
          {$_("rotation")}
          <span class="text-xs opacity-75">(deg)</span>
        </span>
        <div class="flex">
          <label class="icon-btn text-xs mr-1" on:click={() => props.angle.set(0)} >
            <Icon icon={faUndo} />
          </label>
          <TextInput float sliderMin={-180} sliderMax={180} value={props.angle.value} set={props.angle.set} class="w-16"/>
        </div>
      </label>
      <div class="mb-2"></div>
    {/if}

    <label>
      <span>{$_("power")}</span>
      <div class="flex">
        <TextInput float value={props.power.value} set={props.power.set} class="w-16"/>
        <Checkbox checked={props.power.value === Infinity ? true : props.power.value === 0 ? false : undefined}
                  set={v => props.power.set(v ? Infinity : 0)}
        />
      </div>
    </label>
    <div class="submenu">
      <label class:disabled={props.power.value === 0}>
        <span>
          {$_("speed")}
          {#if props.type.value === "JR"}
            <span class="text-xs opacity-75">(deg/s)</span>
          {:else if props.type.value === "JP"}
            <span class="text-xs opacity-75">(px/s)</span>
          {/if}
        </span>
        <TextInput int value={props.speed.value} set={props.speed.set} class="w-16"/>
      </label>
    </div>
  
    <div class="mb-2"></div>

    <label>
      <span>
        {$_("limit")} 1
        {#if props.type.value === "JR"}
          <span class="text-xs opacity-75">(deg)</span>
        {:else if props.type.value === "JP"}
          <span class="text-xs opacity-75">(px)</span>
        {/if}
      </span>
      <div class="flex">
        <TextInput int value={props.min.value} set={props.min.set} class="w-16" />
        <Checkbox checked={props.min.value === -Infinity ? false : props.min.value === null ? null : true }
                  set={v => props.min.set(v ? -45 : -Infinity)}
        />
      </div>
    </label>
    <label>
      <span>
        {$_("limit")} 2
        {#if props.type.value === "JR"}
          <span class="text-xs opacity-75">(deg)</span>
        {:else if props.type.value === "JP"}
          <span class="text-xs opacity-75">(px)</span>
        {/if}
      </span>
      <div class="flex">
        <TextInput int value={props.max.value} set={props.max.set} class="w-16" />
        <Checkbox checked={props.max.value === +Infinity ? false : props.max.value === null ? null : true }
                  set={v => props.max.set(v ? +45 : +Infinity)}
        />
      </div>
    </label>
  
  {/if}




</div>