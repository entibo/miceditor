
<script context="module">

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

    let {joint, pointIndex, originalPoint, start} = resizeInfo

    let dx = e.clientX - start.x
    let dy = e.clientY - start.y

    joint._points[pointIndex].x = originalPoint.x + dx
    joint._points[pointIndex].y = originalPoint.y + dy

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
    joints, selection, buildXML 
  } from "/stores/stores.js"

  export let joint
  export let active = false

  $: polylinePoints = joint._points.map(p => [p.x,p.y].join(",")).join(" ")

  function rotate(x, y, angle, cx=0, cy=0) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = -Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
  }

  $: if(joint.__isNew) {
    resizeInfo = { 
      joint,
      pointIndex: 1,
      originalPoint: {...joint._points[1]},
    }
    delete joint.__isNew
  }
  function pointMoveStart(e, pointIndex) {
    resizeInfo = { 
      joint,
      pointIndex,
      originalPoint: {...joint._points[pointIndex]},
      start: { x: e.clientX, y: e.clientY },
    }
  }

  let crosshairRadius = 8

</script>

<g>
  <g class="joint" 
    on:mousedown on:mousemove on:mouseleave
  >
    <g class="selectable" class:active >
      <polyline points={polylinePoints}
        stroke-width="{joint._thickness}" 
        stroke="{joint._displayColor}" 
        fill="none"
        opacity="{joint._opacity}"
      >
    </g>
  </g>
  <g class="point-crosshairs" class:active >
    {#each joint._points as p, pointIndex}
    <g fill="none" stroke="white" stroke-width="2" stroke-linecap="butt" 
      transform="translate({p.x},{p.y})"
    >
      <line 
        x1={0-crosshairRadius} x2={0+crosshairRadius}
        y1={0} y2={0} 
      />
      <line 
        x1={0} x2={0}
        y1={0-crosshairRadius} y2={0+crosshairRadius} 
      />
      <circle fill="transparent" stroke="none"
        x={0} y={0}
        r={crosshairRadius}
        on:mousedown|stopPropagation|preventDefault={e => pointMoveStart(e, pointIndex)}
      />
    </g>
    {/each}
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

  .selectable {
    /* transition: outline-color 50ms; */
    /* outline-width: 4px;
    outline-offset: -4px;
    outline-style: dashed;
    outline-color: rgba(255,255,255,0.0); */
  }
  .selectable:hover {
    cursor: pointer;
    outline-color: rgba(255,255,255,0.5);
  }
  .selectable.active {
    outline-color: rgba(255,255,255,0.95);
  }

</style>