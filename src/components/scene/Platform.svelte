
<script>

  import cc from "color-convert"
  import { getUniqueId } from "common"
  import * as Platform from "data/editor/Platform"
  import { showInvisibleGrounds, highQuality } from "state/user"
  import { platformResizeKnobMouseDown,
           platformBoosterVectorMouseDown,
           platformBoosterVectorMinLength,
           circleSlopeAngleMouseDown, 
         } from "state/interaction"
  import { slopeConfig, getLineSegments } from "state/slope"

  import SvgImage from "components/common/SvgImage.svelte"

  export let obj

  $: selected = $obj.selected

  $: typeName = Platform.typeNames[$obj.type]

  $: isCircle = typeName === "circle"

  $: galaxyName = $obj.galaxyName

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
    let length = platformBoosterVectorMinLength + $obj.booster.speed
    boosterVector = {
      angle,
      length,
      x: length * Math.cos(rad),
      y: length * Math.sin(rad),
      animationDuration: 1 / ($obj.booster.speed / 10000),
    }
  }
  else boosterVector = null

  let circleSlopePreview
  $: if($slopeConfig.enabled && typeName === "circle") {
    let segments = getLineSegments(
      0, 
      0, 
      $obj.radius, 
      $slopeConfig.startAngle, 
      $slopeConfig.endAngle,
      1,
      $slopeConfig.segments
    )
    circleSlopePreview = {
      segments,
      origin: {
        x: $obj.x,
        y: $obj.y,
      },
      points: [
        { name: "min", 
          x: $obj.radius*Math.cos($slopeConfig.startAngle*Math.PI/180), 
          y: $obj.radius*Math.sin($slopeConfig.startAngle*Math.PI/180) },
        { name: "max", 
          x: $obj.radius*Math.cos($slopeConfig.endAngle*Math.PI/180), 
          y: $obj.radius*Math.sin($slopeConfig.endAngle*Math.PI/180) },
      ],
      angle: $obj.rotation,
    }
  }
  else circleSlopePreview = null

  function getColorMatrix(hex) {
    let [r,g,b] = cc.hex.rgb(hex).map(x => x/255)
    return `
      1 0 0 0 ${r-0.5}
      0 1 0 0 ${g-0.5}
      0 0 1 0 ${b-0.5}
      0 0 0 1 0`.trim()
  }

  $: tintFilter = $obj.tint === "" ?  null :
    { 
      name: "tintFilter-" + getUniqueId(),
      matrix: getColorMatrix($obj.tint),
    }

</script>

<g transform="translate({x}, {y}) 
              rotate({rotation})"
