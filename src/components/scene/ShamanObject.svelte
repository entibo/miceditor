
<script>
  import shamanObjectMetadata from "/metadata/shamanObject/index"
  import { parkour } from "/state/user"
  import { mapSettings } from "/state/map"
  import { shamanObjects } from "/state/sceneObjects"

  export let obj

  $: active = $obj.selected

  $: metadata = getMetadata($obj, $mapSettings)
  function getMetadata(shamanObject, mapSettings) {
    let spriteData = shamanObjectMetadata[shamanObject.type]
    if(!spriteData) return
    return mapSettings.defilante.enabled && spriteData.defilanteVariant
      ? spriteData.defilanteVariant
      : spriteData
  }

  $: parkourCheckpointIndex = 
        $shamanObjects.all.filter(o => o.type === 22).indexOf($obj) + 1

</script>


<g on:mousedown
  class="platform" class:active={active} 
  transform="translate({$obj.x}, {$obj.y}) 
             rotate({$obj.rotation || 0})"
>

  {#if metadata && metadata.spritesheet}

  <foreignObject class="pointer-events-none" class:opacity50={$obj.ghost}
    x={-metadata.width/2} y={-metadata.height/2}
    width={metadata.width} height={metadata.height}
  >
    <div style="background-image: url(dist/shamanObjects/{metadata.spritesheet}); 
                background-position: {-metadata.offset.x}px {-metadata.offset.y}px;
                background-repeat: no-repeat;"
      class="w-full h-full"
    ></div>
  </foreignObject>

  <rect fill="transparent" class="selectable" 
    x={-metadata.boundingWidth/2} y={-metadata.boundingHeight/2}
    width={metadata.boundingWidth} height={metadata.boundingHeight}
  />

  {:else if metadata && metadata.sprite}

  <image class="selectable" class:opacity50={$obj.ghost}
    x={-metadata.width/2} y={-metadata.height/2}
    width={metadata.width} height={metadata.height}
    href="dist/shamanObjects/{metadata.sprite}"
    on:mousedown|preventDefault
  />

  {:else}

  <rect class="selectable" class:opacity50={$obj.ghost}
    x={-20} y={-20}
    width={40} height={40}
    fill="red"
  />

  {/if}

  {#if $parkour && $obj.type === 22}
  <text class="pointer-events-none" y="-8">{parkourCheckpointIndex}</text>
  {/if}

</g>


<style lang="text/postcss">
  .opacity50 {
    opacity: 0.5;
  }

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