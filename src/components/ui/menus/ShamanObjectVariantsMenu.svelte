
<script>
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import shamanObjectMetadata from "metadata/shamanObject/index"

  import ShamanObjectImage from "components/ui/ShamanObjectImage.svelte"

  $: variants = $creation.enabled && $creation.creationType === "SHAMANOBJECT" && shamanObjectMetadata.get($creation.type).variants
        ? shamanObjectMetadata.get($creation.type).variants
        : []

</script>


<div class="flex flex-wrap justify-center">

  {#each variants.map(type => [type, shamanObjectMetadata.get(type)]) as [type, data]}
    <div class="tile" class:active={$creation.enabled && $creation.creationType === "SHAMANOBJECT" && $creation.type == type}
      on:click={() => Creation.setShamanObject(type)}
    >
      <ShamanObjectImage {data} />
    </div>
  {/each}

</div>