
<script>

  import { createEventDispatcher } from "svelte"
  import { clamp } from "/data/base/util"

  export let min = 0
  export let max = 100
  export let step = 1
  export let value

  const dispatch = createEventDispatcher()

  let container
  let containerWidth, containerHeight
  let isSliding = false

  function onMouseDown(e) {
    isSliding = true
    onMouseMove(e)
  }

  function onMouseMove({x,y}) {
    if(!isSliding) return
    let rect = container.getBoundingClientRect()
    let ratio = clamp((x-rect.left)/(rect.width), 0, 1)
    console.log("min", min, "max", max, "step", step)
    console.log("ratio", ratio)
    let newValue = ratio * (max-min) + min
    console.log("newValue", newValue)
    newValue = step * Math.round(newValue/step)
    console.log("newValue > step", newValue)
    value = newValue
    dispatch("input")
  }

  function onMouseUp(e) {
    isSliding = false
  }

  $: ratio = clamp((value-min)/(max-min), 0, 1)

</script>

<svelte:window
  on:mousemove={onMouseMove}
  on:mouseup={onMouseUp}
  on:mouseleave={onMouseUp}
/>


<div class="flex items-center px-2 w-32 h-4"
     on:mousedown={onMouseDown}
>
  <div class="relative h-1 rounded-sm flex-grow flex"
    bind:this={container}
    bind:clientWidth={containerWidth}
    bind:clientHeight={containerHeight}
  >
    <div class="h-full bg-blue-500 flex-shrink-0" style="width: {containerWidth*ratio}px"></div>
    <div class="h-full bg-gray-200 flex-grow"></div>
    <div class="selector bg-blue-500" 
         style="transform: translate(-50%, -50%) 
                           translateX({containerWidth*ratio}px)" 
    ></div>
  </div>
</div>


<style lang="text/postcss">
  .selector {
    /* @apply border-2 border-white shadow; */
    @apply absolute w-4 h-4 rounded-full cursor-pointer;
    top: 50%;
  }
</style>