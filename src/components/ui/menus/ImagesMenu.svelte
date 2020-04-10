
<script>
  import { tick } from "svelte"
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"
  import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes"
  import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons/faExternalLinkAlt"

  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"

  import * as Editor from "data/editor/index"

  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import { imagePalette } from "state/user"

  import { _ } from "state/locale"


  let editingElement

  $: activeImageUrl = $creation.enabled && $creation.creationType === "IMAGE"
        ? $creation.imageUrl
        : null

  async function addImageUrl() {
    let newImageUrl = { value: "", url: "" }
    $imagePalette = [...$imagePalette, newImageUrl]

    Creation.disable()
    Creation.setImage(newImageUrl)

    if(editingElement) {
      await tick()
      editingElement.scrollIntoView()
      let input = editingElement.querySelector("input")
      if(input) input.focus()
    }
  }

  function removeImageUrl(imageUrl) {
    $imagePalette = $imagePalette.filter(b => b !== imageUrl)
    if(imageUrl === activeImageUrl)
      Creation.disable()
  }

  function updateActiveImageUrl() {
    let {value,url} = Editor.Image.readUrl(activeImageUrl.value)
    activeImageUrl.value = value
    activeImageUrl.url = url
    $imagePalette = $imagePalette
    creation.invalidate()
  }

</script>

<div class="form">

  <div class="flex flex-wrap justify-center">

    {#each $imagePalette as imageUrl}
      <div class="tile outline-outside dim-40 bg-tfm-blue rounded-sm overflow-hidden relative" 
          class:active={imageUrl === activeImageUrl}
          on:click={() => Creation.setImage(imageUrl)}
      >
        
        <img class="dim-max-40" src={imageUrl.url} alt={imageUrl.value} />
        
        <div class="image-remove"
            on:click|preventDefault|stopPropagation={() => removeImageUrl(imageUrl)}
        >
          <Icon icon={faTimes} />
        </div>
        
      </div>
    {/each}

    <Tooltip title={$_("button-add")}>
      <div class="tile dim-40 rounded-sm active opacity-50 hover:opacity-100"
            on:click={addImageUrl}
      >
        <Icon icon={faPlus} />
      </div>
    </Tooltip>

  </div>

  <div class="mb-2"></div>

  <div bind:this={editingElement} >
    {#if activeImageUrl}
      <div transition:fly={{duration: 80, x:50}} class="flex flex-wrap justify-center items-center">

        <div class="p-2" >
          <label>
            <span>Url</span>
            <TextInput bind:value={activeImageUrl.value} on:input={updateActiveImageUrl} />
          </label>
        </div>

        <a href="http://derpolino.alwaysdata.net/imagetfm/" target="_blank">
          <Button class="text-xs flex items-center">
            <span class="mr-1">Atelier801 Images Database</span>
            <Icon icon={faExternalLinkAlt} />
          </Button>
        </a>

      </div>
    {/if}
  </div>

</div>


<style lang="postcss">
  .image-remove {
    @apply absolute text-red-600 text-sm;
    top: -6px;
    right: 0;
    transition: opacity 70ms;
    opacity: 0;
  }
  .tile:hover .image-remove {
    opacity: 1;
  }
</style>
