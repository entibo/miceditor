
<script>
  import { tick } from "svelte"
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo"
  import { faEye } from "@fortawesome/free-solid-svg-icons/faEye"
  import { faEyeSlash } from "@fortawesome/free-solid-svg-icons/faEyeSlash"
  import { faTrashAlt as faTrash } from "@fortawesome/free-solid-svg-icons/faTrashAlt"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"
  import { faCircle } from "@fortawesome/free-solid-svg-icons/faCircle"
  import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle"

  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"


  import { _ } from "state/locale"
  import { mapSettings, updateMiceSpawn } from "state/map"
  import { parkourMode, setParkourMode } from "state/mapExtra"
  
  import * as sceneObjects from "state/sceneObjects"
  function updateDecorations() {
    for(let cheese of sceneObjects.groups.decorations.filter(obj => obj.type === "F"))
      cheese.invalidate()
  }

  $: maxWidth  = $mapSettings.defilante.enabled ? 4800 : 1600
  $: maxHeight = 800

</script>

<div class="form">

  <div class="mb-2"></div>

  <div class="flex justify-center">
    <label>
      <span class="incompressible w-6">L</span>
      <TextInput int min={800} sliderMax={maxWidth} sub="max: {maxWidth}" bind:value={$mapSettings.width} />
    </label>
  <div class="w-2"></div>
    <label>
      <span class="incompressible w-6">H</span>
      <TextInput int min={400} sliderMax={maxHeight} sub="max: {maxHeight}" bind:value={$mapSettings.height} />
    </label>
  </div>

  <div class="mb-4"></div>

  <label>
    <span>{$_("defilante-mode")}...</span>
    <Checkbox bind:checked={$mapSettings.defilante.enabled}  />
  </label>
  {#if $mapSettings.defilante.enabled}
    <div class="submenu" transition:fly={{duration: 80, y:-50}}>
      <label>
        <span>{$_("defilante-start-speed")}</span>
        <TextInput float min={0} bind:value={$mapSettings.defilante.startSpeed} class="w-16"/>
      </label>
      <label>
        <span>{$_("defilante-acceleration")}</span>
        <TextInput float min={0} bind:value={$mapSettings.defilante.acceleration} class="w-16"/>
      </label>
      <label>
        <span>{$_("defilante-maximum-speed")}</span>
        <TextInput float min={0} bind:value={$mapSettings.defilante.maxSpeed} class="w-16"/>
      </label>
      <label>
        <span>{$_("defilante-free-scroll")}</span>
        <Checkbox bind:checked={$mapSettings.defilante.freeScroll}  />
      </label>
    </div>
  {/if}  
  
  <div class="mb-4"></div>

  <label>
    <span>{$_("background")}</span>
    <div class="material-input w-24">
      <select bind:value={$mapSettings.backgroundImageId} >
        <option value="-1">{$_("none")}</option>
        <option value="-2">{$_("random")}</option>
        <option value="0">{$_("background0")}</option>
        <option value="1">{$_("background1")}</option>
        <option value="2">{$_("background2")}</option>
        <option value="3">{$_("background3")}</option>
        <option value="4">{$_("background4")}</option>
        <option value="5">{$_("background5")}</option>
        <option value="6">{$_("background6")}</option>
        <option value="7">{$_("background7")}</option>
        <option value="8">{$_("background8")}</option>
      </select>
    </div>
  </label>

  <section>
    <label>
      <span>{$_("theme")}</span>
      <div class="material-input w-24">
        <select bind:value={$mapSettings.theme} on:change={updateDecorations}>
          <option value="">{$_("none")}</option>
          <option value="halloween">{$_("background4")}</option>
        </select>
      </div>
    </label>
  </section>

  <div class="mb-4"></div>

  <label>
    <span>{$_("gravity")}</span>
    <div class="flex">
      <label class="icon-btn text-xs mr-1" on:click={() => $mapSettings.gravity = 10} >
        <Icon icon={faUndo} />
      </label>
      <TextInput float sliderMin={-50} sliderMax={50} bind:value={$mapSettings.gravity} class="w-16" />
    </div>
  </label>
  
  <label>
    <span>{$_("wind")}</span>
    <div class="flex">
      <label class="icon-btn text-xs mr-1" on:click={() => $mapSettings.wind = 0} >
        <Icon icon={faUndo} />
      </label>
      <TextInput float sliderMin={-50} sliderMax={50} bind:value={$mapSettings.wind} class="w-16" />
    </div>
  </label>

  <div class="mb-4"></div>

  <label>
    <span>{$_("mice-spawn")}</span>
    <div class="material-input w-24">
      <select value={$mapSettings.miceSpawn.type === "random" 
                       ? "random"+$mapSettings.miceSpawn.axis.toUpperCase() 
                       : $mapSettings.miceSpawn.type} 
              on:change={e => updateMiceSpawn(e.target.value)}>
        <option value="normal">{$_("mice-spawn-normal")}</option>
        <option value="multiple">{$_("mice-spawn-multiple")}</option>
        <option value="randomX">{$_("random-spawn")} X</option>
        <option value="randomY">{$_("random-spawn")} Y</option>
      </select>
    </div>
  </label>  

  <div class="mb-4"></div>
  
  <div class="boolean-props">
    <label>
      <span>{$_("allow-portals")}</span>
      <Checkbox bind:checked={$mapSettings.portals}  />
    </label>
    <label>
      <span>{$_("enable-mouse-collisions")}</span>
      <Checkbox bind:checked={$mapSettings.collisions}  />
    </label>
    <label>
      <span>{$_("soulmate-mode")}</span>
      <Checkbox bind:checked={$mapSettings.soulmate}  />
    </label>
    <label>
      <span>{$_("night-mode")}</span>
      <Checkbox bind:checked={$mapSettings.night}  />
    </label>
    <label>
      <span>{$_("hide-offscreen")}</span>
      <Checkbox bind:checked={$mapSettings.hideOffscreen}  />
    </label>
    <label>
      <span>{$_("hide-anchors")}</span>
      <Checkbox bind:checked={$mapSettings.hideNails}  />
    </label>
    <label>
      <span>{$_("cannonballs-up")}</span>
      <Checkbox bind:checked={$mapSettings.upwardsCannonballs}  />
    </label>
    <label>
      <span>{$_("dodue")}</span>
      <Checkbox bind:checked={$mapSettings.dodue} on:change={updateDecorations} />
    </label>
    <label>
      <span>Aie</span>
      <Checkbox bind:checked={$mapSettings.aie}  />
    </label>
  </div>

  <div class="mb-4"></div>

  <label>
    <span>{$_("shaman_objects")}: {$_("mass")}</span>
    <TextInput float bind:value={$mapSettings.shamanObjectsMass} class="w-16" />
  </label>

  <div class="mb-4"></div>

  <div class="flex flex-wrap justify-around">
    <Button disabled={$parkourMode} on:click={setParkourMode}>#parkour</Button>
  </div>

</div>


<style lang="text/postcss">
/* 
  .boolean-props label:not(:last-child) {
    @apply mb-2;
  }
 */

</style>