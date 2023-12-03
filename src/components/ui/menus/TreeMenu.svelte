
<script>

  import Tooltip from "components/common/Tooltip.svelte"
  import Checkbox from "components/common/Checkbox.svelte"
  import Button from "components/common/Button.svelte"
  import Collapsible from "components/common/Collapsible.svelte"

  import Icon from "fa-svelte"
  import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons/faExclamationTriangle"

  import Actions from "./layersMenu/Actions.svelte"
  import Options from "./layersMenu/Options.svelte"

  import { _ } from "state/locale"



  import { typeNames } from "data/editor/Platform"
  import { groups, platforms, decorations, shamanObjects, joints, images } from "state/sceneObjects"
  import highlight from "state/highlight"
  import { xml } from "state/xml"
  import * as selection from "state/selection"
  import { mapSettings } from "state/map"

  $: kilobytes = $xml.length / 1000

  $: shamanObjectsMaxCount = $mapSettings.defilante.enabled ? 200 : 40

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

  function onEntryClick(e, obj) {
    if(obj.selected)
      selection.unselect(obj)
    else
      selection.select(obj)
  }

</script>


<div class="form root"
     on:mouseleave={resetHighlight}
>

<!--   <div class="text-sm text-gray-200 text-center w-full mb-1">
    Size: ~<span class="font-mono">{kilobytes} kB</span>
  </div> -->

  <!-- Platforms -->

  <div class="layer">
    <Collapsible on:mouseover={e => setHighlight(e, $platforms.all)} forceCollapse={$platforms.all.length === 0}>
      <div slot="title" class="relative flex">
        <Options list={$platforms.all} group={groups.platforms} />
        <div class="title flex-grow ml-1">
          <span class="category-text">{$_("category-grounds")}</span>
          <div class="flex items-center count">
            {#if $platforms.all.length > 60}
            <Icon class="text-yellow-500 text-sm" icon={faExclamationTriangle}/>
            {/if}
            <span>{$platforms.all.length}<div class="count-max">/60</div></span>
          </div>
        </div>
        <Actions list={$platforms.all} />
      </div>

      {#each [
        [groups.platforms, $platforms.background.reverse(), "background"],
        [groups.platforms, $platforms.foreground.reverse(), "foreground"],
      ] as [group, list, key]}
        <Collapsible active={true} on:mouseover={e => setHighlight(e, list)}>
          <div slot="title">
            <span class="category-text-secondary">{$_(key)}</span>
          </div>
          <ol>
            {#each list as obj}
              <li class="entry-li relative flex items-center"
                  on:mouseover={e => setHighlight(e, [obj])}
                  on:click={e => onEntryClick(e, obj)}
              >
                <Options list={[obj]} group={group} />
                <div class="flex flex-grow items-center mx-1">
                  <span class="entry-text">{obj.index}</span>
                  <img class="w-3 h-3 rounded-sm " src="dist/grounds/{typeNames[obj.type]}.png" alt={typeNames[obj.type]} />
                  <span class="entry-text">&lt;{obj.type}&gt;</span>
                </div>
                <Actions list={[obj]}/>
              </li>
            {/each}
          </ol>
        </Collapsible>      
      {/each}
    </Collapsible>
  </div>

  <!-- Decorations -->

  <div class="layer">
    <Collapsible on:mouseover={e => setHighlight(e, $decorations.all)} forceCollapse={$decorations.all.length === 0}>
      <div slot="title" class="relative flex">
        <Options list={$decorations.all} group={groups.decorations} />
        <div class="title flex-grow ml-1">
          <span class="category-text">{$_("category-decorations")}</span>
          <div class="flex items-center count">
            {#if $decorations.all.length > 50}
            <Icon class="text-yellow-500 text-sm" icon={faExclamationTriangle}/>
            {/if}
            <span>{$decorations.all.length}<div class="count-max">/50</div></span>
          </div>
        </div>
        <Actions list={$decorations.all} />
      </div>

      {#each [
        [groups.decorations, $decorations.background.reverse(), "background"],
        [groups.decorations, $decorations.foreground.reverse(), "foreground"],
      ] as [group, list, key]}
        <Collapsible active={true} on:mouseover={e => setHighlight(e, list)}>
          <div slot="title">
            <span class="category-text-secondary">{$_(key)}</span>
          </div>
          <ol>
            {#each list as obj}
              <li class="entry-li relative flex items-center"
                  on:mouseover={e => setHighlight(e, [obj])}
                  on:click={e => onEntryClick(e, obj)}
              >
                <Options list={[obj]} group={group} />
                <div class="flex flex-grow items-center mx-1">
                  <span class="entry-text">{obj.index}</span>
                  <span class="entry-text">&lt;{obj.type}&gt;</span>
                </div>
                <Actions list={[obj]} />
              </li>
            {/each}
          </ol>
        </Collapsible>      
      {/each}
    </Collapsible>
  </div>


  <!-- Shaman Objects -->

  <div class="layer">
    <Collapsible on:mouseover={e => setHighlight(e, $shamanObjects.all)} forceCollapse={$shamanObjects.all.length === 0}>
      <div slot="title" class="relative flex">
        <Options list={$shamanObjects.all} group={groups.shamanObjects} />
        <div class="title flex-grow ml-1">
          <span class="category-text">{$_("shaman_objects")}</span>
          <div class="flex items-center count">
            {#if $shamanObjects.all.length > shamanObjectsMaxCount}
            <Icon class="text-yellow-500 text-sm" icon={faExclamationTriangle}/>
            {/if}
            <span>{$shamanObjects.all.length}<div class="count-max">/{shamanObjectsMaxCount}</div></span>
          </div>
        </div>
        <Actions list={$shamanObjects.all} />
      </div>

      {#each [
        [groups.shamanObjects, $shamanObjects.background.reverse(), "background"],
        [groups.shamanObjects, $shamanObjects.foreground.reverse(), "foreground"],
      ] as [group, list, key]}
        <Collapsible active={true} on:mouseover={e => setHighlight(e, list)}>
          <div slot="title">
            <span class="category-text-secondary">{$_(key)}</span>
          </div>
          <ol>
            {#each list as obj}
              <li class="entry-li relative flex items-center"
                  on:mouseover={e => setHighlight(e, [obj])}
                  on:click={e => onEntryClick(e, obj)}
              >
                <Options list={[obj]} group={group} />
                <div class="flex flex-grow items-center mx-1">
                  <span class="entry-text">{obj.index}</span>
                  <span class="entry-text">&lt;{obj.type}&gt;</span>
                </div>
                <Actions list={[obj]}/>
              </li>
            {/each}
          </ol>
        </Collapsible>      
      {/each}
    </Collapsible>
  </div>


  <!-- Images -->

  <div class="layer">
    <Collapsible on:mouseover={e => setHighlight(e, $images.all)} forceCollapse={$images.all.length === 0}>
      <div slot="title" class="relative flex">
        <Options list={$images.all} group={groups.images} />
        <div class="title flex-grow ml-1">
          <span class="category-text">{$_("category-images")}</span>
          <span class="count">{$images.all.length}</span>
        </div>
        <Actions list={$images.all} />
      </div>

      {#each [
        [groups.images, $images.background.reverse(), "background"],
        [groups.images, $images.foreground.reverse(), "foreground"],
        [groups.images, $images.disappearing.reverse(), "disappearing-images"],
      ] as [group, list, key]}
        <Collapsible active={true} on:mouseover={e => setHighlight(e, list)}>
          <div slot="title">
            <span class="category-text-secondary">{$_(key)}</span>
          </div>
          <ol>
            {#each list as obj}
              <li class="entry-li relative flex items-center"
                  on:mouseover={e => setHighlight(e, [obj])}
                  on:click={e => onEntryClick(e, obj)}
              >
                <Options list={[obj]} group={group} />
                <div class="flex flex-grow items-center mx-1">
                  <span class="entry-text">{obj.index}</span>
                  <span class="entry-text">&lt;{showImageUrl(obj.imageUrl.value)}&gt;</span>
                </div>
                <Actions list={[obj]}/>
              </li>
            {/each}
          </ol>
        </Collapsible>      
      {/each}
    </Collapsible>
  </div>


  <!-- Joints -->

  <div class="layer">
    <Collapsible on:mouseover={e => setHighlight(e, $joints.all)} forceCollapse={$joints.all.length === 0}>
      <div slot="title" class="relative flex">
        <Options list={$joints.all} group={groups.joints} />
        <div class="title flex-grow ml-1">
          <span class="category-text">{$_("category-joints")}</span>
          <span class="count">{$joints.all.length}</span>
        </div>
        <Actions list={$joints.all} />
      </div>

      {#each [
        [groups.joints, $joints.hidden.reverse(), "category-mechanics"],
        [groups.joints, $joints.background.reverse(), "background"],
        [groups.joints, $joints.foreground.reverse(), "foreground"],
      ] as [group, list, key]}
        <Collapsible active={true} on:mouseover={e => setHighlight(e, list)}>
          <div slot="title">
            <span class="category-text-secondary">{$_(key)}</span>
          </div>
          <ol>
            {#each list as obj}
              <li class="entry-li relative flex items-center"
                  on:mouseover={e => setHighlight(e, [obj])}
                  on:click={e => onEntryClick(e, obj)}
              >
                <Options list={[obj]} group={group} />
                <div class="flex flex-grow items-center mx-1">
                  <span class="entry-text">{obj.index}</span>
                  <span class="entry-text">&lt;{obj.type}&gt;</span>
                  {#if obj.color}
                    <div class="w-2 h-2 rounded-full" style="background: #{obj.color}"></div>
                  {/if}
                  <span class="entry-text">{obj.platform1} -&gt; {obj.platform2}</span>
                </div>
                <Actions list={[obj]}/>
              </li>
            {/each}
          </ol>
        </Collapsible>      
      {/each}
    </Collapsible>
  </div>

</div>


<style type="text/postcss">
  
  .category-text {
    @apply font-cursive text-sm font-medium text-gray-100 pt-1;
  }
  .category-text-secondary {
    @apply font-cursive text-xs font-normal text-gray-300;
  }

  .layer {
    background: rgba(0, 7, 20, 0.26);
    border: 1px solid rgba(0, 10, 26, 0.20);
    @apply rounded-sm mt-1;
  }
  .layer:hover {
    background: rgba(0, 7, 20, 0.36);
  }
  
  .title {
    @apply flex justify-between;
  }

  .count {
    @apply text-xs font-mono text-gray-200;
  }
  .count-max {
    @apply text-gray-500 inline;
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