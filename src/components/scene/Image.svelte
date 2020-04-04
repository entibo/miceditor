
<script>
  import SvgImage from "/components/common/SvgImage.svelte"

  export let obj
  $: active = $obj.selected

  $: disappearing = "rx" in $obj
  
</script>

<g on:mousedown 
  class="image" class:active={active} 
  transform="translate({$obj.x}, {$obj.y})"
>
  <SvgImage href="{$obj.imageUrl.url}"/>
</g>

{#if disappearing && active}
  <rect x={$obj.rx} y={$obj.ry}
        width={$obj.rw} height={$obj.rh}
        fill="none" stroke="yellow" stroke-width="1"
  />
{/if}

<style lang="text/postcss">
  :global(.image) {
    transition: fill 100ms, outline-color 50ms;
    outline-width: 2px;
    outline-offset: -1px;
    outline-style: dashed;
    outline-color: rgba(255,255,255,0.0);
  }
  :global(.image:hover) {
    cursor: pointer;
    outline-color: rgba(255,255,255,0.5);
  }
  :global(.image.active) {
    outline-color: rgba(255,255,255,0.95);
  }

</style>