<script>

  let className = ""
  export {className as class}

  export let active = true
  export let title = ""

</script>


<div class="flex flex-col {className}" on:mouseover>

  <div class="flex items-center text-gray-200 hover:text-white cursor-pointer" class:active
       on:click={() => active = !active}
  >
    <div class="w-3 h-3 mr-2 arrow relative"></div>
    <div class="flex-grow relative">
      <slot name="title">
        <span class="text-sm">{title}</span>
      </slot>
      <div class="actions pl-2 absolute top-0 right-0 bottom-0">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>

  {#if active}
    <div class="flex">
      <div class="w-3 mr-2 guide relative"></div>
      <div class="flex-grow">
        <slot></slot>
      </div>
    </div>
  {/if}

</div>


<style>
  .actions {
    background: inherit;
  }
  .arrow:after {
    content: "";
    @apply absolute border-b border-r border-gray-400;
    width: 70%;
    height: 70%;
    transform-origin: 50% 50%;
    top: 50%;
    left: 50%;
    transform: translate(-70%, -50%) rotate(-45deg);
    transition: transform 100ms ease-in-out;
  }
  .active .arrow:after {
    transform: translate(-50%, -70%) rotate(45deg);
  }
  .guide:after {
    content: "";
    @apply absolute bg-gray-400;
    width: 1px;
    height: 100%;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 0);
  }
</style>