
<script>

  import { tick, onMount } from "svelte"
  import { fly, slide } from "svelte/transition"
  
  import Icon from "fa-svelte"
  import { faLink } from "@fortawesome/free-solid-svg-icons/faLink"
  import { faUnlink } from "@fortawesome/free-solid-svg-icons/faUnlink"
  import { faTrashAlt as faTrash } from "@fortawesome/free-solid-svg-icons/faTrashAlt"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"
  import { faClone } from "@fortawesome/free-solid-svg-icons/faClone"
  import { faCopy } from "@fortawesome/free-solid-svg-icons/faCopy"
  import { faCut } from "@fortawesome/free-solid-svg-icons/faCut"
  import { faPaste } from "@fortawesome/free-solid-svg-icons/faPaste"
  import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo"
  import { faRedo } from "@fortawesome/free-solid-svg-icons/faRedo"
  import { faArrowsAlt } from "@fortawesome/free-solid-svg-icons/faArrowsAlt"
  import { faArrowsAltH } from "@fortawesome/free-solid-svg-icons/faArrowsAltH"
  import { faArrowsAltV } from "@fortawesome/free-solid-svg-icons/faArrowsAltV"
  import { faSyncAlt } from "@fortawesome/free-solid-svg-icons/faSyncAlt"
  import { faStepBackward } from "@fortawesome/free-solid-svg-icons/faStepBackward"
  import { faStepForward } from "@fortawesome/free-solid-svg-icons/faStepForward"
  import { faExpandAlt } from "@fortawesome/free-solid-svg-icons/faExpandAlt"
  import FaStepBackwardForward from "components/icons/FaStepBackwardForward.svelte"

  import Button from "components/common/Button.svelte"
  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"


  import { _ } from "state/locale"

  import * as Selection from "state/selection"
  import { selection } from "state/selection"
  import clipboard from "state/clipboard"


  let rotation = null
  function rotate(v) {
    Selection.rotateAround(v - rotation)
    rotation = v
  }

  let movementX = null, movementY = null
  function moveX(v) {
    Selection.move(v - movementX, 0)
    movementX = v
  }
  function moveY(v) {
    Selection.move(0, v - movementY)
    movementY = v
  }

  let scaleX = 1, scaleY = 1
  let scaleXYLinked = true
  function doScaleX(v) {
    if(Math.abs(v) <= 0.000001) return
    if(scaleXYLinked) {
      Selection.scale(v / scaleX, v / scaleY)
      scaleY = v
    }
    else Selection.scale(v / scaleX, 1)
    scaleX = v
  }
  function doScaleY(v) {
    if(scaleXYLinked) {
      Selection.scale(v / scaleX, v / scaleY)
      scaleX = v
    }
    else Selection.scale(1, v / scaleY)
    scaleY = v
  }

</script>

