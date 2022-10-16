
<script>

  import { slide, fly } from "svelte/transition"

  import TextInput from "/components/common/TextInput.svelte"
  import ColorTextInput from "/components/common/ColorTextInput.svelte"

  import { 
    highQuality, parkour, snatch, showGameGUI, showMapBorder, showInvisibleGrounds, gridSettings, _
  } from "/stores/stores.js"

</script>


<div class="flex">

  <div class="flex-grow flex flex-col">

    <section>
      <label class="flex items-center">
        <input type="checkbox" bind:checked={$highQuality}/>
        <span class="text-sm gray-200 ml-2">{$_("high-resolution")}</span>
      </label>
    </section>

    <div class="mb-2"></div>

    <section>
      <label class="flex items-center">
        <input type="checkbox" bind:checked={$showGameGUI}/>
        <span class="text-sm gray-200 ml-2">{$_("show-game-gui")}</span>
      </label>
    </section>
    <section>
      <label class="flex items-center">
        <input type="checkbox" bind:checked={$showMapBorder}/>
        <span class="text-sm gray-200 ml-2">{$_("show-map-border")}</span>
      </label>
    </section>
    <section>
      <label class="flex items-center">
        <input type="checkbox" bind:checked={$showInvisibleGrounds}/>
        <span class="text-sm gray-200 ml-2">{$_("show-invisible-grounds")}</span>
      </label>
    </section>

    <div class="mb-2"></div>

    <section>
      <label class="flex items-center">
        <input type="checkbox" bind:checked={$gridSettings.enabled}/>
        <span class="text-sm gray-200 ml-2">{$_("show-grid")}...</span>
      </label>
    </section>
    {#if $gridSettings.enabled}
    <div transition:fly={{y:-10, duration: 60}} class="border-l-2 pl-3 border-white">
      <section>
        <label>
          <span>L</span>
          <span class="w-12">
            <TextInput number bind:value={$gridSettings.width} />
          </span>
        </label>
        <label>
          <span>H</span>
          <span class="w-12">
            <TextInput number bind:value={$gridSettings.height} />
          </span>
        </label>
      </section>
      <section>
        <label class="">
          <span>{$_("grid-color")}</span>
          <div class="color-tile cursor-pointer" style="background: #{$gridSettings.color}"></div>
          <span class="w-24">
            <ColorTextInput bind:value={$gridSettings.color} />
          </span>
        </label>
      </section>
    </div>
    {/if}

    <div class="mb-2"></div>

    <section>
      <label class="flex items-center">
        <input type="checkbox" bind:checked={$parkour}/>
        <input type="checkbox" bind:checked={$snatch}/>
        <span class="text-sm gray-200 ml-2">{$_("show-parkour-checkpoints")}</span>
      </label>
    </section>

  </div>

  <!-- <div class="ml-2 pl-2 border-l border-gray-200" >
    
  </div> -->

</div>


<style>
  section {
    @apply flex items-center;
  }
  label {
    transition: 200ms;
    @apply flex items-center justify-between;
  }
  label + label {
    @apply ml-4;
  }
  label > span, small-text {
    user-select: none;
    white-space: nowrap;
    @apply mr-3 text-sm text-gray-300;
  }
  .color-tile {
    @apply p-2 mr-2 shadow rounded;
  }
</style>