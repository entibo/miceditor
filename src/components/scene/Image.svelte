
<script>
  import SvgImage from "components/common/SvgImage.svelte"

  export let obj

  $: selected = $obj.selected

  $: disappearing = "rx" in $obj
  
</script>

<g 
  class="object-outline cursor-pointer"
  transform="translate({$obj.x}, {$obj.y})"
>
  <SvgImage href="{$obj.imageUrl.url}"/>
</g>

{#if disappearing && selected}
  <rect x={$obj.rx} y={$obj.ry}
        width={$obj.rw} height={$obj.rh}
        fill="none" stroke="yellow" stroke-width="1"
        class="pointer-events-none"
  />
{/if}
