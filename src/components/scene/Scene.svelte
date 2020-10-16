<script>

  import { onMount, tick } from "svelte"
  import { fade } from "svelte/transition"

  import { randInt } from "common"

  import SceneObject from "components/scene/SceneObject.svelte"
  import Platform from "components/scene/Platform.svelte"
  import Decoration from "components/scene/Decoration.svelte"
  import ShamanObject from "components/scene/ShamanObject.svelte"
  import Image from "components/scene/Image.svelte"
  import Joint from "components/scene/Joint.svelte"
  import Footer from "components/scene/Footer.svelte"
  import CreationPreview from "components/scene/CreationPreview.svelte"
  import SvgImage from "components/common/SvgImage.svelte"
  import Window from "components/ui/Window.svelte"


  import { mapSettings } from "state/map"
  import { platforms, decorations, shamanObjects, joints, images } from "state/sceneObjects"

  import { creation } from "state/creation"
  import { 
    grid,
    showGameGUI,
    showMapBorder,
    showInvisibleGrounds,
    zoom,
  } from "state/user"

  import * as interaction from "state/interaction"
  import { pan, selectionBox, currentGamePosition, isKeyDown } from "state/interaction"

  import * as layout from "state/layout"
  import { layoutConfig, tabMovement } from "state/layout"


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

  $: windowsWithIndex = 
        $layoutConfig.windows
          .map((w,idx) => [w,idx])
          .sort(([a,_],[b,__]) => a.tab < b.tab ? -1 : 1)

</script>

<svelte:window 
  on:blur={interaction.windowBlur}
  on:keydown={interaction.windowKeyDown}
  on:keyup={interaction.windowKeyUp} 
  on:mousemove={interaction.windowMouseMove}
  on:mouseup={interaction.windowMouseUp}
  on:mouseleave={interaction.windowMouseLeave}
/>

<div class="scene-container w-full h-full bg-tfm-blue outline-none flex" 
  class:target-inner={$tabMovement.active && $tabMovement.target.type === "window"}
  bind:this={svgContainerEl}
  bind:clientWidth={svgWidth} bind:clientHeight={svgHeight}
  on:wheel={interaction.wheel}
  on:mousedown={interaction.backgroundMouseDown}  
  on:mousemove={interaction.backgroundMouseMove}
  on:contextmenu={interaction.backgroundContextMenu}
  tabindex="-1"
>
  <svg class="flex-grow" >
  
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

    <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow stdDeviation="4 5" in="SourceGraphic" dx="0" dy="5" flood-color="#0d161c" flood-opacity="0.7" x="0%" y="0%" width="100%" height="100%" result="dropShadow"/>
    </filter>
    <filter id="erode" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feMorphology operator="erode" radius="2 2" in="SourceGraphic" result="morphology"/>
      <feComposite in="SourceGraphic" in2="morphology" operator="out" result="composite1"/>
    </filter>


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
            class="pointer-events-none"
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

      {#each $joints.hidden as obj}
      <SceneObject {obj}> <Joint {obj}/> </SceneObject>
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
      
      {#if $showMapBorder}
      <rect x="0" y="0" 
            width={$mapSettings.width} height={$mapSettings.height}
            class="mapBorder"
      />
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
      
      {#if $creation.enabled}
        <CreationPreview x={$currentGamePosition.x} y={$currentGamePosition.y} />
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

  {#if $creation.enabled && $creation.creationType !== "MECHANIC" }
  <div class="absolute top-0 right-0 bottom-0 left-0 w-full h-full"></div>
  {/if}

  {#each windowsWithIndex as [window,idx], _ (window.tab)}
  <Window window={window} z={idx} />
  {/each}

  <Footer position={$currentGamePosition} selectionBox={$selectionBox} />

</div>

<style lang="text/postcss">

  .mapBorder {
    fill: none;
    outline: 1px solid #00c4ffab;
  }

  .playerView rect {
    fill: rgba(0, 0, 0, 0.2);
  }

  .playerView {
    pointer-events: none;
    width: 800px;
    height: 600px;
    fill: none;
    outline: 1px solid rgba(0, 0, 0, 0.2);
  }

  .selectionBox {
    fill: none;
    stroke: none;
    outline-offset: -1px;
    outline: 2px dashed rgba(255,255,255,0.95);
  }
</style>