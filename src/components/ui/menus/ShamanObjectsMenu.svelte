
<script>
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import { mapSettings } from "state/map"
  import shamanObjectMetadata from "metadata/shamanObject/index"

  import ShamanObjectImage from "components/ui/ShamanObjectImage.svelte"

  export let typeProp = null

  $: currentType = typeProp !== null ? typeProp : $creation.enabled && $creation.creationType === "SHAMANOBJECT" ? $creation.type : null

  export let onSelect = type => Creation.setShamanObject(type)

</script>


<div class="flex flex-wrap justify-center">

  {#if $mapSettings.defilante.enabled}
    <div class="w-full flex flex-wrap justify-center">
      {#each shamanObjectMetadata.entries().filter(([_,data]) => data.defilanteVariant) as [type, data]}
        <div class="tile" class:active={currentType !== null && currentType == type}
          on:click={() => onSelect(type)}
        >
          <img src="dist/shamanObjects/{data.defilanteVariant.sprite}" alt={data.defilanteVariant.sprite}/>
        </div>
      {/each}
    </div>
  {/if}

  {#each shamanObjectMetadata.mapEntries().filter(([_,data]) => !data.isVariant) as [type, data]}
    <div class="tile" class:active={currentType !== null && currentType == type}
      on:click={() => onSelect(type)}
    >
      <ShamanObjectImage {data} />
    </div>
  {/each}

</div>