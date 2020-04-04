
<script>

  //import { encodeJointData } from "/xml-utils.ts"
  /* import {
    joints, selection, buildXML, creation, bezier
  } from "/stores/stores.js" */
  import { bezier } from "@/util"
  import { jointMouseDown } from "/components/scene/interaction"

  import * as Editor from "/data/editor/index"
  import * as sceneObjects from "/state/sceneObjects"

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
  </g>
  
  <g class="point-crosshairs" class:active >

    {#each points.filter(({name}) => !name.startsWith("platform")) as {x,y,name}}
      <g fill="none" stroke="yellow" opacity="0.8" stroke-width={crosshairThickness} stroke-linecap="butt" 
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