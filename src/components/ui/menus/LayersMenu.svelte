<script>

  import Icon from "fa-svelte"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"


  import Button from "components/common/Button.svelte"

  import Layer from "components/ui/menus/layersMenu/Layer.svelte"
  import AnimationListEntry from "components/ui/menus/layersMenu/AnimationListEntry.svelte"

  import { _ } from "state/locale"


  import { mapSettings } from "state/map"
  import { addLayer, addAnimation } from "state/layers"


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
    <Button on:click={() => addLayer()} class="flex items-center">
      <Icon icon={faPlus} class="text-xs"/>
      <span class="ml-1">{$_("layer")}</span>
    </Button>
    <Button on:click={() => addAnimation()} class="flex items-center">
      <Icon icon={faPlus} class="text-xs"/>
      <span class="ml-1">{$_("animation")}</span>
    </Button>
  </div>

  <div class="mt-2"></div>

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