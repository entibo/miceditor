
<script>

  //import { encodeJointData } from "/xml-utils.ts"
  /* import {
    joints, selection, buildXML, creation, bezier
  } from "/stores/stores.js" */
  import { bezier } from "@/util"
  import { jointMouseDown } from "/components/scene/interaction"

  import * as Editor from "data/editor/index"

  export let obj

  $: active = $obj.selected


  $: hidden = !Editor.Joint.isRendered($obj)

  let color, thickness, opacity
  $: if(!hidden) {
      color = $obj.color
      thickness = $obj.thickness
      opacity = $obj.opacity
    } else {
      color = "fff"
      thickness = 2
      opacity = $obj.selected ? 0.9 : 0.6
    }

  const green = "#33ff44"
  const yellow = "yellow"


  $: isHardToSee 
      =  ( opacity < 0.1 ) 
      || ( isNaN(parseInt(color, 16)) ) 
      || [color.substring(0,2), color.substring(2,4), color.substring(4,6)]
            .map(s => parseInt(s, 16))
            .every((x,i) => Math.abs([0x6a,0x74,0x95][i] - x) < 10)


  let platform1, platform2
  $: if($obj.platform1 !== $obj.platform2) {
    platform1 = $obj.platform1
    platform2 = $obj.platform2
  }


  let points
  $: {
        points = ["point1","point3","point4","point2"] 
          .map(name => $obj[name] && { ...$obj[name], name })
          .filter(x => x && ("enabled" in x ? x.enabled : true))

        if("platform1" in $obj && platform1)
          points = [{ name: "platform1", x: platform1.x, y: platform1.y }, ...points]
        if("platform2" in $obj && platform2)
          points = [...points, { name: "platform2", x: platform2.x, y: platform2.y }]
    }
  

  $: controlPoints = ["controlPoint1", "controlPoint2"] 
        .map(name => ({ ...$obj[name], name }))

  $: polyline = 
      ( $obj.type === "VC" 
        ? Array($obj.fineness + 1).fill()
            .map((_,i) => bezier(i/$obj.fineness, $obj.point1, $obj.point2, $obj.controlPoint1, $obj.controlPoint2))
        : points )
      .map(p => [p.x,p.y].join(",")).join(" ")

  let crosshairRadius = 6
  let crosshairThickness = 2

</script>

<g>
  <g class="joint" 
    on:mousedown on:mousemove on:mouseleave
  >
    <g class="selectable" class:active class:hard-to-see={isHardToSee} >
      <polyline points={polyline}
        stroke-width={thickness}
        stroke="#{color}" 
        fill="none"
        opacity={opacity}
        class:joint-hidden={hidden}
      >
    </g>
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

  .joint-hidden {
    stroke-dasharray: 6;
  }
  .active .joint-hidden {
    animation: dash-animation 2s linear infinite;
  }
  @keyframes dash-animation {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: -12;
    }
  }

  .selectable.hard-to-see {
    transition: outline-color 50ms;
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

</style>