>

  <g class="cursor-pointer" filter={tintFilter ? `url(#${tintFilter.name})` : null}>

    {#if $obj.image.enabled}

      <SvgImage class="pointer-events-none"
        x={(isCircle ? 0 : -width/2)  + $obj.image.x} 
        y={(isCircle ? 0 : -height/2) + $obj.image.y}
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
            class="{circleSlopePreview ? "" : "object-outline-stroke"}"
          />
          {#if circleSlopePreview}
            {#each circleSlopePreview.segments as {x1,y1,x2,y2}}
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="aqua" stroke-width=2 />
            {/each}
            {#each circleSlopePreview.points as {x,y,name}}
              <g transform="translate({x},{y})" class="cursor-pointer"
                on:mousedown|stopPropagation|preventDefault={e => circleSlopeAngleMouseDown(e, name, circleSlopePreview.origin, circleSlopePreview.angle)}>
                <circle r=6 fill="black" />
                <text class="limit-index">{name === "min" ? "1" : "2"}</text>
              </g>
            {/each}
          {/if}
        {:else if typeName === "rectangle"}
          <rect
            x={-width/2} y={-height/2}
            width={width} height={height}
            fill="#{$obj.color}"
            class="object-outline"
          />
        {:else if ["wood", "wood2", "ice", "trampoline", "chocolate", "cloud"].includes(typeName)}
          {#if $highQuality}
            <image
              x={-width/2} y={-height/2}
              width={width} height={height} 
              preserveAspectRatio="none" 
              href="dist/grounds/{ typeName }.svg"
              class="object-outline"
            />
          {:else}
            <image
              x={-width/2} y={-height/2}
              width={width} height={height} 
              preserveAspectRatio="none" 
              href="dist/grounds/{ typeName }.png"
              class="object-outline"
            />
          {/if}
        {:else if typeName === "invisible"}
          <rect
            x={-width/2} y={-height/2}
            width={width} height={height}
            fill="white"
            class="object-outline"
          />
        {:else}
          <g class="object-outline">
            <foreignObject
              x={-width/2} y={-height/2}
              width={width} height={height}
            >
              <div
                class="w-full h-full {typeName !== 'invisible' ? typeName : ''}"
                class:sides={width%40===0}
                data-name={galaxyName}
              >
              </div>
            </foreignObject>
          </g>
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
            class="pointer-events-none"
            stroke-dasharray={boosterVector.length/5}
            style="animation-duration: {boosterVector.animationDuration}s;"
      />
      <path class="arrowHead"
            transform="translate({boosterVector.x} {boosterVector.y})
                       rotate({boosterVector.angle})" 
            d="M 0 -5 L 10 0 L 0 5 z" 
            on:mousedown|stopPropagation|preventDefault={e => platformBoosterVectorMouseDown(e, obj)}
      />
    </g>
  {/if}

  {#if $obj.tint !== ""}
    <rect
      x={-width/2} y={-height/2}
      width={width} height={height}
      fill="#{$obj.tint}"
      class="tint-overlay"
    />
    <filter id="{tintFilter.name}" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values={tintFilter.matrix}/>
    </filter>
  {/if}

</g>



<style lang="text/postcss">
  .tint-overlay {
    mix-blend-mode: hard-light;
    pointer-events: none;
    display: none;
  }

  .booster-vector {
    opacity: 0.9;
  }
  .booster-vector.zero-speed {
    opacity: 0.5;
  }
  .booster-vector .arrowHead {
    /* fill: #0dff41; */
    /* stroke: white;
    stroke-width: 1; */
    fill: #33ff44;
  }
  .booster-vector line {
    stroke: #33ff44;
    stroke-width: 1;
    /* stroke-dasharray: 25; */
    animation-name: dash-animation;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes dash-animation {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: -10000;
    }
  }


  text {
    stroke-width: 1px;
    text-anchor: middle;
    alignment-baseline: middle;
    dominant-baseline: middle;
    stroke-dasharray: none;
  }
  text.limit-index {
    fill: #6a7495;
    stroke: #6a7495;
    font: 8px monospace;
  }



  .cobweb { background: url(grounds/cobweb.png); }

  .sand { background: url(grounds/sand.png); }

  .water { background: url(grounds/water-high.png); }

  .lava { background: url(grounds/lava-high.png); }

  .earth { background: url(grounds/earth-high.png); }
  
  
  .acid {
    background: 
      url(grounds/acid-top.png) repeat-x, 
      url(grounds/acid-body.png);
  }
  .acid.sides {
    background: 
      url(grounds/acid-side.png) repeat-y,
      url(grounds/acid-side-flipped.png) repeat-y right top,
      url(grounds/acid-corner.png) no-repeat,
      url(grounds/acid-corner-flipped.png) no-repeat right top,
      url(grounds/acid-top.png) repeat-x, 
      url(grounds/acid-body.png);
  }

  .honey {
    background: 
      url(grounds/honey-top.png) repeat-x, 
      url(grounds/honey-body.png);
  }
  .honey.sides {
    background: 
      url(grounds/honey-side.png) repeat-y,
      url(grounds/honey-side-flipped.png) repeat-y right top,
      url(grounds/honey-corner.png) no-repeat,
      url(grounds/honey-corner-flipped.png) no-repeat right top,
      url(grounds/honey-top.png) repeat-x, 
      url(grounds/honey-body.png);
  }

  .galaxy {
    background: 
      url(grounds/galaxy-top.png) repeat-x;
  }
  .galaxy:before {
    content: "";
    /* z-index: -1; */
    @apply absolute w-full h-full top-0 right-0 bottom-0 left-0;
    top: 20px;
    background: url(grounds/galaxy.png) 0 0;
  }
  .galaxy:after {
    content: attr(data-name);
    font: 20px monospace;
    color: #bea0f4;
    font-weight: 900;
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
  }

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

  .grass3 {
    background: 
      url(grounds/grass3-top.png) repeat-x, 
      url(grounds/earth-high.png);
  }
  .grass3.sides {
    background: 
      url(grounds/grass3-corner.png) no-repeat,
      url(grounds/grass3-corner-flipped.png) no-repeat right top,
      url(grounds/grass3-top.png) repeat-x, 
      url(grounds/earth-high.png);
  }
  .grass3.sides:before {
    content: "";
    /* z-index: -1; */
    @apply absolute w-full h-full top-0 right-0 bottom-0 left-0;
    top: 8px;
    background: 
      url(grounds/grass3-side.png) repeat-y,
      url(grounds/grass3-side-flipped.png) repeat-y right top;
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