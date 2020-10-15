
<script>
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher()

  import Tooltip from "components/common/Tooltip.svelte"

  import Icon from "fa-svelte"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"
  import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes"
  import { faClone } from "@fortawesome/free-solid-svg-icons/faClone"


  import * as Selection from "state/selection"

  export let className = ""
  export { className as class}


  export let list

  export let add = false
  export let duplicate = false

  function addLayer() {
    dispatch("add")
  }
  function duplicateLayer() {
    dispatch("duplicate")
  }

  function removeLayer() {
    Selection.set(list)
    Selection.remove()
    dispatch("remove")
  }

</script>

<div class="form dense hidden items-center text-xs {className}">
  {#if add}
    <label class="icon-btn" on:click={(addLayer)}><Icon class="text-green-500" icon={faPlus}/></label>
  {/if}
  {#if duplicate}
    <label class="icon-btn" on:click={(duplicateLayer)}><Icon class="text-green-500" icon={faClone}/></label>
  {/if}
  <label class="icon-btn" on:click={removeLayer}><Icon class="text-red-500" icon={faTimes}/></label>
</div>

<style>
  :global(*:hover) > .hidden {
    display: flex;
  }
</style>