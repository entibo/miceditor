
<script context="module">

  let resizeInfo = null

  window.addEventListener("mousemove", resizeMove)
  window.addEventListener("mouseup", resizeStop)
  window.addEventListener("mouseleave", resizeStop)

  // 0 1 2
  // 7   3
  // 6 5 4
  function resizeMove(e) {
    if(!resizeInfo) return
    let {k, start, platform, platformStart} = resizeInfo

    let rotation = platform._rotation || 0

    let isCircle = platform._typeName === "circle"

    let dx = e.clientX - start.x
    let dy = e.clientY - start.y

    let [rdx,rdy] = rotate(dx, dy, -rotation)
    if([1,5].includes(k)) rdx = 0
    if([3,7].includes(k)) rdy = 0

    let sign = { x: 1, y: 1 }
    if([4,5,6].includes(k)) sign.y = -1
    if([6,7,0].includes(k)) sign.x = -1
    if(isCircle) {
      sign.x /= 2
      sign.y /= 2
    }

    let newWidth = platformStart._width   + sign.x*(+rdx)
    let newHeight = platformStart._height + sign.y*(-rdy)
    let extraWidth = newWidth < 10 ? 10 - newWidth : 0
    let extraHeight = newHeight < 10 ? 10 - newHeight : 0
    platform._width = Math.max(10, newWidth)
    platform._height = Math.max(10, newHeight)

    let [a,b] = rotate(rdx + sign.x*extraWidth, rdy - sign.y*extraHeight, rotation||0)
    platform._x = Math.round(platformStart._x + a/2)
    platform._y = Math.round(platformStart._y + b/2)

    encodePlatformData(platform)
    platforms.update(v => v)
    selection.update(v => v)
    buildXML()
  }

  function resizeStop() {
    resizeInfo = null
  }

</script>

<script>

  import { encodePlatformData } from "/xml-utils.js"
  import { 
    highQuality, showInvisibleGrounds,
    platforms, selection, buildXML 
  } from "/stores/stores.js"

  import SvgImage from "/components/common/SvgImage.svelte"

  export let platform
  export let active = false

  $: isCircle = platform._typeName === "circle"

  function rotate(x, y, angle, cx=0, cy=0) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = -Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
  }

  $: rs = 6
  $: rw = rs/2 + (isCircle ? platform._width : platform._width/2)
  $: rh = rs/2 + (isCircle ? platform._width : platform._height/2)

  function resizeStart(e, k) {
    resizeInfo = { 
      k,
      start: { x: e.clientX, y: e.clientY },
      platformStart: Object.assign({}, platform),
      platform,
    }
  }

  $: isInvisible = platform._invisible || platform._typeName === "invisible"
  $: invisibilityClass = isInvisible ?
    ($showInvisibleGrounds ? "half-opacity" : "zero-opacity") :
    ""

</script>

<g 
  transform="translate({platform._x}, {platform._y}) 
             rotate({platform._rotation || 0})"
