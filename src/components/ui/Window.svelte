
<script>

import Icon from "fa-svelte"
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes"

import TabContent from "/components/ui/TabContent.svelte"

import * as layout from "/state/layout"
import { closeWindow } from "/state/layout"
import { windowTitleMouseDown, windowPanelMouseDown } from "/components/scene/interaction"

import { _ } from "/state/locale"


export let window

$: titleName = $_(layout.tabToLocaleKey[window.tab])

</script>


<div class="window absolute top-0 left-0 flex flex-col overflow-hidden rounded-sm shadow-md" 
     style="transform: translate({window.x}px, {window.y}px); 
            width: {window.width}px; 
            height: {window.height}px;"
     on:mousedown={() => windowPanelMouseDown(window)}
>
  <div class="flex items-center justify-between items-center cursor-move bg-gray-800 p-1"
       on:mousedown={e => windowTitleMouseDown(e, window)}
  >
    <div class="tab active">
      {titleName}
    </div>
    <div class="cursor-pointer text-red-500 text-md"
      on:click|stopPropagation={() => closeWindow(window)}
    >
      <Icon icon={faTimes} />
    </div>
  </div>
  <div class="tabContent"
       on:mousedown|stopPropagation
  >
    <TabContent tab={window.tab} />
  </div>
</div>


<style lang="postcss">
  .window {
    opacity: 0.95;
  }
</style>