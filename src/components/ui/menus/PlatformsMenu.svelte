
<script>
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import { typeNames } from "data/editor/Platform"
</script>

<div class="flex flex-wrap justify-center">
  {#each typeNames as name, type}
    <div class="tile dim-40" class:active={$creation.enabled && $creation.creationType === "PLATFORM" && $creation.type == type}
        on:click={() => Creation.setPlatform(type)}
    >
      <img class="rounded-sm" src="dist/grounds/{name}.png" alt={name}/>
    </div>
  {/each}
</div>
