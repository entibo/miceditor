
<script>

import Icon from "fa-svelte"
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes"

import TabContent from "components/ui/TabContent.svelte"

import * as layout from "state/layout"
import { closeWindow } from "state/layout"
import { windowTitleMouseDown, windowPanelMouseDown, windowBottomMouseDown } from "state/interaction"

import { _ } from "state/locale"


export let window
export let z

$: titleName = $_(layout.tabToTranslationId[window.tab])

</script>


<div class="window absolute top-0 left-0 flex flex-col shadow-md" 
     style="transform: translate({Math.round(window.x)}px, {Math.round(window.y)}px); 
            width: {window.width}px; 
            height: {window.height}px;
            z-index: {z};"
     on:wheel|stopPropagation
     on:mousedown|stopPropagation={() => windowPanelMouseDown(window)}
>
  <div class="flex items-center justify-between cursor-move bg-gray-800 rounded-t-sm px-1"
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

  <div class="tabContent">
    <TabContent tab={window.tab} />
  </div>

  <div class="w-full bottom-thing bg-gray-800 rounded-b-sm text-right"
       on:mousedown={e => windowBottomMouseDown(e, window)}
  ></div>

</div>


<style lang="postcss">
  .window {
    opacity: 0.95;
  }
  .bottom-thing {
    min-height: 1rem;
    max-height: 1rem;
    cursor: nwse-resize;
  }
</style>