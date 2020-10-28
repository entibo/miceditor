
<script>
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import shamanObjectMetadata from "metadata/shamanObject/index"

  import ShamanObjectImage from "components/ui/ShamanObjectImage.svelte"

  export let typeProp = null

  $: currentType = typeProp !== null ? typeProp : $creation.enabled && $creation.creationType === "SHAMANOBJECT" ? $creation.type : null

  $: variants = currentType !== null && shamanObjectMetadata.get(currentType).variants
        ? shamanObjectMetadata.get(currentType).variants
        : []

  export let onSelect = type => Creation.setShamanObject(type)

</script>


<div class="flex flex-wrap justify-center">

  {#each variants.map(type => [type, shamanObjectMetadata.get(type)]) as [type, data]}
    <div class="tile" class:active={currentType == type}
      on:click={() => onSelect(type)}
    >
      <ShamanObjectImage {data} />
    </div>
  {/each}

</div>