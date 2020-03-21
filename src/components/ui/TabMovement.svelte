
<script>
  import { layoutConfig, tabMovement } from "/state/layout"

  let x = -100, y = -100
  function onMousemove(e) {
    x = e.x
    y = e.y
  }

</script>


<svelte:window on:mousemove={onMousemove} />

{#if $tabMovement.enabled && $tabMovement.active}
<div class="tab active pointer-events-none absolute z-50 bg-gray-900 rounded shadow-md"
     style="transform: translate({x}px, {y}px) translate(-50%, -50%);"
>
  {$tabMovement.source.tab}
</div>
{/if}