
<script>

  import { fly } from "svelte/transition"

  export let active

  export let title = "Tooltip"
  export let inline = false
  export let noStyle = false
  export let noBorder = false

  export let top = false
  export let bottom = false
  export let left = false
  export let right = false
  export let start = false
  export let end = false

  left || right || top || (bottom = true)

  let hovering = false
  
  $: visible = active === true ? true : active === false ? false : hovering

  $: flyDirectionOptions =
    left    ? { x:  10 } :
    right   ? { x: -10 } :
    top     ? { y:  10 } :
    bottom  ? { y: -10 } : {}
  $: flyOptions = {
    ...flyDirectionOptions,
    duration: 150,
  }

  let targetElement
  let tooltipElement

  $: checkTooltipElement(tooltipElement)
  function checkTooltipElement(el) {
    if(!el) return
    let bbox = el.getBoundingClientRect()
    if(bbox.top < 0 && top) {
      top = false
      bottom = true
    }
    if(bbox.bottom > document.body.offsetHeight && bottom) {
      bottom = false
      top = true
    }
    if(bbox.left < 0 && left) {
      left = false
      right = true
    }
    if(bbox.right > document.body.offsetWidth && right) {
      right = false
      left = true
    }
  }

</script>

<div class="relative" class:inline-block={inline} 
  on:mouseenter={() => hovering = true} 
  on:mouseleave={() => hovering = false} 
  bind:this={targetElement}
>
  <slot></slot>
  {#if visible}
  <div class="tooltip" class:border={!noBorder} class:top class:bottom class:left class:right class:start class:end
    transition:fly={flyOptions}
    bind:this={tooltipElement}
  >
    <div class:inner={!noStyle}>
      <slot name="tooltip">
        <span class=" pointer-events-all whitespace-no-wrap">{title}</span>
      </slot>
    </div>
  </div>
  {/if}
</div>



<style lang="text/postcss">
  .tooltip {
    @apply pointer-events-none select-none;
    @apply absolute z-30;
  }
  .tooltip.border {
    border: 5px solid transparent;
  }
  .inner {
    @apply border shadow-md rounded-sm;
    @apply py-1 px-2;
    @apply text-gray-100 text-xs;
    background: rgba(0,0,0,0.8);
    border-color: rgba(0,0,0,1.0);
  }

  .tooltip.bottom {
    bottom: 0;
    transform: translateY(100%);
  }
  .tooltip.top {
    top: 0;
    transform: translateY(-100%);
  }
  .tooltip.bottom:not(.start):not(.end) {
    left: 50%;
    transform: translateY(100%) translateX(-50%);
  }
  .tooltip.top:not(.start):not(.end) {
    left: 50%;
    transform: translateY(-100%) translateX(-50%);
  }
  .tooltip.bottom.start, .tooltip.top.start {
    left: 0;
    border-left: none;
  }
  .tooltip.bottom.end, .tooltip.top.end {
    right: 0;
    border-right: 0;
  }

  .tooltip.left {
    left: 0;
    transform: translateX(-100%);
  }
  .tooltip.right {
    right: 0;
    transform: translateX(100%);
  }
  .tooltip.left:not(.start):not(.end) {
    top: 50%;
    transform: translateX(-100%) translateY(-50%);
  }
  .tooltip.right:not(.start):not(.end) {
    top: 50%;
    transform: translateX(100%) translateY(-50%);
  }
  .tooltip.left.start, .tooltip.right.start {
    top: 0;
    border-top: none;
  }
  .tooltip.left.end, .tooltip.right.end {
    bottom: 0;
    border-bottom: none;
  }


</style>