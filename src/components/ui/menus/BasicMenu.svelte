
<script>
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import { mapSettings } from "state/map"

  const types = ["F","T","DS","DC","DC2"]
  const getFileName = type =>
    type === "F"
      ? $mapSettings.dodue
          ? $mapSettings.theme === "halloween"
              ? "F-candy"
              : "F-triple"
          : "F"
      : type

</script>

<div class="flex flex-wrap justify-center">
  {#each types as type}

    <div class="tile dim-40" class:active={$creation.enabled && $creation.creationType === "DECORATION" && $creation.type == type}
      on:click={() => Creation.setDecoration(type)}
    >
      <img class="dim-max-40" src="dist/decorations/{getFileName(type, $mapSettings)}.png" alt={type}/>
    </div>

  {/each}
</div>