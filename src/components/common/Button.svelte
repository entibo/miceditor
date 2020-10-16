<script>

  export let disabled = false
  export let red

  let className = ""
  export {className as class}
  
</script>

<button on:click
  disabled={disabled}
  class="text-white px-2 border-none outline-none rounded-sm select-none {className}"
  class:red={red}
>
  <slot></slot>
</button>

<style type="text/postcss">
  button {
    transition: 60ms;
    min-height: 1.25rem;
    @apply bg-blue-600;
  }
  button.red {
    @apply bg-red-600;
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
  button.red:not([disabled]):hover {
    @apply bg-red-500;
  }
  button.red:not([disabled]):active {
    @apply bg-red-700 text-gray-200;
  }

</style>