<div class="toolbar bg-gray-700b-65 absolute top-0 right-0 mt-6 py-2 px-2 rounded-l-sm flex flex-col">
  {#if $selection.length}

    <Tooltip left inDelay={500} class="toolbar-action text-red-400"
             title='{$_("button-delete")} (Delete)' on:click={Selection.remove}
    >
      <Icon icon={faTrash} />
    </Tooltip>
    
    <div class="mb-4"></div>
    
    <Tooltip left inDelay={500} class="toolbar-action text-green-400"
             title='{$_("button-duplicate")} (D)' on:click={Selection.duplicate}
    >
      <Icon icon={faClone} />
    </Tooltip>
    <Tooltip left inDelay={500} class="toolbar-action text-gray-200"
             title='{$_("button-copy")} (Ctrl+C)' on:click={clipboard.copy}
    >
      <Icon icon={faCopy} />
    </Tooltip>
    <Tooltip left inDelay={500} class="toolbar-action text-gray-200"
             title='{$_("cut")} (Ctrl+X)' on:click={clipboard.cut}
    >
      <Icon icon={faCut} />
    </Tooltip>

    <div class="mb-4"></div>

    <label class="relative">
      <Tooltip left inDelay={500} class="toolbar-action text-gray-200"
               title='{$_("rotate")} (Shift+Scroll)' on:click={() => rotation = null}
      >
        <Icon icon={faSyncAlt} />
      </Tooltip>
      <div class="floating-input">
        <TextInput int value={rotation} min={-180} max={180} step={15} set={rotate} class="w-12" />
      </div>
    </label>
    
    <label class="relative">
      <Tooltip left inDelay={500} class="toolbar-action text-gray-200"
               title='{$_("move-selection")} (Arrows)' on:click={() => movementX = movementY = null}
      >
        <Icon icon={faArrowsAlt} />
      </Tooltip>
      <div class="floating-input flex">
        <TextInput int value={movementX} sliderMin={-400} sliderMax={400} step={10} set={moveX} class="w-12" />
        <div class="w-6"></div>
        <TextInput int value={movementY} sliderMin={-400} sliderMax={400} step={10} set={moveY} class="w-12" />
      </div>
    </label>
    
    <label class="relative">
      <Tooltip left inDelay={500} class="toolbar-action text-gray-200"
               title='{$_("scale-selection")}' on:click={() => scaleX = scaleY = 1}
      >
        <Icon icon={faExpandAlt} />
      </Tooltip>
      <div class="floating-input flex">
        <TextInput float value={scaleX} sliderMin={0.1} sliderMax={10} step={0.1} set={doScaleX} class="w-12" />
        <div class="icon-btn w-4 h-6 bg-gray-900 border-blue-400  text-xs flex items-center justify-center" 
          class:border-b-2={scaleXYLinked}
          on:mousedown|preventDefault|stopPropagation 
          on:click|preventDefault|stopPropagation={() => scaleXYLinked = !scaleXYLinked} 
        >
          <Icon icon={scaleXYLinked ? faLink : faUnlink} />
        </div>
        <TextInput float value={scaleY} sliderMin={0.1} sliderMax={10} step={0.1} set={doScaleY} class="w-12" />
      </div>
    </label>

    <div class="mb-4"></div>
        
    <Tooltip left inDelay={500} class="toolbar-action text-gray-200"
             title='{$_("flip-horizontally-button")} (X)' on:click={Selection.flipX}
    >
      <Icon icon={faArrowsAltH} />
    </Tooltip>
    
    <Tooltip left inDelay={500} class="toolbar-action text-gray-200"
             title='{$_("flip-vertically-button")} (Y)' on:click={Selection.flipY}
    >
      <Icon icon={faArrowsAltV} />
    </Tooltip>

    <div class="mb-4"></div>

    <label class="relative">
      <Tooltip left inDelay={500} title={$_("horizontal-alignment")}>
        <div class="toolbar-action text-gray-200">
          <FaStepBackwardForward />
        </div>
      </Tooltip>
      <div class="align-tooltip flex-row">
        <div class="align-input"> 
          <TextInput /> 
        </div>
        <div class="toolbar-action m-1 text-gray-200" on:mousedown={Selection.alignXLeft}>
          <Icon icon={faStepBackward} />
        </div>
        <div class="toolbar-action m-1 text-gray-200" on:mousedown={Selection.alignXCenter}>
          <FaStepBackwardForward />
        </div>
        <div class="toolbar-action m-1 text-gray-200" on:mousedown={Selection.alignXRight}>
          <Icon icon={faStepForward} />
        </div>
      </div>
    </label>
    
    <label class="relative">
      <Tooltip left inDelay={500} title={$_("vertical-alignment")}>
        <div class="toolbar-action text-gray-200 rotated">
          <FaStepBackwardForward />
        </div>
      </Tooltip>
      <div class="align-tooltip flex-col">
        <div class="align-input"> 
          <TextInput /> 
        </div>
        <div class="toolbar-action m-1 text-gray-200 rotated" on:mousedown={Selection.alignYTop}>
          <Icon icon={faStepBackward} />
        </div>
        <div class="toolbar-action m-1 text-gray-200 rotated" on:mousedown={Selection.alignYCenter}>
          <FaStepBackwardForward />
        </div>
        <div class="toolbar-action m-1 text-gray-200 rotated" on:mousedown={Selection.alignYBottom}>
          <Icon icon={faStepForward} />
        </div>
      </div>
    </label>


  {:else}
  <Tooltip left inDelay={500} class="toolbar-action text-gray-100"
    title='{$_("paste")} (Ctrl+V)' on:click={clipboard.paste}
  >
  <Icon icon={faPaste} />
  </Tooltip>  
  {/if}
</div>

<style lang="text/postcss">
  .rotated {
    transform: rotate(90deg);
  }
  .align-tooltip {
    @apply shadow-lg rounded bg-gray-900;
    @apply flex items-center;
    position: absolute;
    pointer-events: none;
    opacity: 0;
    transition: 100ms;
    z-index: 40;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
  .align-tooltip:focus-within {
    pointer-events: all;
    opacity: 1;
  }
  .align-input {
    position: absolute;
    pointer-events: none;
    opacity: 0;
    /* visibility: hidden; */
  }
  .floating-input {
    position: absolute;
    pointer-events: none;
    opacity: 0;
    transition: 100ms;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 40;
  }
  .floating-input:focus-within {
    pointer-events: all;
    opacity: 1;
  }

  :global(.toolbar-action) {
    @apply w-6 h-6 flex justify-center items-center;
    @apply cursor-pointer;
    opacity: 0.85;
    transition: 60ms;
  }
  :global(.toolbar-action:hover) {
    opacity: 1;
  }
  :global(.toolbar-action:active > svg) {
    transform: scale(1.3);
  }
</style>