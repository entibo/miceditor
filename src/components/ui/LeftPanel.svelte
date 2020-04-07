
<script>
  import { layoutConfig } from "state/layout"



</script>


{#if $layoutConfig.left.groups.length}
<div class="panel relative bg-gray-200 p-4 h-full flex flex-col" style="width: {$layoutConfig.left.size}px">
  {#each $layoutConfig.left.groups as group}
  <div class="group w-full border border-white bg-gray-500 flex flex-col" 
       style={group.size === 0 ? "flex-grow: 1" : `height: ${group.size}px`}>
    <div class="tabList h-8 flex">
      {#each group.tabs as tab}
      <div class="tab border border-gray-800 bg-gray-700" class:bg-gray-400={tab === group.activeTab}>{tab}</div>
      {/each}
    </div>
    <div class="tabContent flex-grow bg-green-300">
      {group.activeTab}'s content
    </div>
  </div>
  {/each}
</div>
{/if}

<style lang="postcss">

</style>