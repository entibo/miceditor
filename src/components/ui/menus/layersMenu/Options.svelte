
<script>

  import Checkbox from "components/common/Checkbox.svelte"
  import Tooltip from "components/common/Tooltip.svelte"



  import { combine } from "common"
  import * as Selection from "state/selection"
  import { selection } from "state/selection"



  export let className = ""
  export { className as class}


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

<div class="form dense flex items-center text-xs {className}"
     class:empty-list={list.length === 0}
>
  <div class="item" class:non-default={selected !== false}>
    <Checkbox checked={selected} set={toggleSelect} />
  </div>
  <div class="item" class:non-default={hidden !== false}>
    <Checkbox checked={hidden} set={toggleHidden} type="eye" />
  </div>
  <div class="item" class:non-default={locked !== false}>
    <Checkbox checked={locked} set={toggleLock} type="lock" />
  </div>
</div>

<style>
  .empty-list {
    pointer-events: none;
  }
  .form > .item {
    opacity: 0.33;
  }
  :global(*:hover) > .form:not(.empty-list) > .item, .form:not(.empty-list) > .item.non-default {
    opacity: 1;
  }
</style>