
<script>

  import Tooltip from "components/common/Tooltip.svelte"
  import Checkbox from "components/common/Checkbox.svelte"
  import Button from "components/common/Button.svelte"
  import Collapsible from "components/common/Collapsible.svelte"

  /* import LayerGroup from "./layersMenu/LayerGroup.svelte" */
  import Actions from "./layersMenu/Actions.svelte"

  import { _ } from "state/locale"



  import { typeNames } from "data/editor/Platform"
  import { groups, platforms, decorations, shamanObjects, joints, images } from "state/sceneObjects"
  import highlight from "state/highlight"
  import xml from "state/xml"

  $: kilobytes = $xml.length / 1000

  const resetHighlight = () => 
    $highlight.size > 0 && ($highlight = new Set())

  function setHighlight(e, list) {
    e.preventDefault()
    e.stopPropagation()
    $highlight = new Set(list)
  }


  function showImageUrl(value) {
    return value.split("/").pop()
  }

</script>


<div class="form root"
     on:mouseleave={resetHighlight}
>

  <div class="text-sm text-gray-200 text-center w-full mb-1">
    Size: ~<span class="font-mono">{kilobytes} kB</span>
  </div>

  <!-- Platforms -->

  <Collapsible on:mouseover={e => setHighlight(e, $platforms.all)}>
    <div slot="title">
      <span>{$_("category-grounds")}</span>
      <span class="ml-1 text-xs text-gray-400">{$platforms.all.length}/50</span>
      <Actions list={$platforms.all} group={groups.platforms}/>
    </div>

    {#each [
      [groups.platforms, $platforms.background, "background"],
      [groups.platforms, $platforms.foreground, "foreground"],
    ] as [group, list, key]}
      <Collapsible on:mouseover={e => setHighlight(e, list)}>
        <div slot="title">
          <span>{$_(key)}</span>
          <Actions list={list} group={group}/>
        </div>
        <ol>
          {#each list as obj}
            <li class="relative flex items-center" on:mouseover={e => setHighlight(e, [obj])}>
              <img class="w-3 h-3 rounded-sm mr-1" src="dist/grounds/{typeNames[obj.type]}.png" alt={typeNames[obj.type]} />
              <span class="entry-text">[{obj.type}]</span>
              <Actions list={[obj]} group={group}/>
            </li>
          {/each}
        </ol>
      </Collapsible>      
    {/each}
  </Collapsible>

  <!-- Decorations -->

  <Collapsible on:mouseover={e => setHighlight(e, $decorations.all)}>
    <div slot="title">
      <span>{$_("category-decorations")}</span>
      <span class="ml-1 text-xs text-gray-400">{$decorations.all.length}/40</span>
      <Actions list={$decorations.all} group={groups.decorations}/>
    </div>

    {#each [
      [groups.decorations, $decorations.background, "background"],
      [groups.decorations, $decorations.foreground.concat($decorations.spawns), "foreground"],
    ] as [group, list, key]}
      <Collapsible on:mouseover={e => setHighlight(e, list)}>
        <div slot="title">
          <span>{$_(key)}</span>
          <Actions list={list} group={group}/>
        </div>
        <ol>
          {#each list as obj}
            <li class="relative" on:mouseover={e => setHighlight(e, [obj])}>
              <span class="entry-text">[{obj.type}]</span>
              <Actions list={[obj]} group={group}/>
            </li>
          {/each}
        </ol>
      </Collapsible>      
    {/each}
  </Collapsible>

  <!-- Shaman Objects -->

  <Collapsible on:mouseover={e => setHighlight(e, $shamanObjects.all)}>
    <div slot="title">
      <span>{$_("shaman_objects")}</span>
      <span class="ml-1 text-xs text-gray-400">{$shamanObjects.all.length}/30</span>
      <Actions list={$shamanObjects.all} group={groups.shamanObjects}/>
    </div>

    {#each [
      [groups.shamanObjects, $shamanObjects.background, "background"],
      [groups.shamanObjects, $shamanObjects.foreground, "foreground"],
    ] as [group, list, key]}
      <Collapsible on:mouseover={e => setHighlight(e, list)}>
        <div slot="title">
          <span>{$_(key)}</span>
          <Actions list={list} group={group}/>
        </div>
        <ol>
          {#each list as obj}
            <li class="relative" on:mouseover={e => setHighlight(e, [obj])}>
              <span class="entry-text">[{obj.type}]</span>
              <Actions list={[obj]} group={group}/>
            </li>
          {/each}
        </ol>
      </Collapsible>      
    {/each}
  </Collapsible>

  <!-- Images -->

  <Collapsible on:mouseover={e => setHighlight(e, $images.all)}>
    <div slot="title">
      <span>{$_("category-images")}</span>
      <span class="ml-1 text-xs text-gray-400">{$images.all.length}</span>
      <Actions list={$images.all} group={groups.images}/>
    </div>

    {#each [
      [groups.images, $images.background, "background"],
      [groups.images, $images.foreground, "foreground"],
      [groups.images, $images.disappearing, "disappearing-images"],
    ] as [group, list, key]}
      <Collapsible on:mouseover={e => setHighlight(e, list)}>
        <div slot="title">
          <span>{$_(key)}</span>
          <Actions list={list} group={group}/>
        </div>
        <ol>
          {#each list as obj}
            <li class="relative" on:mouseover={e => setHighlight(e, [obj])}>
              <span class="entry-text">{showImageUrl(obj.imageUrl.value)}</span>
              <Actions list={[obj]} group={group}/>
            </li>
          {/each}
        </ol>
      </Collapsible>      
    {/each}
  </Collapsible>

  <!-- Joints -->

  <Collapsible on:mouseover={e => setHighlight(e, $joints.all)}>
    <div slot="title">
      <span>{$_("category-joints")}</span>
      <span class="ml-1 text-xs text-gray-400">{$joints.all.length}</span>
      <Actions list={$joints.all} group={groups.joints}/>
    </div>

    {#each [
      [groups.joints, $joints.hidden, "category-mechanics"],
      [groups.joints, $joints.background, "background"],
      [groups.joints, $joints.foreground, "foreground"],
    ] as [group, list, key]}
      <Collapsible on:mouseover={e => setHighlight(e, list)}>
        <div slot="title">
          <span>{$_(key)}</span>
          <Actions list={list} group={group}/>
        </div>
        <ol>
          {#each list as obj}
            <li class="relative flex items-center" on:mouseover={e => setHighlight(e, [obj])}>
              {#if obj.color}
                <span class="w-2 h-2 rounded-full mr-1" style="background: #{obj.color}"></span>
              {/if}
              <span class="entry-text">[{obj.type}]: {obj.platform1} -> {obj.platform2}</span>
              <Actions list={[obj]} group={group}/>
            </li>
          {/each}
        </ol>
      </Collapsible>      
    {/each}
  </Collapsible>

</div>


<style>
  .root {
    
  }
  .entry-text {
    @apply font-mono text-xs text-gray-300;
  }
</style>