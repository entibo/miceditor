
<script>

  import { parkour, shamanObjects, settings } from "/stores/stores.js"

  export let shamanObject
  export let active

  $: spriteData = getSpriteData(shamanObject, $settings)
  function getSpriteData() {
    if(!shamanObject._spriteData) return
    if($settings._defilanteEnabled && shamanObject._spriteData.defilanteVariant) {
      return shamanObject._spriteData.defilanteVariant
    }
    return shamanObject._spriteData
  }

  function getParkourCheckpointIndex() {
    return $shamanObjects.filter(o => o._type == "22").indexOf(shamanObject) + 1
  }

</script>


<g on:mousedown
  class="platform" class:active={active} 
  transform="translate({shamanObject._x}, {shamanObject._y}) 
             rotate({shamanObject._rotation || 0})"
>

  {#if spriteData && spriteData.spritesheet}

  <foreignObject class="pointer-events-none" class:opacity-50={shamanObject._ghost}
    x={-spriteData.width/2} y={-spriteData.height/2}
    width={spriteData.width} height={spriteData.height}
  >
    <div style="background-image: url(dist/shamanObjects/{spriteData.spritesheet}); 
                background-position: {-spriteData.offset.x}px {-spriteData.offset.y}px;
                background-repeat: no-repeat;"
      class="w-full h-full"
    ></div>
  </foreignObject>

  <rect fill="transparent" class="selectable" 
    x={-spriteData.boundingWidth/2} y={-spriteData.boundingHeight/2}
    width={spriteData.boundingWidth} height={spriteData.boundingHeight}
  />

  {:else if spriteData && spriteData.sprite}

  <image class="selectable" class:opacity-50={shamanObject._ghost}
    x={-spriteData.width/2} y={-spriteData.height/2}
    width={spriteData.width} height={spriteData.height}
    href="dist/shamanObjects/{spriteData.sprite}"
    on:mousedown|preventDefault
  />

  {:else}

  <rect class="selectable" class:opacity-50={shamanObject._ghost}
    x={-20} y={-20}
    width={40} height={40}
    fill="red"
  />

  {/if}

  {#if $parkour && shamanObject._type == "22"}
  <text class="pointer-events-none" y="-8">{getParkourCheckpointIndex()}</text>
  {/if}

</g>


<style lang="text/postcss">

  .selectable {
    transition: fill 100ms, outline-color 50ms;
    outline-width: 4px;
    outline-offset: -4px;
    outline-style: dashed;
    outline-color: rgba(255,255,255,0.0);
  }
  .selectable:hover {
    cursor: pointer;
    outline-color: rgba(255,255,255,0.5);
  }
  .active .selectable {
    outline-color: rgba(255,255,255,0.95);
  }

  text {
    fill: black;
    font: 14px sans-serif;
    text-anchor: middle;
  }
  
</style>