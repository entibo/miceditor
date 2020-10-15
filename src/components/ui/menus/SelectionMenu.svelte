
<script>
  import { tick } from "svelte"
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo"
  import { faEye } from "@fortawesome/free-solid-svg-icons/faEye"
  import { faEyeSlash } from "@fortawesome/free-solid-svg-icons/faEyeSlash"
  import { faTrashAlt as faTrash } from "@fortawesome/free-solid-svg-icons/faTrashAlt"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"
  import { faMinus } from "@fortawesome/free-solid-svg-icons/faMinus"
  import { faCircle } from "@fortawesome/free-solid-svg-icons/faCircle"
  import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle"

  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"

  import { _ } from "state/locale"


  //import * as sceneObjects from "state/sceneObjects"
  import * as selection from "state/selection"

  import Platforms from "components/ui/menus/selectionMenu/Platforms.svelte"
  import Decorations from "components/ui/menus/selectionMenu/Decorations.svelte"
  import ShamanObjects from "components/ui/menus/selectionMenu/ShamanObjects.svelte"
  import Images from "components/ui/menus/selectionMenu/Images.svelte"
  import Joints from "components/ui/menus/selectionMenu/Joints.svelte"


  import { properties, common, groups } from "state/selectionProperties"

  $: numCategories = Object.values($groups)
        .map(g => g.length)
        .filter(x => x > 0)
        .length
        
  $: displayCategoryTitles = numCategories > 1
  
  function shiftIndex(e, dz) {
    if(e.shiftKey) dz *= 10
    if(e.ctrlKey)  dz *= 100
    selection.shiftIndex(dz)
  }

</script>

<div class="form">


  {#if numCategories > 0}
    <div class="category">
      <div class="form">
        <label>
          <span>Z</span>
          <div class="flex" >
            <label class="icon-btn text-xs mr-1" on:click={e => shiftIndex(e, -1)} >
              <div class="w-4 flex justify-center items-center">
                <Icon icon={faMinus} />
              </div>
            </label>
            <TextInput int min={0} value={$common.index.value} set={$common.index.set} class="w-10" />
            <label class="icon-btn text-xs ml-1" on:click={e => shiftIndex(e, +1)} >
              <div class="w-4 flex justify-center items-center">
                <Icon icon={faPlus} />
              </div>
            </label>
          </div>
        </label>  
        <label class:disabled={$common.foreground.value === undefined}>
          <span>{$_("foreground")}</span>
          <Checkbox checked={$common.foreground.value} set={$common.foreground.set} />
        </label>
      </div>
    </div>
  {/if}


  {#if $groups.PLATFORM.length}
    <div class="category">
      {#if displayCategoryTitles}
        <div class="category-title">{$_("category-grounds")}</div>
      {/if}
      <Platforms props={$properties.PLATFORM} />
    </div>
  {/if}

  {#if $groups.JOINT.length}
    <div class="category">
      {#if displayCategoryTitles}
        <div class="category-title">{$_("category-lines")}</div>
      {/if}
      <Joints props={$properties.JOINT} />
    </div>
  {/if}
  
  {#if $groups.DECORATION.length}
    <div class="category">
      {#if displayCategoryTitles}
        <div class="category-title">{$_("category-decorations")}</div>
      {/if}
      <Decorations props={$properties.DECORATION} />
    </div>
  {/if}  
  
  {#if $groups.SHAMANOBJECT.length}
    <div class="category">
      {#if displayCategoryTitles}
        <div class="category-title">{$_("shaman_objects")}</div>
      {/if}
      <ShamanObjects props={$properties.SHAMANOBJECT} />
    </div>
  {/if}  

  {#if $groups.IMAGE.length}
    <div class="category">
      {#if displayCategoryTitles}
        <div class="category-title">{$_("category-images")}</div>
      {/if}
      <Images props={$properties.IMAGE} />
    </div>
  {/if}

</div>



<style lang="text/postcss">

.category {
  @apply flex flex-col;
}
.category:not(:last-child) {
  @apply mb-4;
}
.category-title {
  @apply text-gray-200 font-cursive font-medium text-xs mb-4;
  @apply flex items-center;
}
.category-title:before, .category-title:after {
  content: "";
  @apply mx-1 flex-grow h-1 border-b-2 border-gray-500 border-dashed;
}


</style>