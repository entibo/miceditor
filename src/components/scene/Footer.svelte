
<script>
  import { fly } from "svelte/transition"

  import { selection } from "state/selection"
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import Tooltip from "components/common/Tooltip.svelte"
  import Button from "components/common/Button.svelte"
  
  import { _ } from "state/locale"


  export let position
  export let selectionBox

  $: [x,y] = [position.x, position.y].map(v => Math.round(v))
  let sw, sh
  $: if(selectionBox.box) {
    sw = Math.round(selectionBox.box.p2.x - selectionBox.box.p1.x)
    sh = Math.round(selectionBox.box.p2.y - selectionBox.box.p1.y)
  }

</script>

<div class="absolute z-20 bottom-0 px-2 flex h-7 pointer-events-none">

  {#if $creation.enabled}
  <div class="section flex" on:mousedown|preventDefault|stopPropagation >
    <span class="text-gray-200 text-sm">{$_("creation-mode")}</span>
    <Tooltip top title={$_("escape-key")} class="pointer-events-auto ml-2 -mt-1 -mr-3">
      <Button on:click={Creation.disable} class="text-sm h-7">
        {$_("cancel")}
      </Button>
    </Tooltip>
  </div>
  {/if}

  <div class="section flex items-baseline">
    <span class="text-gray-500 text-xs">X</span>
    <span class="text-gray-100 text-sm w-8 text-right inline-block">{x}</span>
    <span class="text-gray-500 text-xs ml-2">Y</span>
    <span class="text-gray-100 text-sm w-8 text-right inline-block">{y}</span>
  </div>


  {#if $selection.length > 0}
  <div class="section flex items-baseline" >
    <span class="text-gray-100 text-sm">{$selection.length}</span>
    <span class="text-gray-500 text-xs ml-1">{$_("selected")}</span>
  </div>
  {/if}

  {#if selectionBox.box}
  <div class="section flex items-baseline" >
    <span class="text-gray-500 text-xs">L</span>
    <span class="text-gray-100 text-sm w-8 text-right inline-block">{sw}</span>
    <span class="text-gray-500 text-xs ml-2">H</span>
    <span class="text-gray-100 text-sm w-8 text-right inline-block">{sh}</span>
  </div>
  {/if}

</div>

<div class="right-0 absolute z-10 bottom-0 px-2 flex h-7">

  <div class="section flex items-baseline pointer-events-none">
    <span class="text-gray-100 font-cursive font-bold">Miceditor</span>
    <span class="text-gray-500 font-mono text-xs ml-1">v2.0.0</span>
    <span class="text-gray-300 font-sans text-sm ml-2">by <span class="font-medium">entibo</span></span>
  </div>

  <div class="section flex items-center">
    <Tooltip top title="Github">
      <a href="https://github.com/entibo/miceditor" target="_blank">
        <img src="dist/github.png" alt="Github" style="width: 20px" />
      </a>
    </Tooltip>
  </div>

  <div class="mx-2 bg-gray-800 rounded-t py-1 pl-1 pr-2 flex items-center">
    <Tooltip top title="Atelier801">
      <a href="https://atelier801.com/topic?f=6&t=884238" target="_blank">
          <img src="dist/atelier801.png" alt="Atelier801" />
      </a>  
    </Tooltip>
  </div>

</div>

<style lang="text/postcss">
  .section {
    @apply bg-gray-800 rounded-t px-3 py-1 mx-2;
  }
  a {
    text-decoration: none;
  }
</style>