
<script>
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import decorationMetadata from "metadata/decoration/index"

  const types = decorationMetadata.entries()
    .filter(([_,metadata]) => !metadata.special)
    .map(([type,_]) => type)

</script>

<div class="flex flex-wrap justify-center">
  {#each types as type}
    <div class="tile dim-40" class:active={$creation.enabled && $creation.creationType === "DECORATION" && $creation.type == type}
      on:click={() => Creation.setDecoration(type)}
    >
      <img class="dim-max-40" src="dist/decorations/{type}.png" alt={type}/>
    </div>
  {/each}
</div>