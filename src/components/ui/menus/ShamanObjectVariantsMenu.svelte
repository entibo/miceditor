
<script>
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import shamanObjectMetadata from "metadata/shamanObject/index"

  import ShamanObjectImage from "components/ui/ShamanObjectImage.svelte"

  $: variants = $creation.enabled && $creation.creationType === "SHAMANOBJECT" && shamanObjectMetadata[$creation.type].variants
        ? shamanObjectMetadata[$creation.type].variants
        : []

</script>


<div class="flex flex-wrap justify-center">

  {#each variants.map(type => [type, shamanObjectMetadata[type]]) as [type, data]}
    <div class="tile" class:active={$creation.enabled && $creation.creationType === "SHAMANOBJECT" && $creation.type == type}
      on:click={() => Creation.setShamanObject(type)}
    >
      <ShamanObjectImage {data} />
    </div>
  {/each}

</div>