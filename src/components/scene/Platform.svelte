
<script context="module">

  import { get } from "svelte/store"
  import { rotate } from "/util"
  import { zoom } from "/state/user"

  let resizeInfo = null

  window.addEventListener("mousemove",  resizeMove)
  window.addEventListener("mouseup",    resizeStop)
  window.addEventListener("mouseleave", resizeStop)

  // 0 1 2
  // 7   3
  // 6 5 4
  function resizeMove(e) {
    if(!resizeInfo) return
    let {k, start, platform, platformStart} = resizeInfo

    let rotation = platform.rotation || 0

    let isCircle = platform.type === 13

    let scale = 1 / get(zoom)
    let dx = scale * (e.clientX - start.x)
    let dy = scale * (e.clientY - start.y)

    if(isCircle) {
      platform.radius = Math.max(10, platformStart.width/2 + dx)
    }
    else {
      let [rdx,rdy] = rotate(dx, dy, -rotation)
      if([1,5].includes(k)) rdx = 0
      if([3,7].includes(k)) rdy = 0

      let sign = { x: 1, y: 1 }
      if([4,5,6].includes(k)) sign.y = -1
      if([6,7,0].includes(k)) sign.x = -1

      let newWidth =  sign.x*(+rdx) + platformStart.width
      let newHeight = sign.y*(-rdy) + platformStart.height
      let extraWidth = newWidth < 10 ? 10 - newWidth : 0
      let extraHeight = newHeight < 10 ? 10 - newHeight : 0
      platform.width = Math.max(10, newWidth)
      platform.height = Math.max(10, newHeight)

      let [a,b] = rotate(rdx + sign.x*extraWidth, rdy - sign.y*extraHeight, rotation)
      platform.x = Math.round(platformStart.x + a/2)
      platform.y = Math.round(platformStart.y + b/2)
    }

    platform.invalidate()
  }

  function resizeStop() {
    resizeInfo = null
  }

</script>

<script>

  //import { encodePlatformData } from "/xml-utils.ts"
  import * as Platform from "/data/editor/Platform"
  import { showInvisibleGrounds } from "/state/user"
  import * as selection from "/state/selection"

  import SvgImage from "/components/common/SvgImage.svelte"

  export let obj
  $: active = $obj.selected

  const typeNames = [
    "wood", "ice", "trampoline", 
    "lava", "chocolate", 
    "earth", "grass",
    "sand", "cloud", "water",
    "stone", "snow", 
    "rectangle", "circle",
    "invisible", "cobweb",
    "wood", "grass2",
  ]
  $: typeName = typeNames[$obj.type]

  $: isCircle = typeName === "circle"

  $: width  = isCircle ? $obj.radius*2 : $obj.width
  $: height = isCircle ? $obj.radius*2 : $obj.height


  $: rs = 6
  $: rw = rs/2 + width/2
  $: rh = rs/2 + height/2

  function resizeStart(e, k) {
    resizeInfo = { 
      k,
      start: { x: e.clientX, y: e.clientY },
      platformStart: {
        x: $obj.x,
        y: $obj.y,
        width,
        height,
      },
      platform: $obj,
    }
  }

  $: invisibilityClass = Platform.isInvisible($obj)
      ? $showInvisibleGrounds 
          ? "half-opacity" 
          : "zero-opacity"
      : ""

</script>

<g 
  transform="translate({$obj.x}, {$obj.y}) 
             rotate({$obj.rotation || 0})"
>
  <g class="platform"
    on:mousedown on:mousemove on:mouseleave
  >

    {#if $obj.image.enabled}
    <SvgImage class="pointer-events-none"
      x={-width/2  + $obj.image.x} 
      y={-height/2 + $obj.image.y}
      href={$obj.image.imageUrl.url}
    />}
    <rect
      x={-width/2} y={-height/2}
      width={width} height={height}
      fill="transparent"
      class="selectable"
      class:active
    />
    {:else}

    <g class="selectable" class:active >
      <g class={invisibilityClass} >

        {#if typeName === "circle"}
          <circle
            r={$obj.radius}
            fill="#{$obj.color}"
          />
        {:else if typeName === "rectangle"}
          <rect
            x={-width/2} y={-height/2}
            width={width} height={height}
            fill="#{$obj.color}"
          />
        {:else if ["wood", "ice", "trampoline", "chocolate", "cloud"].includes(typeName)}
          <image 
            x={-width/2} y={-height/2}
            width={width} height={height} 
            preserveAspectRatio="none" 
            href="dist/grounds/{ typeName }.png"
            on:mousedown|preventDefault
          />
        {:else if typeName === "invisible"}
          <rect
            x={-width/2} y={-height/2}
            width={width} height={height}
            fill="white"
          />
        {:else}
          <foreignObject
            x={-width/2} y={-height/2}
            width={width} height={height} 
          >
            <div
              class="w-full h-full {typeName !== 'invisible' ? typeName : ''}"
              class:sides={width%40===0}
            >
            </div>
          </foreignObject>
        {/if}

      </g>
    </g>

    {/if}

  </g>

  <g transform="translate({-rs/2}, {-rs/2})" 
    class="resize-knobs" class:active
  >
    {#each 
    isCircle 
      ? [[+rw, 0]] 
      : [
          [-rw,-rh], [0,-rh], [+rw,-rh], [+rw,0],
          [+rw,+rh], [0,+rh], [-rw,+rh], [-rw,0],
        ]
        .map(([x,y], k) => [x,y,k])
    as [x,y,k]}
    <rect fill="white" width={rs} height={rs} {x} {y}
      on:mousedown|stopPropagation|preventDefault={e => resizeStart(e, k)}
    />
    {/each}
  </g>

</g>



<style lang="text/postcss">

  .half-opacity {
    opacity: 0.4;
  }
  .zero-opacity {
    opacity: 0;
  }

  .resize-knobs {
    visibility: hidden;
    cursor: crosshair;
  }
  .resize-knobs.active {
    visibility: visible;
  }

  .platform rect, .platform circle {
    transition: fill 100ms;
  }
  .selectable {
    /* transition: outline-color 50ms; */
    outline-width: 4px;
    outline-offset: -4px;
    outline-style: dashed;
    outline-color: rgba(255,255,255,0.0);
  }
  .selectable:hover {
    cursor: pointer;
    outline-color: rgba(255,255,255,0.5);
  }
  .selectable.active {
    outline-color: rgba(255,255,255,0.95);
  }

  /* 
  .invisible {
    visibility: initial !important;
  } 
  */

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