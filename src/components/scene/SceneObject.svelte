
<script>

  export let obj

  import { objectMouseDown }

</script>

{#if $obj.visible}

<g class:pointer-events-none={!$obj.interactive}
   on:mousedown={e => objectMouseDown(e, obj)}
>
  <slot></slot>
</g>

{/if}