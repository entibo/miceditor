<script>
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher()

  import Icon from "fa-svelte"

  import Tooltip from "components/common/Tooltip.svelte"
  import Checkbox from "components/common/Checkbox.svelte"
  import Button from "components/common/Button.svelte"
  import Collapsible from "components/common/Collapsible.svelte"

  /* import LayerGroup from "./layersMenu/LayerGroup.svelte" */
  import Options from "components/ui/menus/layersMenu/Options.svelte"
  import Actions from "components/ui/menus/layersMenu/Actions.svelte"
  import LayerName from "components/ui/menus/layersMenu/LayerName.svelte"

  import { _ } from "state/locale"


  import { mapSettings } from "state/map"
  import * as map from "state/map"
  import { groups, joints } from "state/sceneObjects"
  import * as sceneObjects from "state/sceneObjects"
  import highlight from "state/highlight"
  import * as selection from "state/selection"



  export let layer
  export let defaultName = null

  $: current = $mapSettings.currentLayerId === layer.id
  $: list = $joints.all.filter(obj => obj.layerId === layer.id)


  const resetHighlight = () => 
    $highlight.size > 0 && ($highlight = new Set())

  function setHighlight(e, list) {
    e.preventDefault()
    e.stopPropagation()
    $highlight = new Set(list)
  }

  function onTitleClick(e, layerId) {
    e.stopPropagation()
    $mapSettings.currentLayerId = layerId
  }

  function onEntryClick(e, obj) {
    selection.clear()
    selection.select(obj)
  }

  function removeLayer() {
    map.removeLayer(layer.id)
    dispatch("remove", layer)
  }
  function duplicateLayer() {
    let newLayer = map.duplicateLayer(layer.id)
    dispatch("duplicate", { layer, newLayer })
  }

  function onDrop(srcIndex, tgtIndex) {
    console.log(srcIndex, tgtIndex)
    let srcJoint = sceneObjects.groups.joints[srcIndex]
    srcJoint.layerId = layer.id
    sceneObjects.setIndex(srcJoint, tgtIndex)
  }

</script>


<div class="layer" on:mouseleave={resetHighlight}>
  <Collapsible  on:mouseover={e => setHighlight(e, list)}>
    <div slot="title" class="relative">
      <div class="flex"
           on:dragenter|preventDefault
           on:dragover|preventDefault
           on:drop|preventDefault={e => onDrop(e.dataTransfer.getData("source"), list[0].index)}
      >

        <Options list={list} group={groups.joints} />
        <div class="title flex-grow ml-1" on:click={e => onTitleClick(e, layer.id)}>
          <LayerName name={layer.name || defaultName || `Layer${layer.id}`} 
                     {current}
                     on:name={e => (layer.name = e.detail, mapSettings.invalidate())}
          />
          <span class="count" class:hidden={!list.length}>{list.length}</span>
        </div>
        <Actions list={list}
                on:remove={removeLayer}
                duplicate on:duplicate={duplicateLayer}
        />

      </div>
    </div>
    <ol class="mt-1">
      {#each list.reverse() as obj}
        <li class="entry-li flex" 
            on:mouseover={e => setHighlight(e, [obj])} 
            draggable="true"
            on:dragstart={e => (e.dataTransfer.setData("source", obj.index), e.dataTransfer.effectAllowed = "move")}
            on:dragenter|preventDefault
            on:dragover|preventDefault
            on:drop|preventDefault={e => onDrop(e.dataTransfer.getData("source"), obj.index)}
        >
          
          <Options list={[obj]} group={groups.joints} />
          <div class="flex flex-grow items-center ml-1" on:click={e => onEntryClick(e, obj)} >
            <span class="entry-text mr-1">{obj.index}</span>
            <span class="w-2 h-2 mr-1">
              {#if obj.color}
                <div class="w-2 h-2 rounded-full mr-1" style="background: #{obj.color}"></div>
              {/if}
            </span>
            <span class="entry-text">{"<" + obj.type + ">"}</span>
          </div>
          <Actions list={[obj]} />

        </li>
      {/each}
    </ol>
  </Collapsible>      
</div>


<style>


  .layer {
    background: rgba(0, 7, 20, 0.26);
    border: 1px solid rgba(0, 10, 26, 0.20);
    @apply rounded-sm;
  }
  .layer:hover {
    background: rgba(0, 7, 20, 0.36);
  }
  
  .title {
    @apply flex justify-between pt-1;
  }

  .count {
    @apply text-xs font-mono text-gray-200 mr-2;
  }
  .layer:hover .count {
    display: none;
  }

  .entry-li {
    @apply leading-4 cursor-pointer relative;
    padding: 0.1rem 0;
  }
  .entry-text {
    @apply font-mono text-xs text-gray-300;
  }
  .entry-li:hover .entry-text {
    @apply text-white;
  }
</style>