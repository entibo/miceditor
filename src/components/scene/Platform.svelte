
<script>

  import * as Platform from "data/editor/Platform"
  import { showInvisibleGrounds } from "state/user"
  import { platformResizeKnobMouseDown,
           platformBoosterVectorMouseDown,
           platformBoosterVectorMinLength, 
           platformBoosterVectorSpeedLengthRatio, 
         } from "state/interaction"

  import SvgImage from "components/common/SvgImage.svelte"

  export let obj

  $: selected = $obj.selected

  $: typeName = Platform.typeNames[$obj.type]

  $: isCircle = typeName === "circle"

  $: x = $obj.x
  $: y = $obj.y

  $: width  = isCircle ? $obj.radius*2 : $obj.width
  $: height = isCircle ? $obj.radius*2 : $obj.height

  $: rotation = $obj.rotation || 0

  // Resize points dimensions
  $: rs = 6
  $: rw = rs/2 + width/2
  $: rh = rs/2 + height/2
  //

  $: opacityLevel = Platform.isInvisible($obj)
      ? $showInvisibleGrounds 
          ? "half" 
          : "zero"
      : "full"

  let boosterVector 
  $: if($obj.booster && $obj.booster.enabled) {
    let angle = $obj.booster.angle
    let rad = angle * Math.PI / 180
    let length = platformBoosterVectorMinLength 
               + $obj.booster.speed * platformBoosterVectorSpeedLengthRatio
    boosterVector = {
      angle,
      x: length * Math.cos(rad),
      y: length * Math.sin(rad),
    }
  }
  else boosterVector = null

</script>

<g transform="translate({x}, {y}) 
              rotate({rotation})"
