
<script>

  //import { encodeJointData } from "xml-utils.ts"
  /* import {
    joints, selection, buildXML, creation, bezier
  } from "stores/stores.js" */
  import { bezier, rotate, deg, rad } from "common"
  import { jointMouseDown } from "state/interaction"

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
    let radius = Math.sqrt((origin.x-pos.x)**2 + (origin.y-pos.y)**2)
    let points = [$obj.min, $obj.max]
      .filter(isFinite)
      .map(rad)
      .map(a => -a)
      .map(a => ({
        x: radius*Math.cos(a),
        y: radius*Math.sin(a),
      }))
    return { origin, radius, points }
  }


  function computePrismaticLimitOffset(v) {
    v = Math.sign(v)*Math.min(1e4, Math.abs(v))
    let axisAngle = deg(Math.atan2($obj.axis.y, $obj.axis.x))
    let angle = axisAngle
    if(platform1.fixedRotation === false) {
      angle -= platform1.rotation || 0
      angle -= $obj.angle
    }
    angle += 180
    let [x,y] = rotate(v, 0, angle)
    return {x,y}
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
    {#if active && platform1 && $obj.type === "JP"}
      <g stroke={green} stroke-width="1" opacity="0.9" stroke-dasharray="4"
         transform="translate({platform1.x},{platform1.y})"
         class="pointer-events-none"
      >
        <line x1={0} x2={computePrismaticLimitOffset($obj.min).x}
              y1={0} y2={computePrismaticLimitOffset($obj.min).y}
        />
        <line x1={0} x2={computePrismaticLimitOffset($obj.max).x}
              y1={0} y2={computePrismaticLimitOffset($obj.max).y}
        />
      </g>
    {/if}
    {#if active && rotationPreview && $obj.type === "JR"}
      <g opacity="0.9" 
         transform="translate({rotationPreview.origin.x},{rotationPreview.origin.y})"
         class="pointer-events-none"
      >
        <circle r={rotationPreview.radius} fill="none" stroke={green} stroke-dasharray="4" stroke-width="1" />
        {#each rotationPreview.points as {x,y}, index}
          <g transform="translate({x},{y})" >
            <circle r=6 fill="black" />
            <text class="limit-index">{index+1}</text>
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
          on:mousedown|stopPropagation|preventDefault={e => jointMouseDown(e, obj, {x,y,name})}
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
            on:mousedown|stopPropagation|preventDefault={e => jointMouseDown(e, obj, {x,y,name})}
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