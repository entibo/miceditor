<script>

  import Icon from "fa-svelte"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"

  import SortableList from "svelte-sortable-list"

  import Tooltip from "components/common/Tooltip.svelte"
  import Checkbox from "components/common/Checkbox.svelte"
  import Button from "components/common/Button.svelte"
  import Collapsible from "components/common/Collapsible.svelte"

  /* import LayerGroup from "./layersMenu/LayerGroup.svelte" */
  import Actions from "./layersMenu/Actions.svelte"

  import { _ } from "state/locale"


  import { mapSettings, newLayer, removeLayer } from "state/map"
  import { groups, joints } from "state/sceneObjects"
  import highlight from "state/highlight"
  import * as selection from "state/selection"


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

  function onSort(e) {
    let newList = e.detail
    console.log([
      $mapSettings.layers,
      newList
    ].map(list => list.map(layer => layer.id)))
    $mapSettings.layers = newList
  }

  $: lists = $mapSettings.layers.map(layer =>
        $joints.all.filter(obj => obj.layerId === layer.id))

  function getLayerName(layer) {
    return layer.name ? layer.name : `Layer${layer.id}`
  }

</script>



<div class="root"
     on:mouseleave={resetHighlight}
>

  <!-- {#each $mapSettings.layers as layer, layerIndex} -->
  <SortableList
    list={$mapSettings.layers}
    key="id"
    let:item={layer}
    let:index={layerIndex}
    on:sort={onSort}
  >
    <div class="layer">
      <Collapsible  on:mouseover={e => setHighlight(e, lists[layerIndex])}>
        <div slot="title" class="relative">
          <div class="title" on:click={e => onTitleClick(e, layer.id)}>
            <span class="title-text" class:current={$mapSettings.currentLayerId === layer.id}
                  contenteditable="true"
                  on:input={e => $mapSettings.layers[layerIndex].name = e.target.textContent}
            >
              {getLayerName(layer)}
            </span>
            <span class="count" class:hidden={!lists[layerIndex].length}>{lists[layerIndex].length}</span>
          </div>
          <Actions list={lists[layerIndex]} group={groups.joints} on:remove={() => removeLayer(layer.id)}/>
        </div>
        <ol>
          {#each lists[layerIndex] as obj}
            <li on:mouseover={e => setHighlight(e, [obj])} class="entry-li">
              <div on:click={e => onEntryClick(e, obj)} class="flex items-center">
                {#if obj.color}
                  <span class="w-2 h-2 rounded-full mr-1" style="background: #{obj.color}"></span>
                {/if}
                <span class="entry-text">[{obj.type}]: {obj.platform1} -> {obj.platform2}</span>
              </div>
              <Actions list={[obj]} group={groups.joints}/>
            </li>
          {/each}
        </ol>
      </Collapsible>      
    </div>
  </SortableList>
  <!-- {/each} -->
  
  <Button on:click={newLayer} class="mt-2 flex items-center">
    <Icon icon={faPlus} class="text-xs"/>
    <span class="ml-1">Layer</span>
  </Button>

</div>


<style>
  .layer {
    background: rgba(0, 7, 20, 0.26);
    border: 1px solid rgba(0, 10, 26, 0.20);
    @apply rounded-sm;
    margin-top: -1px;
    margin-bottom: -1px;
  }
  .layer:hover {
    background: rgba(0, 7, 20, 0.36);
  }
  
  .title {
    @apply flex justify-between py-1;
  }
  .title-text {
    @apply font-cursive text-sm font-thin text-gray-300;
  }
  .title:hover .title-text {
    @apply text-white font-bold;
  }
  .title-text.current {
    @apply text-white font-bold text-base;
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