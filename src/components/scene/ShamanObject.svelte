
<script>
  import { readable } from "svelte/store"

  import * as Editor from "/data/editor/index"
  import shamanObjectMetadata from "/metadata/shamanObject/index"

  import { parkourMode } from "/state/mapExtra"
  import { mapSettings } from "/state/map"
  import { shamanObjects } from "/state/sceneObjects"

  import Decoration from "./Decoration.svelte"

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


  $: parkourCheckpointIndex = $parkourMode && 
        $shamanObjects.all.filter(o => o.type === 22).indexOf($obj) + 1

  $: parkourMouseSpawn = $parkourMode && 
      readable(Editor.Decoration.make(Editor.Decoration.defaults("DS")))

</script>


<g on:mousedown
   class:active={active} 
   transform="translate({$obj.x}, {$obj.y}) 
              rotate({$obj.rotation || 0})"
>

  {#if $parkourMode && $obj.type === 22}
    <g class="pointer-events-none">
      <Decoration obj={parkourMouseSpawn} />
      <text y="-32">{parkourCheckpointIndex}</text>
    </g>
  {/if}

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

</g>


<style lang="text/postcss">
  .opacity50 {
    opacity: 0.5;
  }

  .selectable {
    transition: fill 100ms, outline-color 50ms;
    outline-width: 2px;
    outline-offset: -1px;
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