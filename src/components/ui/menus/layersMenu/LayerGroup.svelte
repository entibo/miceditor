
<script>

  import Tooltip from "components/common/Tooltip.svelte"
  import Checkbox from "components/common/Checkbox.svelte"
  import Button from "components/common/Button.svelte"
  import Collapsible from "components/common/Collapsible.svelte"

  export let list
  export let children = undefined

</script>


<Collapsible title="Foo">

  <div slot="title" class="relative flex items-center">
    <span>Bar</span>
    <span class="ml-1 text-xs text-gray-400">{list.length}/50</span>
  </div>

  <div slot="actions" class="flex items-center">

  </div>

  {#if children}

    {#each children as childList}
      <svelte:self list={childList}/>
    {/each}

  {:else}



  {/if}

</Collapsible>



<style>
</style>