<script>

  import { onMount, tick } from "svelte"
  import { fade } from "svelte/transition"

  import { randInt } from "/util"

  import SceneObject from "/components/scene/SceneObject.svelte"
  import Platform from "/components/scene/Platform.svelte"
  import Decoration from "/components/scene/Decoration.svelte"
  import ShamanObject from "/components/scene/ShamanObject.svelte"
  import Joint from "/components/scene/Joint.svelte"
  import Footer from "/components/scene/Footer.svelte"
  import Image from "/components/scene/Image.svelte"

  import SvgImage from "/components/common/SvgImage.svelte"


  import { mapSettings } from "/state/map"
  import { platforms, decorations, shamanObjects, joints, images } from "/state/sceneObjects"

  import creation from "/state/creation"
  import { 
    grid,
    showGameGUI,
    showMapBorder,
    showInvisibleGrounds,
    zoom,
  } from "/state/user"

  import * as interaction from "./interaction"
  import { pan, selectionBox, currentGamePosition, isKeyDown } from "./interaction"


  let svgContainerEl = null, svgWidth = 1, svgHeight = 1
  $: interaction.svgContainer.set({
    el: svgContainerEl,
    width: svgWidth,
    height: svgHeight,
  })


  onMount(async () => {
    await tick()
    interaction.resetPan()
  })

  $: playerView = getPlayerView($mapSettings, $zoom, $pan, svgWidth, svgHeight)
  function getPlayerView() {
    let {x,y} = interaction.sceneToGameCoordinates({ x: svgWidth/2, y: svgHeight/2 })
    return { 
      x: Math.max(0, Math.min($mapSettings.width-800, x-400)),
      y: Math.max(0, Math.min($mapSettings.height-400, y-200)),
    }
  }

</script>

<svelte:window 
  on:keydown={interaction.windowKeyDown}
  on:keyup={interaction.windowKeyUp} 
  on:mousemove={interaction.windowMouseMove}
  on:mouseup={interaction.windowMouseUp}
  on:mouseleave={interaction.windowMouseLeave}
/>

<div class="flex-grow bg-tfm-blue outline-none" 
  bind:this={svgContainerEl}
  bind:clientWidth={svgWidth} bind:clientHeight={svgHeight}
  on:wheel={interaction.wheel}
  on:mousedown={interaction.backgroundMouseDown}  
  on:blur={interaction.windowMouseLeave}
  on:keydown={interaction.keyDown} tabindex="-1"
>
  <svg class="w-full h-full" >
  
    <defs>
      <pattern id="grid" patternUnits="userSpaceOnUse"
          width={$grid.width*$zoom} height={$grid.height*$zoom} x={$pan.x} y={$pan.y}
      >
        <path d={`M ${$grid.width*$zoom} 0 L 0 0 0 ${$grid.height*$zoom}`} 
          fill="none" stroke={"#"+$grid.color} stroke-width="1"
        />
      </pattern>
    </defs>
    {#if $grid.enabled}
    <rect width="100%" height="100%" fill="url(#grid)" />
    {/if}


    <g transform="translate({$pan.x}, {$pan.y}) scale({$zoom})">

      {#each $images.background as obj}
      <SceneObject {obj}> <Image {obj}/> </SceneObject>
      {/each}


      {#if $mapSettings.backgroundImageId != -1}
      <image x="0" y="0" 
            width={$mapSettings.width} height={$mapSettings.height}
            href="dist/backgrounds/{
              $mapSettings.backgroundImageId == -2 ?
                [0,1,2,3,7,8][randInt(0,5)] :
                $mapSettings.backgroundImageId
            }.svg"
            on:mousedown|preventDefault
      />
      {/if}

      {#if $showMapBorder}
      <rect x="0" y="0" 
            width={$mapSettings.width} height={$mapSettings.height}
            class="mapBorder"
      />
      {/if}


      {#each $decorations.background as obj}
      <SceneObject {obj}> <Decoration {obj}/> </SceneObject>
      {/each}

      {#each $joints.background as obj}
      <SceneObject {obj}> <Joint {obj}/> </SceneObject>
      {/each}

      {#each $platforms.background as obj}
      <SceneObject {obj}> <Platform {obj}/> </SceneObject>
      {/each}

      {#each $shamanObjects.background as obj}
      <SceneObject {obj}> <ShamanObject {obj}/> </SceneObject>
      {/each}


      {#each $images.foreground as obj}
      <SceneObject {obj}> <Image {obj}/> </SceneObject>
      {/each}

      {#each $images.disappearing as obj}
      <SceneObject {obj}> <Image {obj}/> </SceneObject>
      {/each}


      {#each $decorations.foreground as obj}
      <SceneObject {obj}> <Decoration {obj}/> </SceneObject>
      {/each}

      {#each $joints.foreground as obj}
      <SceneObject {obj}> <Joint {obj}/> </SceneObject>
      {/each}

      {#each $platforms.foreground as obj}
      <SceneObject {obj}> <Platform {obj}/> </SceneObject>
      {/each}

      {#each $shamanObjects.foreground as obj}
      <SceneObject {obj}> <ShamanObject {obj}/> </SceneObject>
      {/each}


      {#each $decorations.spawns as obj}
      <SceneObject {obj}> <Decoration {obj}/> </SceneObject>
      {/each}


      {#if $showGameGUI}
      <g class="playerView" transform="translate({playerView.x}, {playerView.y})">
        <rect width="800" height="20" />
        <rect y="400" width="800" height="200" />
      </g>
      {/if}

      {#if $selectionBox.box}
      <g>
        <rect
          class="selectionBox"
          x={$selectionBox.box.p1.x} y={$selectionBox.box.p1.y}
          width= {$selectionBox.box.p2.x - $selectionBox.box.p1.x} 
          height={$selectionBox.box.p2.y - $selectionBox.box.p1.y} />
      </g>
      {/if}

      {#if $creation}
      <g class="" transform={`translate(${$currentGamePosition.x}, ${$currentGamePosition.y})`}>
        {#if $creation.objectType === "platform"}
          <g transform="translate(10, 20) scale(0.5)">
            <Platform platform={$creation.object}/>
          </g>
        {:else if $creation.objectType === "decoration"}
          <Decoration decoration={$creation.object}/>
        {:else if $creation.objectType === "shamanObject"}
          <ShamanObject shamanObject={$creation.object}/>
        {:else if $creation.objectType === "joint"}
          <Joint joint={$creation.object}/>
        {/if}
      </g>
      {/if}

      {#if $isKeyDown.shift}
      <g class="pointer-events-none"
        stroke="black"
        transform={`translate(${$currentGamePosition.x}, ${$currentGamePosition.y})`}
      >
        <line x1="-20" y1="0" x2="20" y2="0"/>
        <line y1="-20" x1="0" y2="20" x2="0"/>
      </g>
      {/if}

    </g>
  </svg>

  {#if $creation.active }
  <div class="absolute top-0 right-0 bottom-0 left-0 w-full h-full"></div>
  {/if}

  <Footer position={$currentGamePosition} selectionBox={$selectionBox} />

</div>

<style lang="text/postcss">

  .mapBorder {
    fill: none;
    outline: 4px dashed rgba(0, 0, 0, 0.2);
  }

  .playerView rect {
    fill: rgba(0, 0, 0, 0.2);
  }

  .playerView {
    pointer-events: none;
    width: 800px;
    height: 600px;
    fill: none;
    outline: 4px solid rgba(0, 0, 0, 0.2);
  }

  .selectionBox {
    fill: none;
    stroke: none;
    outline-offset: -4px;
    outline: 4px dashed rgba(255,255,255,0.95);
  }
</style>