>
  <g class="platform"
    on:mousedown on:mousemove on:mouseleave
  >

    {#if platform._groundImageEnabled}
    <SvgImage class="pointer-events-none"
      x={-platform._width/2 + platform._groundImageX} 
      y={-platform._height/2 + platform._groundImageY}
      href={platform._groundImageFullUrl}
    />}
    <rect
      x={-platform._width/2} y={-platform._height/2}
      width={platform._width} height={platform._height}
      fill="transparent"
      class="selectable"
      class:active
    />
    {:else}

    <g class="selectable" class:active >
      <g class={invisibilityClass} >

        {#if platform._typeName === "circle"}
          <circle
            r={platform._radius}
            fill={platform._displayColor}
          />
        {:else if platform._typeName === "rectangle"}
          <rect
            x={-platform._width/2} y={-platform._height/2}
            width={platform._width} height={platform._height}
            fill={platform._displayColor}
          />
        {:else if ["wood", "ice", "trampoline", "chocolate", "cloud"].includes(platform._typeName)}
          <image 
            x={-platform._width/2} y={-platform._height/2}
            width={platform._width} height={platform._height} 
            preserveAspectRatio="none" 
            href="dist/grounds/{ platform._typeName }{ $highQuality? "-high" : "" }.png"
            on:mousedown|preventDefault
          />
        {:else if platform._typeName === "invisible"}
          <rect
            x={-platform._width/2} y={-platform._height/2}
            width={platform._width} height={platform._height}
            fill="white"
          />
        {:else}
          <foreignObject
            x={-platform._width/2} y={-platform._height/2}
            width={platform._width} height={platform._height} 
          >
            <div
              class="w-full h-full {platform._typeName !== 'invisible' ? platform._typeName : ''}"
              class:sides={platform._width%40===0}
              class:highQuality={$highQuality}
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
    isCircle ? [[+rw,0,3],[-rw,0,7]] : [
      [-rw,-rh], [0,-rh], [+rw,-rh], [+rw,0],
      [+rw,+rh], [0,+rh], [-rw,+rh], [-rw,0],
    ].map(([x,y], k) => [x,y,k])
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

  .water { background: url(grounds/water.png); }
  .highQuality.water { background: url(grounds/water-high.png); }

  .lava { background: url(grounds/lava.png); }
  .highQuality.lava { background: url(grounds/lava-high.png); }

  .earth { background: url(grounds/earth.png); }
  .highQuality.earth { background: url(grounds/earth-high.png); }
  
  .grass2 {
    background: 
      url(grounds/grass2-top.png) repeat-x, 
      url(grounds/earth.png);
  }
  .grass2.sides {
    background: 
      url(grounds/grass2-corner.png) no-repeat,
      url(grounds/grass2-corner-flipped.png) no-repeat right top,
      url(grounds/grass2-top.png) repeat-x, 
      url(grounds/earth.png);
  }
  .highQuality.grass2 {
    background: 
      url(grounds/grass2-top.png) repeat-x, 
      url(grounds/earth-high.png);
  }
  .highQuality.grass2.sides {
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
      url(grounds/earth.png);
  }
  .grass.sides {
    background: 
      url(grounds/grass-corner.png) no-repeat,
      url(grounds/grass-corner-flipped.png) no-repeat right top,
      url(grounds/grass-top.png) repeat-x, 
      url(grounds/earth.png);
  }
  .highQuality.grass {
    background: 
      url(grounds/grass-top.png) repeat-x, 
      url(grounds/earth-high.png);
  }
  .highQuality.grass.sides {
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
      url(grounds/earth.png);
  }
  .snow.sides {
    background: 
      url(grounds/snow-top.png) repeat-x, 
      url(grounds/grass-side.png) repeat-y,
      url(grounds/grass-side-flipped.png) repeat-y right top,
      url(grounds/earth.png);
  }
  .highQuality.snow {
    background: 
      url(grounds/snow-top.png) repeat-x, 
      url(grounds/earth-high.png);
  }
  .highQuality.snow.sides {
    background: 
      url(grounds/snow-top.png) repeat-x, 
      url(grounds/grass-side.png) repeat-y,
      url(grounds/grass-side-flipped.png) repeat-y right top,
      url(grounds/earth-high.png);
  }

  .stone {
    background: 
      url(grounds/stone-top.png) repeat-x, 
      url(grounds/stone.png);
  }
  .stone.sides {
    background: 
      url(grounds/stone-side.png) repeat-y, 
      url(grounds/stone-side.png) repeat-y right top, 
      url(grounds/stone-top.png) repeat-x, 
      url(grounds/stone.png);
  }
  .highQuality.stone {
    background: 
      url(grounds/stone-top.png) repeat-x, 
      url(grounds/stone-high.png);
  }
  .highQuality.stone.sides {
    background: 
      url(grounds/stone-side.png) repeat-y, 
      url(grounds/stone-side.png) repeat-y right top, 
      url(grounds/stone-top.png) repeat-x, 
      url(grounds/stone-high.png);
  }

</style>