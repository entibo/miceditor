
<script>

  import Checkbox from "components/common/Checkbox.svelte"
  import Tooltip from "components/common/Tooltip.svelte"


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

</script>

<div class="actions bg-gray-700 pl-2 absolute top-0 right-0 bottom-0 flex items-center text-sm"
     class:non-empty-list={list.length > 0}
     class:force-visible={locked !== false || hidden !== false || selected !== false}
>
  <Checkbox checked={locked} set={toggleLock} type="lock" class="mx-1"/>
  <Checkbox checked={hidden} set={toggleHidden} type="eye" class="mx-1"/>
  <Checkbox checked={selected} set={toggleSelect} class="mx-1"/>
</div>

<style>
  .actions {
    display: none;
    transition: 80ms;
    opacity: 0;
  }
  *:hover > .actions.non-empty-list, .actions.non-empty-list.force-visible {
    display: flex;
    opacity: 1;
  }
</style>