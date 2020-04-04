
<script>
  
  import TabContent from "/components/ui/TabContent.svelte"

  import * as layout from "/state/layout"
  import { tabMovement } from "/state/layout"
  
  import { _ } from "/state/locale"

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
    if(newPanelSize >= 180) {
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

        {#if $tabMovement.active}
          <div class="group dummy-group tabContent {direction}"
              class:target={$tabMovement.active && $tabMovement.target.type === "newGroup" && $tabMovement.target.panelName === panelName && $tabMovement.target.groupIndex === groupIndex}
              on:mousemove={() => layout.setTabMovementTarget({ type: "newGroup", panelName, groupIndex })}
          ></div>
        {/if}

        <div class="group flex flex-col overflow-hidden" class:flex-grow={group.activeTab}
            class:target={$tabMovement.active && $tabMovement.target.type === "group" && $tabMovement.target.panelName === panelName && $tabMovement.target.groupIndex === groupIndex}
            on:mousemove={() => layout.setTabMovementTarget({ type: "group", panelName, groupIndex })}
        >
          <div class="tabList">
            {#each group.tabs as tab}
            <div class="tab cursor-pointer" class:active={tab === group.activeTab}
                on:click={() => layout.selectTab(panelName,groupIndex,tab)}
                on:mousedown={e => layout.tabMouseDown(e, panelName,groupIndex,tab)}
            >
              {$_(layout.tabToLocaleKey[tab])}
            </div>
            {/each}
          </div>
          <div class="tabContent">
            {#if group.activeTab}
            <TabContent tab={group.activeTab} />
            {/if}
          </div>
        </div>
        
    {/each}

    {#if $tabMovement.active}
      <div class="group dummy-group tabContent {direction}"
           class:target={$tabMovement.active && $tabMovement.target.type === "newGroup" && $tabMovement.target.panelName === panelName && $tabMovement.target.groupIndex === panel.groups.length}
           on:mousemove={() => layout.setTabMovementTarget({ type: "newGroup", panelName, groupIndex: panel.groups.length })}
      ></div>
    {/if}
    
  </div>

{:else if $tabMovement.active}

  <div class="panel dummy-panel {direction}"
       class:target-inner={$tabMovement.active && $tabMovement.target.type === "newGroup" && $tabMovement.target.panelName === panelName && $tabMovement.target.groupIndex === 0}
       on:mousemove={() => layout.setTabMovementTarget({ type: "newGroup", panelName, groupIndex: 0 })}
  ></div>

{/if}



<style lang="postcss">
  .dummy-group, .dummy-panel {
    min-width: 0 !important;
    min-height: 0 !important;
    flex-grow: 0 !important;
  }
  .dummy-group.vertical {
    @apply h-6;
  }
  .dummy-group.horizontal {
    @apply w-6;
  }
  .dummy-panel.vertical {
    @apply w-6;
  }
  .dummy-panel.horizontal {
    @apply h-6;
  }
</style>