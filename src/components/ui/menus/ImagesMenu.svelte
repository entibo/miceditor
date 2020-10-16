
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

  function updateImageUrl(imageUrl, v) {
    let {value,url} = Editor.Image.readUrl(v)
    imageUrl.value = value
    imageUrl.url = url
    $imagePalette = $imagePalette
    if(imageUrl === activeImageUrl)
      creation.invalidate()
  }

</script>

<div class="form flex flex-col justify-between">

  <div class="flex flex-wrap justify-center">

    {#each $imagePalette as imageUrl}
      <Tooltip hoverable right noStyle
          inDelay={imageUrl.value === "" && imageUrl === activeImageUrl ? 0 : 500} 
          active={imageUrl.value === "" && imageUrl === activeImageUrl ? true : undefined}
      >

        <div slot="tooltip" class="opacity-95 hover:opacity-100 border-4 border-gray-800 tabContent">
          <div bind:this={editingElement} class="form" >
            <label>
              <span class="incompressible">Url</span>
              <TextInput bind:value={imageUrl.value} set={v => updateImageUrl(imageUrl, v)} 
                         class="w-64"
              />
            </label>
          </div>
        </div>
        
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

      </Tooltip>
    {/each}

    <Tooltip title={$_("button-add")}>
      <div class="tile dim-40 rounded-sm active opacity-50 hover:opacity-100"
            on:click={addImageUrl}
      >
        <Icon icon={faPlus} />
      </div>
    </Tooltip>

  </div>

  <div class="flex flex-wrap justify-center">
    <a href="http://derpolino.alwaysdata.net/imagetfm/" target="_blank">
      <Tooltip title="Atelier801 Images Database">
        <Button class="text-xs flex items-center">
          Browse
          <Icon icon={faExternalLinkAlt} class="ml-1"/>
        </Button>
      </Tooltip>
    </a>
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
