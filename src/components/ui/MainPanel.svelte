
<script>
  import { slide, fly } from "svelte/transition"

  //import SelectionMenu from "components/ui/SelectionMenu.svelte"
  import MapSettingsMenu from "components/ui/MapSettingsMenu.svelte"

  import { selection } from "state/selection"

</script>



<div class="panel relative w-64 text-white z-10 flex-shrink-0"> 
  <MapSettingsMenu />

  {#if $selection.length}

  <!-- <div transition:fly={{ x: 500, duration: 80 }} class="flying">
    <SelectionMenu /> 
  </div> -->

  {/if}
</div>

<style lang="test/postcss">
  .flying {
    @apply  p-4 bg-gray-700 text-white z-20 overflow-auto;
    @apply w-full h-full absolute top-0 right-0 bottom-0;
  }
</style>