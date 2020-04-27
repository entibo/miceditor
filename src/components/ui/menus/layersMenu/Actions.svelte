
<script>
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher()

  import Checkbox from "components/common/Checkbox.svelte"
  import Tooltip from "components/common/Tooltip.svelte"

  import Icon from "fa-svelte"
  import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes"


  import { combine } from "common"
  import * as Selection from "state/selection"
  import { selection } from "state/selection"

  export let list
  export let group


  $: selected = ($selection, combine(list.map(obj => obj.selected)))
  function toggleSelect(value) {
    if(value)
      for(let obj of list)
        Selection.select(obj)
    else
      for(let obj of list)
        Selection.unselect(obj)
    group.invalidate()
  }

  $: hidden = combine(list.map(obj => !obj.visible))
  function toggleHidden(hidden) {
    for(let obj of list){
      obj.visible = !hidden
      obj.invalidate()
    }
    group.invalidate()
  }

  $: locked = combine(list.map(obj => !obj.interactive))
  function toggleLock(locked) {
    for(let obj of list){
      obj.interactive = !locked
      obj.invalidate()
    }
    group.invalidate()
  }

  function remove() {
    Selection.set(list)
    Selection.remove()
    dispatch("remove")
  }

</script>

<div class="form dense actions absolute top-0 right-0 flex items-center text-xs"
     class:force-visible={locked !== false || hidden !== false || selected !== false}
>
  <div class:hidden={list.length === 0} class="flex items-center">
    <Checkbox checked={selected} set={toggleSelect} />
    <Checkbox checked={hidden} set={toggleHidden} type="eye" />
    <Checkbox checked={locked} set={toggleLock} type="lock" />
  </div>
  <label class="icon-btn" on:click={remove}><Icon class="text-red-500" icon={faTimes}/></label>
</div>

<style>
  .actions {
    display: none;
    transition: 80ms;
    opacity: 0;
  }
  /* *:hover > .actions.non-empty-list, .actions.non-empty-list.force-visible { */
  *:hover > .actions, .actions.force-visible {
    display: flex;
    opacity: 1;
  }
</style>