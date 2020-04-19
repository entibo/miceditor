
<script>

  import { bezier, rotate, deg, rad } from "common"
  import { jointPointMouseDown, jointPrismaticLimitMouseDown, jointRotationLimitMouseDown } from "state/interaction"

  import * as Editor from "data/editor/index"
  import * as sceneObjects from "state/sceneObjects"

  export let obj

  $: active = $obj.selected


  $: isRendered = Editor.Joint.isRendered($obj)


  $: color = $obj.color
  $: thickness = $obj.thickness
  $: opacity = $obj.opacity

  const green = "#33ff44"
  const yellow = "yellow"


  $: isHardToSee 
      =  ( opacity < 0.1 ) 
      || ( isNaN(parseInt(color, 16)) ) 
      || [color.substring(0,2), color.substring(2,4), color.substring(4,6)]
            .map(s => parseInt(s, 16))
            .every((x,i) => Math.abs([0x6a,0x74,0x95][i] - x) < 10)



  $: points = ["point1","point3","point4","point2"] 
      .map(name => $obj[name] && { ...$obj[name], name })
      .filter(x => x && ("enabled" in x ? x.enabled : true))
  

  $: controlPoints = ["controlPoint1", "controlPoint2"] 
        .map(name => ({ ...$obj[name], name }))




  let platform1 = null, platform2 = null
  $: {
    let r = sceneObjects.getJointPlatforms($obj)
    platform1 = r.platform1
    platform2 = r.platform2
  }


  function pointToString(p) {
    if(!p) return ""
    return [p.x,p.y].join(",")
  }

  $: polyline 
      = $obj.type === "VC" 
          ? Array($obj.fineness + 1).fill()
              .map((_,i) => bezier(i/$obj.fineness, $obj.point1, $obj.point2, $obj.controlPoint1, $obj.controlPoint2))
              .map(pointToString).join(" ")
      : $obj.type === "JD"
          ? [ points.find(p => p.name === "point1") || platform1,
              points.find(p => p.name === "point2") || platform2,
            ].filter(x => x).map(pointToString).join(" ")
      : $obj.type === "JPL"
          ? [ points.find(p => p.name === "point1") || platform1,
              $obj.point3,
              $obj.point4,
              points.find(p => p.name === "point2") || platform2,
            ].filter(x => x).map(pointToString).join(" ")
      : ""


  $: fullPolyline =
      [ platform1,
        ...points,
        platform2,
      ].filter(x => x).map(pointToString).join(" ")

  $: renderFullPolyline
      =  (platform1 && !Editor.Platform.isStatic(platform1))
      || (platform2 && !Editor.Platform.isStatic(platform2))
      || !isRendered


  $: labelPosition = platform1 && (points[0] || platform2)
    ? getMidPoint(platform1, points[0] || platform2)
    : null

  function getMidPoint(p1, p2) {
    return {
      x: (p1.x + p2.x)/2,
      y: (p1.y + p2.y)/2,
    }
  }

  

  $: rotationPreview = $obj.type === "JR"
    ? computeRotationPreview(points[0] || platform2, platform1)
    : null

  function computeRotationPreview(origin, pos) {
    if(!origin || !pos) return
    let dx = pos.x - origin.x
    let dy = pos.y - origin.y
    let angle = deg(Math.atan2(dy,dx))
    let radius = Math.sqrt(dx*dx + dy*dy)
    let points = []
    for(let name of ["min", "max"]) {
      let a = $obj[name]
      if(!isFinite(a)) continue
      if(name === "min" && (a < -360 || a > 0)) continue
      if(name === "max" && (a > +360 || a < 0)) continue
      a = -rad(a) + rad(angle)
      points.push({
        x: radius*Math.cos(a),
        y: radius*Math.sin(a),
        name,
      })
    }

    let animationDuration = 0, animationReverse = false
    if($obj.power != 0 && $obj.speed != 0) {
      animationReverse = Math.sign($obj.power * $obj.speed) === 1
      animationDuration = 1 / ($obj.speed / 360)
    }

    return { 
      origin, angle, radius, points, animationDuration, animationReverse,
    }
  }


  $: prismaticPreview = $obj.type === "JP"
    ? computePrismaticPreview(platform1)
    : null

  function computePrismaticPreview(platform1) {
    if(!platform1) return

    let axisAngle = deg(Math.atan2($obj.axis.y, $obj.axis.x))
    let angle = axisAngle
    if(platform1.fixedRotation === false) {
      angle -= platform1.rotation || 0
      angle -= $obj.angle
    }
    angle += 180

    let points = [$obj.min, $obj.max]
      .map((v,i) => {
        v = Math.sign(v)*Math.min(5e3, Math.abs(v))
        let [x,y] = rotate(v, 0, angle)
        return { x, y, name: i===0?"min":"max" }
      })

    let animationDuration = 0, animationReverse = false
    if($obj.power != 0 && $obj.speed != 0) {
      animationReverse = Math.sign($obj.power * $obj.speed) === -1
      animationDuration = 1 / ($obj.speed / 100)
    }

    return { 
      origin: platform1,
      angle,
      points,
      animationDuration, animationReverse,
    }
  }



  let crosshairRadius = 6
  let crosshairThickness = 2

</script>

