<script>

  export let disabled = false
  // export let className
  
</script>

<button on:click
  disabled={disabled}
  class="text-white space border-none outline-none bg-blue-600 rounded-sm select-none {$$props.class || ''}"
>
  <slot></slot>
</button>

<style type="text/postcss">

  .space {
    @apply py-1 px-3;
  }
  button[disabled] {
    opacity: 0.6;
    @apply cursor-not-allowed;
  }
  button:not([disabled]):hover {
    @apply bg-blue-400;
  }

</style>
