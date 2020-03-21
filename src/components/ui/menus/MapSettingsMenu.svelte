
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

  import TextInput from "/components/common/TextInput.svelte"
  import Tooltip from "/components/common/Tooltip.svelte"
  import ColorTextInput from "/components/common/ColorTextInput.svelte"
  import Button from "/components/common/Button.svelte"
  import Checkbox from "/components/common/Checkbox.svelte"
  import CheckboxItem from "/components/common/CheckboxItem.svelte"

//  import ImagesSubMenu from "/components/ui/ImagesSubMenu.svelte"

  import { _ } from "/state/locale"
  import { mapSettings, updateMiceSpawn } from "/state/map"
  
  import * as sceneObjects from "/state/sceneObjects"
  function updateDecorations() {
    console.log("updateDecorations()")
    for(let cheese of sceneObjects.groups.decorations.filter(obj => obj.type === "F"))
      cheese.invalidate()
  }

  $: maxWidth  = $mapSettings.defilante.enabled ? 4800 : 1600
  $: maxHeight = 800

</script>

<div class="form">

  <div class="mb-2"></div>

  <div class="flex">
    <label>
      <span>L</span>
      <TextInput number sub="max: {maxWidth}" bind:value={$mapSettings.width} />
    </label>
  <div class="mr-3"></div>
    <label>
      <span>H</span>
      <TextInput number sub="max: {maxHeight}" bind:value={$mapSettings.height} />
    </label>
  </div>

  <div class="mb-2"></div>

  <label>
    <span>{$_("gravity")}</span>
    <TextInput number bind:value={$mapSettings.gravity} class="w-16" />
  </label>
  
  <label>
    <span>{$_("wind")}</span>
    <TextInput number bind:value={$mapSettings.wind} class="w-16" />
  </label>
  
  <div class="mb-2"></div>

  <section>
    <label>
      <span>{$_("background")}</span>
      <div class="material-input w-32">
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
  </section>

  <div class="mb-2"></div>

  <section>
    <label>
      <span>{$_("theme")}</span>
      <div class="material-input w-32">
        <select bind:value={$mapSettings.theme} on:change={updateDecorations}>
          <option value="">{$_("none")}</option>
          <option value="halloween">{$_("background4")}</option>
        </select>
      </div>
    </label>
  </section>

  <div class="mb-2"></div>

  <section>
    <label>
      <span>{$_("shaman_objects")}: {$_("mass")}</span>
      <TextInput number bind:value={$mapSettings.shamanObjectsMass} class="w-16" />
    </label>
  </section>

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
    <span>{$_("defilante-mode")}...</span>
    <Checkbox bind:checked={$mapSettings.defilante.enabled}  />
  </label>
  {#if $mapSettings.defilante.enabled}
  <div class="submenu" transition:fly={{duration: 80, x:50}}>
    <label>
      <span>{$_("defilante-start-speed")}</span>
      <TextInput number bind:value={$mapSettings.defilante.startSpeed} class="w-16"/>
    </label>
    <label>
      <span>{$_("defilante-acceleration")}</span>
      <TextInput number bind:value={$mapSettings.defilante.acceleration} class="w-16"/>
    </label>
    <label>
      <span>{$_("defilante-maximum-speed")}</span>
      <TextInput number bind:value={$mapSettings.defilante.maxSpeed} class="w-16"/>
    </label>
    <label class="mt-1">
      <span>{$_("defilante-free-scroll")}</span>
      <Checkbox bind:checked={$mapSettings.defilante.freeScroll}  />
    </label>
  </div>
  {/if}

  <div class="mb-4"></div>

  <label>
    <span>{$_("mice-spawn")}</span>
    <div class="material-input w-32">
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

<!--   <ImagesSubMenu which="backgroundImages" title={$_("background")}/>
  <ImagesSubMenu which="foregroundImages" title={$_("foreground")}/>
  <ImagesSubMenu which="disappearingImages" title={$_("disappearing-images")}/> -->

</div>


<style lang="text/postcss">

  .boolean-props label:not(:last-child) {
    @apply mb-2;
  }


</style>