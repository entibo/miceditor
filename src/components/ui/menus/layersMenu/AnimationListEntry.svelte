

<script>
  import Icon from "fa-svelte"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"


  import Tooltip from "components/common/Tooltip.svelte"
  import Checkbox from "components/common/Checkbox.svelte"
  import Button from "components/common/Button.svelte"
  import Collapsible from "components/common/Collapsible.svelte"
  import SortableList from "svelte-sortable-list"

  /* import LayerGroup from "./layersMenu/LayerGroup.svelte" */
  import Options from "components/ui/menus/layersMenu/Options.svelte"
  import Actions from "components/ui/menus/layersMenu/Actions.svelte"
  import LayerName from "components/ui/menus/layersMenu/LayerName.svelte"
  import Layer from "components/ui/menus/layersMenu/Layer.svelte"

  import { _ } from "state/locale"


  import { mapSettings } from "state/map"
  import * as map from "state/map"
  import { groups, joints } from "state/sceneObjects"
  import highlight from "state/highlight"
  import * as selection from "state/selection"



  export let animation

  $: layerIds = animation.frames.map(frame => frame.layerId)
  $: current = layerIds.includes($mapSettings.currentLayerId)
  $: layers = $mapSettings.layers.filter(layer => layerIds.includes(layer.id))
  $: list = $joints.all.filter(obj => layerIds.includes(obj.layerId))

  
  function onSort(e) {
    let layers = e.detail
    $mapSettings
  }


  const resetHighlight = () => 
    $highlight.size > 0 && ($highlight = new Set())

  function setHighlight(e, list) {
    e.preventDefault()
    e.stopPropagation()
    $highlight = new Set(list)
  }

  function onTitleClick(e, layerId) {
    e.stopPropagation()
  }

  function onLayerRemoved() {
    if(animation.frames.length === 1)
      map.removeAnimation(animation.id)
  }
  function onLayerDuplicated(e) {
    let {layer, newLayer} = e.detail
    let duration = animation.frames.find(frame => frame.layerId === layer.id).duration
    animation.frames.push({
      layerId: newLayer.id,
      duration,
    })
  }

</script>


<div class="animation" on:mouseleave={resetHighlight}>
  <Collapsible active on:mouseover={e => setHighlight(e, list)}>
    <div slot="title" class="relative">
      <div class="flex">

        <Options list={list} group={groups.joints} />
        <div class="title flex-grow ml-1" on:click={e => onTitleClick(e)}>
          <LayerName name={animation.name || `Anim${animation.id}`} 
                     {current}
                     on:name={name => (animation.name = name, mapSettings.invalidate())}
          />
          <span class="count" class:hidden={!list.length}>{list.length}</span>
        </div>
        <Actions list={list}
                on:remove={() => map.removeAnimation(animation.id)}
                add on:add={() => map.addAnimationFrame(animation.id)}
        />

      </div>
    </div>



    {#each layers as layer}
      <Layer {layer} 
             on:duplicate={e => onLayerDuplicated(e)}
             on:remove={e => onLayerRemoved(e)}
      />
    {/each}
  </Collapsible>      
</div>



<style>
  
  .animation {
    background: rgba(0, 7, 20, 0.26);
    border: 1px solid rgba(0, 10, 26, 0.20);
    @apply rounded-sm;
  }
  .animation:hover {
    background: rgba(0, 7, 20, 0.36);
  }
    
  .title {
    @apply flex justify-between pt-1;
  }


  .count {
    @apply text-xs font-mono text-gray-200 mr-2;
  }
  .animation:hover .count {
    display: none;
  }

</style>