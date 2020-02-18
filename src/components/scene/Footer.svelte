
<script>
  import { fly } from "svelte/transition"

  import { selection } from "/stores/stores.js"
  import Tooltip from "/components/common/Tooltip.svelte"

  export let position
  export let selectionArea

  $: [x,y] = [position.x, position.y].map(v => Math.round(v))
  let sw, sh
  $: if(selectionArea) {
    sw = Math.round(selectionArea.x2-selectionArea.x1)
    sh = Math.round(selectionArea.y2-selectionArea.y1)
  }

</script>

<div class="absolute z-40 bottom-0 px-4 pointer-events-none flex">

  <div class="section">
    <span class="text-gray-500 text-xs">X</span>
    <span class="text-gray-100 w-8 text-right inline-block">{x}</span>
    <span class="text-gray-500 text-xs ml-2">Y</span>
    <span class="text-gray-100 w-8 text-right inline-block">{y}</span>
  </div>

  {#if $selection.length}
  <div class="ml-4 section" >
    <span class="text-gray-100">{$selection.length}</span>
    <span class="text-gray-500 text-xs ml-1">selected</span>
  </div>
  {/if}

  {#if selectionArea}
  <div class="ml-4 section" >
    <span class="text-gray-500 text-xs">L</span>
    <span class="text-gray-100 w-8 text-right inline-block">{sw}</span>
    <span class="text-gray-500 text-xs ml-2">H</span>
    <span class="text-gray-100 w-8 text-right inline-block">{sh}</span>
  </div>
  {/if}

</div>

<div class="right-0 absolute z-30 bottom-0 px-4 flex">

  <div class="section">
    <span class="text-gray-100">Miceditor</span>
    <span class="text-gray-500 text-xs ml-1">v1.3.2</span>
    <span class="text-gray-500 text-xs ml-2">by</span>
    <span class="text-gray-100 ml-1">entibo</span>
  </div>

  <div class="ml-2 section">
    <Tooltip top title="Github">
      <a href="https://github.com/entibo/miceditor" target="_blank">
        <img src="dist/github.png" alt="Github" style="width: 24px" />
      </a>
    </Tooltip>
  </div>

  <div class="ml-2 section flex items-center">
    <Tooltip top title="Atelier801">
      <a href="https://atelier801.com/topic?f=6&t=884238" target="_blank">
          <img src="dist/atelier801.png" alt="Atelier801" />
      </a>  
    </Tooltip>
  </div>

</div>

<style lang="text/postcss">
  .section {
    @apply bg-gray-800 rounded-t px-3 py-1;
  }
  a {
    text-decoration: none;
  }
</style>