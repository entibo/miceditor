
<script>
  import { readable } from "svelte/store"

  import * as Editor from "data/editor/index"
  import shamanObjectMetadata from "metadata/shamanObject/index"

  import { parkourMode, snatchMode } from "state/mapExtra"
  import { mapSettings } from "state/map"
  import { shamanObjects } from "state/sceneObjects"
  import { Anchor } from "data/base/ShamanObject"

  import Decoration from "./Decoration.svelte"

  export let obj

  $: rotation = $obj.rotation || 0

  $: metadata = getMetadata($obj, $mapSettings)
  function getMetadata(shamanObject, mapSettings) {
    let metadata = shamanObjectMetadata.get(shamanObject.type)
    return mapSettings.defilante.enabled && metadata.defilanteVariant
      ? metadata.defilanteVariant
      : metadata
  }


  $: parkourCheckpointIndex = $parkourMode && 
        $shamanObjects.all.filter(o => o.type === Anchor.Yellow).indexOf($obj) + 2

  $: parkourSize = $parkourMode && 
        ($obj.size ||
         $shamanObjects.all.filter(o => o.type === Anchor.Yellow)
                       .reduce((r, o, i) => i < (parkourCheckpointIndex - 2) ? (o.size || r) : r, null) ||
         1)

  $: parkourMouseSpawn = $parkourMode && 
      readable(Editor.Decoration.make(Editor.Decoration.defaults("DS")))

  $: snatchCheese = $snatchMode && 
      readable(Editor.Decoration.make(Editor.Decoration.defaults("F")))

  $: snatchHole = $snatchMode && 
      readable(Editor.Decoration.make(Editor.Decoration.defaults("T")))

</script>


<g transform="translate({$obj.x}, {$obj.y}) 
              rotate({rotation})"
>

  {#if $parkourMode && $obj.type == Anchor.Yellow}
    <g class="pointer-events-none" transform="rotate({-rotation})">
      <Decoration obj={parkourMouseSpawn} {parkourCheckpointIndex} {parkourSize}/>
    </g>
  {/if}

  {#if $snatchMode && $obj.type == Anchor.Yellow}
    <g class="pointer-events-none" transform="rotate({-rotation})">
      <Decoration obj={snatchCheese}/>
    </g>
  {/if}

  {#if $snatchMode && ($obj.type == Anchor.RedClockwise || $obj.type == Anchor.Green)}
    <g class="pointer-events-none" transform="rotate({-rotation})">
      <Decoration obj={snatchHole}/>
    </g>
  {/if}

  <g filter={$obj.invisible ? 'url("#erode")' : ''}
     class:opacity-50={$obj.ghost}
  >

    {#if metadata.spritesheet}

      <foreignObject 
        x={-metadata.width/2} y={-metadata.height/2}
        width={metadata.width} height={metadata.height}
        class="pointer-events-none" 
      >
        <div style="background-image: url(dist/shamanObjects/{metadata.spritesheet}); 
                    background-position: {-metadata.offset.x}px {-metadata.offset.y}px;
                    background-repeat: no-repeat;"
          class="w-full h-full"
        ></div>
      </foreignObject>

    {:else}

      <image 
        x={-metadata.width/2} y={-metadata.height/2}
        width={metadata.width} height={metadata.height}
        href="dist/shamanObjects/{metadata.sprite}"
        on:mousedown|preventDefault
        class="pointer-events-none" 
      />

    {/if}

  </g>

  {#if metadata.circle}
    <circle
      r={metadata.boundingWidth/2}
      fill="transparent"
      class="object-outline-stroke cursor-pointer"
    />
  {:else}
    <rect 
      x={-metadata.boundingWidth/2} y={-metadata.boundingHeight/2}
      width={metadata.boundingWidth} height={metadata.boundingHeight}
      fill="transparent"
      class="object-outline cursor-pointer"
    />
  {/if}

</g>
