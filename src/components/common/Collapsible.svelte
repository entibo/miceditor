<script>

  let className = ""
  export {className as class}

  export let active = false
  export let forceCollapse = false
  export let title = ""

  $: collapsed = !active || forceCollapse

</script>


<div class="flex flex-col {className}" on:mouseover>

  <div class="flex items-center text-gray-200 hover:text-white cursor-pointer" class:active={!collapsed}>
    <div class="w-5 h-5 arrow relative" on:click={() => active = !active}></div>
    <div class="flex-grow leading-4">
      <slot name="title">
        <span class="text-sm">{title}</span>
      </slot>
    </div>
  </div>

  {#if !collapsed}
    <div class="flex">
      <div class="w-5 guide relative"></div>
      <div class="flex-grow">
        <slot></slot>
      </div>
    </div>
  {/if}

</div>


<style>
  .arrow:after {
    content: "";
    @apply absolute border-b border-r border-gray-400;
    width: 40%;
    height: 40%;
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