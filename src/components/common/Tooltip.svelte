
<script>

  import { fly } from "svelte/transition"
  
  let className = ""
  export { className as class }

  export let active = undefined

  export let title = "Tooltip"
  export let hoverable = false
  export let noStyle = false
  export let noBorder = false
  export let inDuration = 140
  export let outDuration = 80
  export let inDelay = 0
  export let outDelay = 0

  export let top = false
  export let bottom = false
  export let left = false
  export let right = false
  export let start = false
  export let end = false

  left || right || top || (bottom = true)

  let hovering = false
  
  $: visible = active === true ? true 
             : active === false ? false 
             : hovering

  const flyOffset = 10
  $: flyDirectionOptions =
    left    ? { x:  flyOffset } :
    right   ? { x: -flyOffset } :
    top     ? { y:  flyOffset } :
    bottom  ? { y: -flyOffset } : {}
  $: flyInOptions  = { 
    ...flyDirectionOptions, 
    duration: inDuration,
    delay: inDelay,
  }
  $: flyOutOptions = { 
    ...flyDirectionOptions, 
    duration: outDuration,
    delay: outDelay,
  }

  let targetElement
  let tooltipElement

  $: tooltipElement, positionTooltip()
  function positionTooltip(force = false) {
    if(!tooltipElement || !targetElement) return

    let targetRect  = targetElement.getBoundingClientRect()
    let tooltipRect = tooltipElement.getBoundingClientRect()

    let fullWidth  = document.body.offsetWidth
    let fullHeight = document.body.offsetHeight

    let x = 0, y = 0
    if(top) {    
      tooltipElement.style.top = 0
      y = targetRect.top - tooltipRect.height
    }
    if(bottom) { 
      tooltipElement.style.top = 0
      y = targetRect.bottom
    }
    if(top || bottom) {
      tooltipElement.style.left = 0
      x = start ? targetRect.left 
        : end   ? targetRect.right - tooltipRect.width
                : (targetRect.right + targetRect.left)/2 - tooltipRect.width/2
    }
    if(left) {   
      tooltipElement.style.left = 0
      x = targetRect.left - tooltipRect.width
    }
    if(right) {  
      tooltipElement.style.left = 0
      x = targetRect.right
    }
    if(left || right) {
      tooltipElement.style.top = 0
      y = start ? targetRect.top 
        : end   ? targetRect.bottom - tooltipRect.height
                : (targetRect.bottom + targetRect.top)/2 - tooltipRect.height/2
    }

    if(!force) {
      let overflows = false
      if(y < 0) {
        if(top) {
          top = false
          bottom = true
        }
        else y = 0
        overflows = true
      }
      if(y + tooltipRect.height > fullHeight) {
        if(bottom) {
          bottom = false
          top = true
        }
        else y = fullHeight - tooltipRect.height
        overflows = true
      }
      if(x < 0) {
        if(left) {
          left = false
          right = true
        }
        else x = 0
        overflows = true
      }
      if(x + tooltipRect.width > fullWidth) {
        if(right) {
          right = false
          left = true
        }
        else x = fullWidth - tooltipRect.width
        overflows = true
      }
      if(overflows)
        return positionTooltip(true)
    }
    else {
      if(y < 0) 
        y = 0
      if(y + tooltipRect.height > fullHeight)
        y = fullHeight - tooltipRect.height
      if(x < 0)
        x = 0
      if(x + tooltipRect.width > fullWidth)
        x = fullWidth - tooltipRect.width
    }
    
    {
      let firstPositionedAncestor
      let el = tooltipElement
      while(el.parentElement) {
        el = el.parentElement
        let position = getComputedStyle(el).position
        if(position !== "static") {
          firstPositionedAncestor = el
          break
        }
      }
      if(firstPositionedAncestor) {
        let rect = firstPositionedAncestor.getBoundingClientRect()
        x -= rect.x
        y -= rect.y
      }
    }

    x = Math.round(x)
    y = Math.round(y)

    tooltipElement.style.transform = `translate(${x}px,${y}px)`
  }

</script>

<div bind:this={targetElement}
     class={className || "flex items-center"}
     on:mouseenter={() => hovering = true} 
     on:mouseleave={() => hovering = false} 
     on:click
>
  <slot></slot>
  {#if visible}
    <div bind:this={tooltipElement}
        class="tooltip"
        class:pointer-events-none={!hoverable}
        class:border={!noBorder} 
    >
      <div class:tooltip-inner={!noStyle} 
          in:fly={flyInOptions}
          out:fly={flyOutOptions}
      >
        <slot name="tooltip">
          <span class="pointer-events-all whitespace-no-wrap">{title}</span>
        </slot>
      </div>
    </div>
  {/if}
</div>



<style lang="text/postcss">
  .tooltip {
    @apply select-none;
    @apply absolute z-40;
  }
  .tooltip.border {
    border: 5px solid transparent;
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