
<script>

  import { createEventDispatcher } from "svelte"
  import { clamp } from "data/base/util"

  export let min = 0
  export let max = 100
  export let step = 1
  export let value
  export let set = null

  export let widthClass = "w-32"

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
    let newValue = ratio * (max-min) + min
    newValue = step * Math.round(newValue/step)
    if(newValue !== value) {
      value = newValue
      if(set) set(newValue)
      dispatch("input")
    }
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


<div class="flex items-center px-2 h-4 {widthClass}"
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