
<script>
  import SvgImage from "/components/common/SvgImage.svelte"

  export let obj
  $: active = $obj.selected

  
</script>

<g on:mousedown 
  class="image" class:active={active} 
  transform="translate({$obj.x}, {$obj.y})"
>
  <SvgImage href="{$obj.imageUrl.url}"/>
</g>

<style lang="text/postcss">
  :global(.image) {
    transition: fill 100ms, outline-color 50ms;
    outline-width: 4px;
    outline-offset: -4px;
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