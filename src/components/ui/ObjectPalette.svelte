
<script>

  import Icon from "fa-svelte"
  import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp"
  import { faSquare } from "@fortawesome/free-solid-svg-icons/faSquare"
  import { faEye } from "@fortawesome/free-solid-svg-icons/faEye"
  import { faEyeSlash } from "@fortawesome/free-solid-svg-icons/faEyeSlash"

  import { fly } from "svelte/transition"

  import { 
    selection, creation, groundTypePicker, visibility,
    settings, platforms, decorations, shamanObjects,
  } from "/stores/stores.js"

  import shamanObjectMetadata from "/shamanObjectMetadata.js"
  import { groundTypes } from "/xml-utils.js"

  import Tooltip from "/components/common/Tooltip.svelte"
  import ObjectPaletteMenu from "/components/ui/ObjectPaletteMenu.svelte"

  let isThin = false

  let collapsed = {
    grounds: false,
    basic: false,
    decorations: false,
    objects: false,
  }

  $: tryCancelCreation(collapsed)

  function tryCancelCreation() {
    if(!$creation) return

    if(collapsed.grounds && $creation.objectType === "platform")
      $creation = null
    else if(collapsed.objects && $creation.objectType === "shamanObject")
      $creation = null
    else if($creation.objectType === "decoration") {
      let isCreationBasic = ["T","F","DS","DC","DC2"].includes($creation.type)
      if(collapsed.basic && isCreationBasic)
        $creation = null
      else if(collapsed.decorations && !isCreationBasic)
        $creation = null
    }
  }

  $: if($groundTypePicker === true) {
    collapsed.grounds = false
  }



  function onTileClick(objectType, type) {
    if($groundTypePicker) {
      groundTypePicker.pick(type)
    }
    else if($creation && $creation.objectType === objectType && $creation.type == type) {
      $creation = null
    }
    else {
      creation.setFromType(objectType, type)
    }
  }

  $: dsDisabled = 
    $settings._miceSpawn.type === "normal" ? 
      $decorations.filter(({name}) => name === "DS").length > 0 
    :
    $settings._miceSpawn.type === "multiple" ? 
      true
    :
    $settings._miceSpawn.type === "random" ? 
      true
    : 
    false

  $: dcCount = $decorations.filter(({name}) => name === "DC").length
  $: dc2Count = $decorations.filter(({name}) => name === "DC2").length

  $: objectMaxCount = $settings._defilanteEnabled ? 200 : 30

</script>

<div class="panel relative w-64 p-2 xl:p-4 bg-gray-700 shadow-lg text-white z-10 flex-shrink-0 flex flex-col"
    class:thin={isThin}