<g>
  <g class="joint" 
    on:mousedown on:mousemove on:mouseleave
  >
    {#if renderFullPolyline}
      <g class="selectable" class:active>
        <polyline points={fullPolyline} class="dashed-line" />
      </g>
    {/if}
    {#if isRendered}
      <g class="selectable" class:active class:hard-to-see={isHardToSee} >
        <polyline points={polyline}
          stroke-width={thickness}
          stroke="#{color}" 
          opacity={opacity}
          fill="none"
        />
      </g>
    {/if}
    {#if active && prismaticPreview}
    
      <g opacity="0.9" 
          transform="translate({platform1.x},{platform1.y})"
      >
        <g stroke={green} stroke-width="1" class="pointer-events-none prismatic-line"
           stroke-dasharray={prismaticPreview.animationDuration ? 25 : 8}
           style="animation-duration: {prismaticPreview.animationDuration}s;
                  animation-direction: {prismaticPreview.animationReverse ? 'reverse' : 'normal'};"
        >
          <line x1={prismaticPreview.points[0].x} x2={prismaticPreview.points[1].x}
                y1={prismaticPreview.points[0].y} y2={prismaticPreview.points[1].y}
          />
        </g>
        {#each prismaticPreview.points as {x,y,name}}
          <g transform="translate({x},{y})" class="cursor-pointer"
             on:mousedown|stopPropagation|preventDefault={e => jointPrismaticLimitMouseDown(e, obj, name, prismaticPreview.origin, prismaticPreview.angle)}
          >
            <circle r=6 fill="black" />
            <text class="limit-index">{name === "min" ? "1" : "2"}</text>
          </g>
        {/each}
      </g>
    {/if}
    {#if active && rotationPreview}
      <g opacity="0.9" 
         transform="translate({rotationPreview.origin.x},{rotationPreview.origin.y})"
      >
        <circle r={rotationPreview.radius} class="pointer-events-none rotation-circle" 
                fill="none" stroke={green} stroke-width="1" 
                stroke-dasharray={rotationPreview.animationDuration ? rotationPreview.radius*Math.PI/4 : 4}
                style="animation-duration: {rotationPreview.animationDuration}s;
                       animation-direction: {rotationPreview.animationReverse ? 'reverse' : 'normal'};"
        />
        {#each rotationPreview.points as {x,y,name}}
          <g transform="translate({x},{y})" class="cursor-pointer"
             on:mousedown|stopPropagation|preventDefault={e => jointRotationLimitMouseDown(e, obj, name, rotationPreview.origin, rotationPreview.angle)}>
            <circle r=6 fill="black" />
            <text class="limit-index">{name === "min" ? "1" : "2"}</text>
          </g>
        {/each}
      </g>
    {/if}
    {#if labelPosition && !isRendered}
      <g transform="translate({labelPosition.x},{labelPosition.y})" class="dashed-line cursor-pointer" class:active >
        <circle r=8 fill="white" />
        <text class="joint-type">{$obj.type}</text>
      </g>
    {/if}
  </g>
  
  <g class="point-crosshairs" class:active >

    {#each points.filter(({name}) => !name.startsWith("platform")) as {x,y,name}}
      <g fill="none" stroke={yellow} opacity="0.8" stroke-width={crosshairThickness} stroke-linecap="butt" 
        transform="translate({x},{y})"
      >
        <line x1={0-crosshairRadius} x2={0+crosshairRadius}
              y1={0} y2={0}  />
        <line x1={0} x2={0}
              y1={0-crosshairRadius} y2={0+crosshairRadius}  />
        <circle fill="transparent" stroke="none"
          x={0} y={0}
          r={crosshairRadius}
          on:mousedown|stopPropagation|preventDefault={e => jointPointMouseDown(e, obj, {x,y,name})}
        />
      </g>
    {/each}

    {#if $obj.type === "VC"}
      <line fill="none" stroke={yellow} opacity="0.8" stroke-width="0.5"
            x1={points[0].x} x2={points[1].x}
            y1={points[0].y} y2={points[1].y}  />
      {#each controlPoints as {x,y,name}, idx}
        <g fill="none" stroke={green} opacity="0.8" stroke-width={crosshairThickness} stroke-linecap="butt" 
          transform="translate({x},{y})"
        >
          <line x1={0-crosshairRadius} x2={0+crosshairRadius}
                y1={0} y2={0}  />
          <line x1={0} x2={0}
                y1={0-crosshairRadius} y2={0+crosshairRadius}  />
          <circle fill="transparent" stroke="none"
            x={0} y={0}
            r={crosshairRadius}
            on:mousedown|stopPropagation|preventDefault={e => jointPointMouseDown(e, obj, {x,y,name})}
          />
        </g>
        <line fill="none" stroke={green} opacity="0.8" stroke-width="0.5"
              x1={x} x2={points[idx].x}
              y1={y} y2={points[idx].y}  />
      {/each}
    {/if}

  </g>

</g>



<style lang="text/postcss">
  .rotation-circle {
    animation-name: rotation-animation;
    animation-duration: 0;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes rotation-animation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .prismatic-line {
    animation-name: dash-animation;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  @keyframes dash-animation {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: -100;
    }
  }

  text {
    stroke-width: 1px;
    text-anchor: middle;
    alignment-baseline: middle;
    dominant-baseline: middle;
    stroke-dasharray: none;
  }
  text.joint-type {
    fill: #6a7495;
    stroke: #6a7495;
    font: 12px monospace;
  }
  text.limit-index {
    fill: #6a7495;
    stroke: #6a7495;
    font: 8px monospace;
  }

  .point-crosshairs {
    visibility: hidden;
    cursor: crosshair;
  }
  .point-crosshairs.active {
    visibility: visible;
  }

  .joint {
    transition: fill 100ms;
  }
  .joint {
    stroke-linecap: round;
    stroke-linejoin: round;
  }


  .selectable.hard-to-see {
    transition: outline-color 50ms;
    outline-width: 2px;
    outline-offset: -1px;
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

</style>