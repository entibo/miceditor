
<script>

  export let obj

  import { objectMouseDown } from "state/interaction"

  import * as Editor from "data/editor/index"
  import { creation } from "state/creation"
  import highlight from "state/highlight"

  $: outOfTheWay = $highlight.size > 0 && !$highlight.has(obj)

</script>

{#if $obj.visible}

<g class:pointer-events-none={!$obj.interactive}
   class:out-of-the-way={outOfTheWay}
   class:selectable={$obj.interactive}
   class:selected={$obj.selected}
   on:mousedown={e => objectMouseDown(e, obj)}
>
  <slot></slot>
</g>

{/if}

<style>
  .out-of-the-way {
    pointer-events: none;
    opacity: 0.33;
  }
</style>