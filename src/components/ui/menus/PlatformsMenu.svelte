
<script>
  import Tooltip from "components/common/Tooltip.svelte"
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import { typeNames } from "data/editor/Platform"
</script>

<div class="flex flex-wrap justify-center">
  {#each typeNames as name, type}
    <div class="tile dim-40 relative" class:active={$creation.enabled && $creation.creationType === "PLATFORM" && $creation.type == type}
        on:click={() => Creation.setPlatform(type)}
    >
      <img class="rounded-sm" src="dist/grounds/{name}.png" alt={name}/>
      {#if name === "wood2"}
        <a class="info" href="dist/misc/wood16.jpg"
            target="_blank"
            rel="noopener noreferrer"
        >
          ?
        </a>
      {/if}
    </div>
  {/each}
</div>

<style lang="postcss">
  .info {
    @apply absolute text-white text-sm p-1;
    top: -6px;
    right: 0;
    transition: opacity 70ms;
    opacity: 0.6;
  }
  .tile:hover .info {
    opacity: 1;
  }
</style>