>

  <g class="cursor-pointer">

    {#if $obj.image.enabled}

      <SvgImage class="pointer-events-none"
        x={-width/2  + $obj.image.x} 
        y={-height/2 + $obj.image.y}
        href={$obj.image.imageUrl.url}
      />
      <rect
        x={-width/2} y={-height/2}
        width={width} height={height}
        fill="transparent"
      />

    {:else}

      <g class={opacityLevel === "full" ? "opacity-100" : opacityLevel === "half" ? "opacity-50" : "opacity-0"} >

        {#if typeName === "circle"}
          <circle
            r={$obj.radius}
            fill="#{$obj.color}"
            class="object-outline-stroke"
          />
        {:else if typeName === "rectangle"}
          <rect
            x={-width/2} y={-height/2}
            width={width} height={height}
            fill="#{$obj.color}"
            class="object-outline"
          />
        {:else if ["wood", "ice", "trampoline", "chocolate", "cloud"].includes(typeName)}
          <image 
            x={-width/2} y={-height/2}
            width={width} height={height} 
            preserveAspectRatio="none" 
            href="dist/grounds/{ typeName }.png"
            on:mousedown|preventDefault
            class="object-outline"
          />
        {:else if typeName === "invisible"}
          <rect
            x={-width/2} y={-height/2}
            width={width} height={height}
            fill="white"
            class="object-outline"
          />
        {:else}
          <foreignObject
            x={-width/2} y={-height/2}
            width={width} height={height} 
            class="object-outline"
          >
            <div
              class="w-full h-full {typeName !== 'invisible' ? typeName : ''}"
              class:sides={width%40===0}
            >
            </div>
          </foreignObject>
        {/if}

      </g>

    {/if}

  </g>

  {#if selected}
    <g transform="translate({-rs/2}, {-rs/2})" 
       class="cursor-crosshair"
    >
      {#each 
      isCircle 
        ? [[+rw, 0], [-rw,0], [0,-rh], [0,+rh]] 
        : [
            [-rw,-rh], [0,-rh], [+rw,-rh], [+rw,0],
            [+rw,+rh], [0,+rh], [-rw,+rh], [-rw,0],
          ]
          .map(([x,y], k) => [x,y,k])
      as [x,y,k]}
        <rect fill="white" width={rs} height={rs} {x} {y}
          on:mousedown|stopPropagation|preventDefault={e => platformResizeKnobMouseDown(e, obj, k)}
        />
      {/each}
    </g>
  {/if}

  {#if selected && boosterVector}
    <g class="booster-vector cursor-pointer" 
       class:zero-speed={$obj.booster.speed <= 0.1}
       transform="rotate({-rotation})"
    >
      <line x1={0} x2={boosterVector.x}
            y1={0} y2={boosterVector.y}
      />
      <path class="arrowHead"
            transform="translate({boosterVector.x} {boosterVector.y})
                       rotate({boosterVector.angle})" 
            d="M 0 -5 L 10 0 L 0 5 z" 
            on:mousedown|stopPropagation|preventDefault={e => platformBoosterVectorMouseDown(e, obj)}
      />
    </g>
  {/if}

</g>



<style lang="text/postcss">

  .booster-vector {
    opacity: 0.9;
  }
  .booster-vector.zero-speed {
    opacity: 0.5;
  }
  .booster-vector line {
    stroke: yellow;
    stroke-width: 2;
    stroke-dasharray: 4;
    animation: dash-animation 2s linear infinite;
  }
  .booster-vector .arrowHead {
    /* fill: #0dff41; */
    /* stroke: white;
    stroke-width: 1; */
    fill: yellow;
  }
  @keyframes dash-animation {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: -8;
    }
  }




  .cobweb { background: url(grounds/cobweb.png); }

  .sand { background: url(grounds/sand.png); }

  .water { background: url(grounds/water-high.png); }

  .lava { background: url(grounds/lava-high.png); }

  .earth { background: url(grounds/earth-high.png); }
  

  .grass2 {
    background: 
      url(grounds/grass2-top.png) repeat-x, 
      url(grounds/earth-high.png);
  }
  .grass2.sides {
    background: 
      url(grounds/grass2-corner.png) no-repeat,
      url(grounds/grass2-corner-flipped.png) no-repeat right top,
      url(grounds/grass2-top.png) repeat-x, 
      url(grounds/earth-high.png);
  }
  .grass2.sides:before {
    content: "";
    /* z-index: -1; */
    @apply absolute w-full h-full top-0 right-0 bottom-0 left-0;
    top: 8px;
    background: 
      url(grounds/grass2-side.png) repeat-y,
      url(grounds/grass2-side-flipped.png) repeat-y right top;
  }

  .grass {
    background: 
      url(grounds/grass-top.png) repeat-x, 
      url(grounds/earth-high.png);
  }
  .grass.sides {
    background: 
      url(grounds/grass-corner.png) no-repeat,
      url(grounds/grass-corner-flipped.png) no-repeat right top,
      url(grounds/grass-top.png) repeat-x, 
      url(grounds/earth-high.png);
  }
  .grass.sides:before {
    content: "";
    /* z-index: -1; */
    @apply absolute w-full h-full top-0 right-0 bottom-0 left-0;
    top: 8px;
    background: 
      url(grounds/grass-side.png) repeat-y,
      url(grounds/grass-side-flipped.png) repeat-y right top;
  }

  .snow {
    background: 
      url(grounds/snow-top.png) repeat-x, 
      url(grounds/earth-high.png);
  }
  .snow.sides {
    background: 
      url(grounds/snow-top.png) repeat-x, 
      url(grounds/grass-side.png) repeat-y,
      url(grounds/grass-side-flipped.png) repeat-y right top,
      url(grounds/earth-high.png);
  }

  .stone {
    background: 
      url(grounds/stone-top.png) repeat-x, 
      url(grounds/stone-high.png);
  }
  .stone.sides {
    background: 
      url(grounds/stone-side.png) repeat-y, 
      url(grounds/stone-side.png) repeat-y right top, 
      url(grounds/stone-top.png) repeat-x, 
      url(grounds/stone-high.png);
  }

</style>