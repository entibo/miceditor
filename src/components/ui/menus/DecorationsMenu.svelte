
<script>
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import decorationMetadata from "metadata/decoration/index"
</script>

<div class="flex flex-wrap justify-center">
  {#each decorationMetadata as _, type}
    <div class="tile dim-40" class:active={$creation.enabled && $creation.creationType === "DECORATION" && $creation.type == type}
      on:click={() => Creation.setDecoration(type)}
    >
      <img class="dim-max-40" src="dist/decorations/{type}.png" alt={type}/>
    </div>
  {/each}
</div>