> 

  <ObjectPaletteMenu which="basic" title="Basic" bind:collapsed={collapsed.basic} max="40" count={$decorations.length}>
    <div class="flex flex-wrap justify-center py-1">
      {#each ["F", "T"] as type}
        <div class="tile" class:active={$creation && $creation.objectType === "decoration" && $creation.type == type}
          on:click={() => onTileClick("decoration", type)}
        >
          <img class="dim-max-40" src={`dist/decorations/${type}.png`} alt={type}/>
        </div>
      {/each}

      <div class="tile" class:active={$creation && $creation.objectType === "decoration" && $creation.type == "DS"}
        class:disabled={dsDisabled}
        on:click={() => onTileClick("decoration", "DS")}
      >
        <img class="dim-max-40" src="dist/decorations/DS.png" alt="DS"/>
      </div>

      <div class="tile" class:active={$creation && $creation.objectType === "decoration" && $creation.type == "DC"}
        class:disabled={dcCount > 0}
        on:click={() => onTileClick("decoration", "DC")}
      >
        <img class="dim-max-40" src="dist/decorations/DC.png" alt="DC"/>
      </div>

      <div class="tile" class:active={$creation && $creation.objectType === "decoration" && $creation.type == "DC2"}
        class:disabled={dcCount < 1 || dc2Count > 0}
        on:click={() => onTileClick("decoration", "DC2")}
      >
        <img class="dim-max-40" src="dist/decorations/DC2.png" alt="DC2"/>
      </div>
    </div>
  </ObjectPaletteMenu>

  <ObjectPaletteMenu which="grounds" title="Grounds" bind:collapsed={collapsed.grounds} 
    active={$groundTypePicker} max="50" count={$platforms.length}
  >
    <div class="flex flex-wrap justify-center content-center">
    
      {#each groundTypes as ground, type}
        <div class="tile dim-40" class:active={$creation && $creation.objectType === "platform" && $creation.type == type}
          
          on:click={() => onTileClick("platform", type)}
        >
          <img class="rounded-sm" src="dist/grounds/{ground}.png" alt={ground}/>
        </div>
      {/each}
    </div>
  </ObjectPaletteMenu>

  <ObjectPaletteMenu which="decorations" title="Decorations" bind:collapsed={collapsed.decorations} grow max="40" count={$decorations.length}>
    <div class="scrollbox-container">
      <div class="flex flex-wrap justify-center scrollbox">
        {#each Array(133) as _, type}
          <div class="tile dim-40" class:active={$creation && $creation.objectType === "decoration" && $creation.type == type}
            on:click={() => onTileClick("decoration", type)}
          >
            <img class="dim-max-40" src={`dist/decorations/${type}.png`} alt={type}/>
          </div>
        {/each}
      </div>
    </div>
  </ObjectPaletteMenu>


  <ObjectPaletteMenu which="objects" title="Objects" bind:collapsed={collapsed.objects} grow max={objectMaxCount} count={$shamanObjects.length}>
    <div class="scrollbox-container">
      <div class="flex flex-wrap justify-center scrollbox">

        {#if $settings._defilanteEnabled}
        <div class="w-full flex flex-wrap justify-center">
          {#each Object.entries(shamanObjectMetadata).filter(([_,data]) => data.defilanteVariant) as [type, data]}
          <div class="tile" class:active={$creation && $creation.objectType === "shamanObject" && $creation.type == type}
            on:click={() => onTileClick("shamanObject", type)}
          >
            <img src="dist/shamanObjects/{data.defilanteVariant.sprite}" alt={data.defilanteVariant.sprite}/>
          </div>
          {/each}
        </div>
        {/if}

        {#each Object.entries(shamanObjectMetadata).filter(([_,data]) => !data.isVariant) as [type, data]}
        <div class="tile" class:active={$creation && $creation.objectType === "shamanObject" && $creation.type == type}
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
  </ObjectPaletteMenu>

  {#if !collapsed.objects && $creation && $creation.objectType === "shamanObject" && shamanObjectMetadata[$creation.type].variants}
  <!-- <div  class="flex flex-grow"> -->
    <ObjectPaletteMenu title="Variants" noActions grow>
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
    </ObjectPaletteMenu>
  <!-- </div> -->
  {/if}

  <div class="thinButton"
    on:click={() => isThin = !isThin}
  >
    <div class="chevron" class:flipped={isThin}>
      <div>
        <Icon icon={faChevronUp} />
      </div>
    </div>
  </div>


</div>

<style lang="text/postcss">
  img {
    pointer-events: none;
  }

  .panel {
    
  }
  .thin {
    width: 8rem !important;
    padding: 0.5rem !important;
  }
  
  .scrollbox-container {
    @apply flex-grow overflow-hidden relative;
  }
  .scrollbox {
    @apply overflow-auto absolute top-0 bottom-0 left-0 right-0 py-1;
  }

  .object-variants {
    @apply absolute bg-gray-700 p-4 shadow-md;
    max-height: 100%;
    bottom: 0;
    right: 0;
    transform: translateX(100%);
  }

  .dim-40 {
    width: 40px;
    height: 40px;
  }
  .dim-max-40 {
    max-width: 40px;
    max-height: 40px;
  }
  .tile {
    @apply m-1 cursor-pointer flex justify-center items-center;
    transition: filter 40ms;
  }
  .tile.active {
    outline-width: 4px;
    outline-offset: -4px;
    outline-style: dashed;
    outline-color: rgba(255,255,255,1);
  }
  .tile:hover {
    filter: brightness(1.15) drop-shadow(0 3px 5px rgba(0,0,0,.2));
    /* transform: translateY(-2px) scale(1.5); */
  }
  .tile.disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .thinButton {
    @apply absolute right-0;
    top: 50%;
    bottom: 50%;
    z-index: -1;
    opacity: 0;
    transition: 80ms;
    pointer-events: none;
  }
  .panel:hover .thinButton {
    opacity: 1;
    transform: translate(50%);
    pointer-events: all;
    cursor: pointer;
  }
  .chevron {
    @apply rounded-full pl-8 pr-2 py-4 bg-gray-700;
    margin-left: -0.75rem;
  }
  .chevron > * {
    transition: transform 80ms;
    transform-origin: center;
    transform: rotate(-90deg);
  }
  .chevron.flipped > * {
    transform: rotate(-90deg) rotateX(180deg);
  }
</style>