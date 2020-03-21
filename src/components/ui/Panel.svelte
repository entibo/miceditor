
<script>
  
  import TabContent from "/components/ui/TabContent.svelte"

  import * as layout from "/state/layout"
  import { tabMovement } from "/state/layout"
  

  export let panel
  export let panelName 
  export let direction
  export let resize

  $: dimensionName = direction === "horizontal" ? "height" : "width"

  $: clickedTab = null


  let resizeActionPosition = null
  function onMouseMove(e) {
    if(!resizeActionPosition) return
    let delta = direction === "vertical" 
      ? e.x - resizeActionPosition.x
      : e.y - resizeActionPosition.y
    if(resize === "left" || resize === "top") delta = -delta
    let newPanelSize = panel.size + delta
    if(newPanelSize >= 200) {
      panel.size = newPanelSize
      resizeActionPosition = e
    }
  }

  $: resizeClasses = {
    left:  "w-4 h-full left-0 top-0 bottom-0",
    right: "w-4 h-full right-0 top-0 bottom-0",
    top:   "h-4 w-full top-0 left-0 right-0",
  }[resize]

</script>

<svelte:window 
  on:mouseup={() => resizeActionPosition = null}
  on:mouseleave={() => resizeActionPosition = null}
  on:mousemove={onMouseMove}
/>


{#if panel.groups.length}

<div class="panel relative flex {direction}" style="max-{dimensionName}: {panel.size}px; min-{dimensionName}: {panel.size}px">

  <div class="absolute {resizeClasses}"
       style="cursor: {direction === "vertical" ? "ew" : "ns"}-resize;"
       on:mousedown={e => resizeActionPosition = e}
  ></div>

  {#each panel.groups as group, groupIndex}
    {#if group.tabs.length}
      <div class="group relative flex flex-col flex-grow overflow-hidden"
           class:target={$tabMovement.active && $tabMovement.target.panel === panelName && $tabMovement.target.groupIndex === groupIndex}
          on:mousemove={() => layout.tabMouseMoveOverGroup(panelName, groupIndex)}
      >
        <div class="tabList">
          {#each group.tabs as tab}
          <div class="tab cursor-pointer" class:active={tab === group.activeTab}
              on:click={() => layout.selectTab(panelName,groupIndex,tab)}
              on:mousedown={e => layout.tabMouseDown(e, panelName,groupIndex,tab)}
          >
            {tab}
          </div>
          {/each}
        </div>
        <div class="tabContent">
          <TabContent tab={group.activeTab} />
        </div>
      </div>
    {:else}
      <div class="group dummy-group tabContent {direction === "vertical" ? "h-6" : "w-6"}"
           class:target={$tabMovement.active && $tabMovement.target.panel === panelName && $tabMovement.target.groupIndex === groupIndex}
           on:mousemove={() => layout.tabMouseMoveOverGroup(panelName, groupIndex)}
      ></div>
    {/if}
  {/each}
</div>

{/if}

<style lang="postcss">
  .dummy-group {
    flex-grow: 0 !important;
    opacity: 0.8;
  }

</style>