
<script>
  import { typeNames } from "/data/editor/Platform"
</script>

<div class="flex flex-wrap">
  {#each typeNames as name, type}
    <div class="tile"
        on:click={() => type}
    >
      <img class="rounded-sm" src="dist/grounds/{name}.png" alt={name}/>
    </div>
  {/each}
</div>

<style lang="postcss">
  .tile {
    width: 40px;
    height: 40px;
  }
</style>