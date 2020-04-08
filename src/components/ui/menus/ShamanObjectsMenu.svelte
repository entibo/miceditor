
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
      {#each Object.entries(shamanObjectMetadata).filter(([_,data]) => data.defilanteVariant) as [type, data]}
        <div class="tile" class:active={$creation.enabled && $creation.creationType === "SHAMANOBJECT" && $creation.type == type}
          on:click={() => Creation.setShamanObject(type)}
        >
          <img src="dist/shamanObjects/{data.defilanteVariant.sprite}" alt={data.defilanteVariant.sprite}/>
        </div>
      {/each}
    </div>
  {/if}

  {#each Object.entries(shamanObjectMetadata).filter(([_,data]) => !data.isVariant) as [type, data]}
    <div class="tile" class:active={$creation.enabled && $creation.creationType === "SHAMANOBJECT" && $creation.type == type}
      on:click={() => Creation.setShamanObject(type)}
    >
      <ShamanObjectImage {data} />
    </div>
  {/each}

</div>

<!-- {#if !collapsed.shamanObjects && $creation && $creation.objectType === "shamanObject" && shamanObjectMetadata[$creation.type].variants}

    <div transition:fly={{duration:100, y: 50}} class="scrollbox-container">
      <div class="block text-center scrollbox">

        {#each shamanObjectMetadata[$creation.type].variants.map(type => [type, shamanObjectMetadata[type]]) as [type, data]}
        <div class="tile" class:active={$creation && $creation.objectType === "shamanObject" && $creation.type == type}
          style="display: inline-block"
          on:click={() => onTileClick("shamanObject", type)}
        >
          {#if data.sprite}
          <img src="dist/shamanObjects/{data.sprite}" alt={data.sprite}/>
          {:else}
          <img src="dist/shamanObjects/{data.spritesheet}" alt={data.sprite}
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
    </div>
{/if} -->