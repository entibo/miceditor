
<script context="module">

  import { get as storeGet } from "svelte/store"
  import { zoom, drawingData } from "/stores/stores.js"

  let resizeInfo = null

  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("mouseup", onMouseRelease)
  window.addEventListener("mouseleave", onMouseRelease)


  let __mouse = { x: 0, y: 0 }
  function onMouseMove(e) {
    if(resizeInfo && !resizeInfo.start) {
      resizeInfo.start = __mouse
    }
    __mouse = { x: e.clientX, y: e.clientY }

    if(!resizeInfo) return

    let {joint, listKey, pointIndex, originalPoint, start} = resizeInfo

    let scale = 1 / storeGet(zoom)
    let dx = scale * (e.clientX - start.x)
    let dy = scale * (e.clientY - start.y)
    
    let nx = originalPoint.x + dx
    let ny = originalPoint.y + dy

    if(e.ctrlKey || e.shiftKey) {

      let relativePoint
      if(listKey === "_points") {
        relativePoint = joint._points[pointIndex - 1] || joint._points[pointIndex + 1]
      }
      else {
        relativePoint = joint._points[pointIndex]
      }
      let cx = relativePoint.x
      let cy = relativePoint.y

      let dist = Math.sqrt((cx-nx)**2 + (cy-ny)**2)

      let angleIncrement = 15 * Math.PI/180
      let angle = ( Math.atan2(ny-cy, nx-cx) + Math.PI*2 ) % (Math.PI*2)
      let newAngle = angleIncrement * Math.round(angle/angleIncrement)

      nx = cx + Math.round( dist * Math.cos(newAngle) )
      ny = cy + Math.round( dist * Math.sin(newAngle) )

    }

    joint[listKey][pointIndex].x = nx
    joint[listKey][pointIndex].y = ny

    encodeJointData(joint)
    joints.update(v => v)
    selection.update(v => v)
    buildXML()
  }

  function onMouseRelease() {
    resizeInfo = null
  }

</script>

<script>

  import { encodeJointData } from "/xml-utils.js"
  import {
    joints, selection, buildXML, creation, bezier
  } from "/stores/stores.js"

  export let joint
  export let active = false

  $: isHardToSee = ( joint._opacity < 0.1 ) || 
                   ( isNaN(parseInt(joint._color, 16)) ) ||
                   [joint._color.substring(0,2), joint._color.substring(2,4), joint._color.substring(4,6)]
                      .map(s => parseInt(s, 16))
                      .every((x,i) => Math.abs([0x6a,0x74,0x95][i] - x) < 10)

  $: polylinePoints = 
      ( joint.name === "VC" 
        ? Array(joint._fineness+1).fill()
            .map((_,i) => bezier(i/joint._fineness, joint._points[0], joint._points[1], joint._controlPoints[0], joint._controlPoints[1]))
        : joint._points )
      .map(p => [p.x,p.y].join(",")).join(" ")

  function rotate(x, y, angle, cx=0, cy=0) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = -Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
  }

  $: if(joint.__delegateAction) {
        if(joint.name === "VC") {
          let cp = joint._points[0].x == joint._points[1].x
                && joint._points[0].y == joint._points[1].y ? 0 : 1
          resizeInfo = { 
            joint,
            listKey: "_controlPoints",
            pointIndex: cp,
            originalPoint: {...joint._controlPoints[cp]},
          }
        }
        else {
          resizeInfo = { 
            joint,
            listKey: "_points",
            pointIndex: 1,
            originalPoint: {...joint._points[1]},
          }
        }
        joint.__delegateAction = false
  }
  function pointMoveStart(e, listKey, pointIndex) {
    resizeInfo = { 
      joint,
      listKey,
      pointIndex,
      originalPoint: {...joint[listKey][pointIndex]},
      start: { x: e.clientX, y: e.clientY },
    }
  }

  let crosshairRadius = 6
  let crosshairThickness = 2

</script>

<g>
  <g class="joint" 
    on:mousedown on:mousemove on:mouseleave
  >
    <g class="selectable" class:active class:hard-to-see={isHardToSee} >
      <polyline points={polylinePoints}
        stroke-width="{joint._thickness}" 
        stroke="{joint._displayColor}" 
        fill="none"
        opacity="{joint._opacity}"
      >
    </g>
  </g>
  {#if !$creation || $creation.objectType !== "joint" || $drawingData.curveToolEnabled  }
  <g class="point-crosshairs" class:active >

    {#each joint._points as p, pointIndex}
    <g fill="none" stroke="yellow" opacity="0.8" stroke-width={crosshairThickness} stroke-linecap="butt" 
      transform="translate({p.x},{p.y})"
    >
      <line x1={0-crosshairRadius} x2={0+crosshairRadius}
            y1={0} y2={0}  />
      <line x1={0} x2={0}
            y1={0-crosshairRadius} y2={0+crosshairRadius}  />
      <circle fill="transparent" stroke="none"
        x={0} y={0}
        r={crosshairRadius}
        on:mousedown|stopPropagation|preventDefault={e => pointMoveStart(e, "_points", pointIndex)}
      />
    </g>
    {/each}

    {#if joint._controlPoints}
    <line fill="none" stroke="yellow" opacity="0.8" stroke-width="0.5"
          x1={joint._points[0].x} x2={joint._points[1].x}
          y1={joint._points[0].y} y2={joint._points[1].y}  />
    {#each joint._controlPoints as p, pointIndex}
    <g fill="none" stroke="#33ff44" opacity="0.8" stroke-width={crosshairThickness} stroke-linecap="butt" 
      transform="translate({p.x},{p.y})"
    >
      <line x1={0-crosshairRadius} x2={0+crosshairRadius}
            y1={0} y2={0}  />
      <line x1={0} x2={0}
            y1={0-crosshairRadius} y2={0+crosshairRadius}  />
      <circle fill="transparent" stroke="none"
        x={0} y={0}
        r={crosshairRadius}
        on:mousedown|stopPropagation|preventDefault={e => pointMoveStart(e, "_controlPoints", pointIndex)}
      />
    </g>
    <line fill="none" stroke="#33ff44" opacity="0.8" stroke-width="0.5"
          x1={p.x} x2={joint._points[pointIndex].x}
          y1={p.y} y2={joint._points[pointIndex].y}  />
    {/each}
    {/if}

  </g>
  {/if}
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