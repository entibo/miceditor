
<script>
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import shamanObjectMetadata from "metadata/shamanObject/index"

  $: variants = $creation.enabled && $creation.creationType === "SHAMANOBJECT" && shamanObjectMetadata[$creation.type].variants
        ? shamanObjectMetadata[$creation.type].variants
        : []

</script>


<div class="flex flex-wrap justify-center">

  {#each variants.map(type => [type, shamanObjectMetadata[type]]) as [type, data]}
    <div class="tile" class:active={$creation.enabled && $creation.creationType === "SHAMANOBJECT" && $creation.type == type}
      on:click={() => Creation.setShamanObject(type)}
    >
      {#if data.sprite}
        <img src="dist/shamanObjects/{data.sprite}" alt={data.sprite}/>
      {:else}
        <img src="dist/shamanObjects/{data.spritesheet}"
          style=" object-fit: none;
                  object-position:  {-data.offset.x-(data.width-data.boundingWidth)/2 + (data.spritesheet.includes('anvils') ? 10 : 0)}px 
                                    {-data.offset.y-(data.height-data.boundingHeight)/2}px;
                  width: {data.boundingWidth + (data.spritesheet.includes('anvils') ? 20 : 0)}px; 
                  height: {data.boundingHeight}px;"
        />
      {/if}
    </div>
  {/each}

</div>