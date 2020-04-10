
<script>
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import { mapSettings } from "state/map"
  import { parkourMode } from "state/mapExtra"

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

    {#if type === "DS" && $parkourMode}
      <div class="tile dim-40" class:active={$creation.enabled && $creation.creationType === "SHAMANOBJECT" && $creation.type == 22}
        on:click={() => Creation.setShamanObject(22)}
      >
        <img src="dist/shamanObjects/nails.png" alt="#parkour checkpoint"
          style=" object-fit: none;
                  object-position: 0px 0px;
                  width: 40px; 
                  height: 40px;"
        />
      </div>
    {/if}

  {/each}
</div>