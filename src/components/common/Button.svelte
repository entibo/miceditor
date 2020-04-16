<script>

  export let disabled = false

  let className = ""
  export {className as class}
  
</script>

<button on:click
  disabled={disabled}
  class="bg-blue-600 text-white px-2 border-none outline-none rounded-sm select-none {className}"
>
  <slot></slot>
</button>

<style type="text/postcss">
  button {
    transition: 60ms;
  }
  button[disabled] {
    opacity: 0.6;
    @apply cursor-not-allowed;
  }
  button:not([disabled]):hover {
    @apply bg-blue-500;
  }
  button:not([disabled]):active {
    @apply bg-blue-700 text-gray-200;
  }

</style>
