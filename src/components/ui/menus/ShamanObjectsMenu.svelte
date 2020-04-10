
<script>
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import { mapSettings } from "state/map"
  import shamanObjectMetadata from "metadata/shamanObject/index"

  import ShamanObjectImage from "components/ui/ShamanObjectImage.svelte"
</script>


<div class="flex flex-wrap justify-center">

  {#if $mapSettings.defilante.enabled}
    <div class="w-full flex flex-wrap justify-center">
      {#each shamanObjectMetadata.entries().filter(([_,data]) => data.defilanteVariant) as [type, data]}
        <div class="tile" class:active={$creation.enabled && $creation.creationType === "SHAMANOBJECT" && $creation.type == type}
          on:click={() => Creation.setShamanObject(type)}
        >
          <img src="dist/shamanObjects/{data.defilanteVariant.sprite}" alt={data.defilanteVariant.sprite}/>
        </div>
      {/each}
    </div>
  {/if}

  {#each shamanObjectMetadata.entries().filter(([_,data]) => !data.isVariant) as [type, data]}
    <div class="tile" class:active={$creation.enabled && $creation.creationType === "SHAMANOBJECT" && $creation.type == type}
      on:click={() => Creation.setShamanObject(type)}
    >
      <ShamanObjectImage {data} />
    </div>
  {/each}

</div>