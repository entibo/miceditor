<script>

  import Icon from "fa-svelte"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"

  // import SortableList from "components/common/SortableList.svelte"
  import SortableList from "svelte-sortable-list"

  import Tooltip from "components/common/Tooltip.svelte"
  import Checkbox from "components/common/Checkbox.svelte"
  import Button from "components/common/Button.svelte"
  import Collapsible from "components/common/Collapsible.svelte"

  /* import LayerGroup from "./layersMenu/LayerGroup.svelte" */
  import Layer from "components/ui/menus/layersMenu/Layer.svelte"
  import AnimationListEntry from "components/ui/menus/layersMenu/AnimationListEntry.svelte"
  import Actions from "components/ui/menus/layersMenu/Actions.svelte"

  import { _ } from "state/locale"


  import { mapSettings, makeNewLayer, removeLayer, makeNewAnimation } from "state/map"
  import { groups, joints } from "state/sceneObjects"
  import highlight from "state/highlight"
  import * as selection from "state/selection"


  function onSort(e) {
    /* let fromIndex = items.findIndex(layer => layer.id === from.id)
    let toIndex   = items.findIndex(layer => layer.id === to.id)
    let tmp = $mapSettings.layer[from]
    $mapSettings */
    
    $mapSettings.layers = e.detail.flatMap(item =>
      item.layer
        ? item.layer
        : item.animation.frames
            .map(frame => $mapSettings.layers.find(layer => layer.id === frame.layerId)))
  }

  $: items = getItems($mapSettings.layers, $mapSettings.animations)
  function getItems(layers, animations) {
    let animationStartMap = {}
    for(let animation of animations) {
      let start = animation.frames[0].layerId
      animationStartMap[start] = animation
    }
    let items = []
    for(let i=0; i < layers.length;) {
      let layer = layers[i]
      let animation = animationStartMap[layer.id]
      if(animation) {
        items.push({
          animation,
          key: animation.id,
        })
        i += animation.frames.length
        continue
      }
      items.push({
        layer,
        key: layer.id,
      })
      i++
    }
    return items
  }
  

</script>



<div class="root">

  <div class="flex justify-between">
    <Button on:click={() => makeNewLayer()} class="flex items-center">
      <Icon icon={faPlus} class="text-xs"/>
      <span class="ml-1">Layer</span>
    </Button>
    <Button on:click={() => makeNewAnimation()} class="flex items-center">
      <Icon icon={faPlus} class="text-xs"/>
      <span class="ml-1">Animation</span>
    </Button>
  </div>

  <div class="mt-2"></div>

  <!-- <SortableList
    list={items}
    key="key"
    let:item={item}
    on:sort={onSort}
  >
  </SortableList> -->
  {#each items.reverse() as item (item.key)}
    {#if item.layer}
      <Layer layer={item.layer} />
    {:else}
      <AnimationListEntry animation={item.animation} />
    {/if}
    <div class="mb-1"></div>
  {/each}

</div>


<style>
  
</style>