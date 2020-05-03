

<script>
  import Icon from "fa-svelte"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"


  import Tooltip from "components/common/Tooltip.svelte"
  import TextInput from "components/common/TextInput.svelte"
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


  import { combine } from "common"
  import { mapSettings } from "state/map"
  import * as map from "state/map"
  import { groups, joints } from "state/sceneObjects"
  import highlight from "state/highlight"
  import * as selection from "state/selection"



  export let animation

  $: layerIds = animation.frames.map(frame => frame.layerId)
  $: current = layerIds.includes($mapSettings.currentLayerId)
  // $: layers = $mapSettings.layers.filter(layer => layerIds.includes(layer.id))
  $: list = $joints.all.filter(obj => layerIds.includes(obj.layerId))

  $: items = $mapSettings.layers.flatMap(layer => {
    let frame = animation.frames.find(frame => frame.layerId === layer.id)
    if(!frame) return []
    return { frame, layer }
  })

  $: frameDuration = combine(animation.frames.map(frame => frame.duration))
  function setFrameDuration(ms) {
    for(let frame of animation.frames) {
      frame.duration = ms
    }
    mapSettings.invalidate()
  }

  function setFramePlatform(frame, v) {
    if(v) map.addFrameBackgroundPlatform(frame)
    else map.removeFrameBackgroundPlatform(frame)
  }

  
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

  function onLayerRemoved(e) {
    let removedLayer = e.detail
    animation.frames = animation.frames.filter(frame => frame.layerId !== removedLayer.id)
    if(!animation.frames.length) {
      map.removeAnimation(animation.id)
    }
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
    <div slot="title" class="">
      <div class="flex">

        <Options list={list} group={groups.joints} />
        <div class="title flex-grow ml-1" on:click={e => onTitleClick(e)}>
          <LayerName name={animation.name || `Anim${animation.id}`} 
                     {current}
                     on:name={e => (animation.name = e.detail, mapSettings.invalidate())}
          />
          <span class="count" class:hidden={!animation.frames.length}>{animation.frames.length}</span>
        </div>
        <Actions list={list}
                on:remove={() => map.removeAnimation(animation.id)}
                add on:add={() => map.addAnimationFrame(animation.id)}
        />

      </div>
      <div class="form">
        <label>
          <span>
            Frame duration
            <span class="text-xs opacity-75">(ms)</span>
          </span>
          <div class="flex">
            <TextInput int min={10} sliderMin={20} sliderMax={5000} class="w-16" 
                       value={frameDuration} set={setFrameDuration}
            />
          </div>
        </label>
      </div>
    </div>

    <div class="mb-1"></div>

    {#each [...items].reverse() as { layer, frame }, idx (layer.id)}

      <Layer {layer} defaultName={`Frame${items.length-1-idx}`}
             on:duplicate={e => onLayerDuplicated(e)}
             on:remove={e => onLayerRemoved(e)}
      >
        <div slot="extra" class="form">
          <label>
            <span>Use platform</span>
            <Checkbox checked={frame.platform !== null} set={v => setFramePlatform(frame, v)}  />
          </label>
        </div>
      </Layer>

      <div class="mb-1"></div>
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