<script>
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faEye } from "@fortawesome/free-solid-svg-icons/faEye"
  import { faEyeSlash } from "@fortawesome/free-solid-svg-icons/faEyeSlash"
  import { faTrashAlt as faTrash } from "@fortawesome/free-solid-svg-icons/faTrashAlt"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"

  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"

  import { settings, visibility, buildXML, highlightedObject, _ } from "stores/stores.js"
  import { encodeMapData } from "xml-utils.ts"

  export let which
  export let title

  $: data = $settings

  function updateSettings() {
    encodeMapData(data)
    buildXML()
    settings.update(v => v)
  }
  
  let imageIndexToBeMoved = -1
  const defaultImageTargetPosition = { index: -1, after: true }
  let imageTargetPosition = defaultImageTargetPosition

  function mouseMove(e, index) {
    if(imageIndexToBeMoved < 0) return
    
    imageTargetPosition.index = index
    
    let elem = e.target
    while(!elem.classList.contains("indented") && elem.parentElement) {
      elem = elem.parentElement
    }
    if(!elem) return
    
    let {y,height} = elem.getBoundingClientRect()
    let dy = (e.y-y)/height
    if(dy >= 0.5) imageTargetPosition.after = true
    else imageTargetPosition.after = false
  }

  window.addEventListener("mouseup", () => {
    if(imageIndexToBeMoved < 0) return
    
    let list = data["_"+which]
    
    let src = list[imageIndexToBeMoved]
    
    let offset = imageTargetPosition.after ? 1 : 0
    let k = imageTargetPosition.index + offset
    
    list.splice(k, 0, Object.assign({}, src))
    list.splice(list.indexOf(src), 1)

    updateSettings()
    
    imageTargetPosition = defaultImageTargetPosition
    imageIndexToBeMoved = -1
  })
  window.addEventListener("mouseleave", () => {
    imageTargetPosition = defaultImageTargetPosition
	imageIndexToBeMoved = -1
  })


</script>


<section class="flex-col">
  <div class="text-sm text-gray-100 w-full flex justify-between">
    <span>{title}</span>
    <div class="flex">
      <Tooltip inline title={$_("button-add")}>
        <div class="cursor-pointer text-green-500"
          on:click={() => {
            $settings["_"+which].push({url:"",x:0,y:0})
            updateSettings()
          }}
        >
          <Icon icon={faPlus} /></div></Tooltip>
      <div class="mr-2"></div>
      <Tooltip inline bottom end title={$_("toggle-visibility")}>
        <div class="cursor-pointer" class:text-red-500={!$visibility[which]}
          on:click={() => visibility.toggle(which)}
        >
          <Icon icon={$visibility[which] ? faEye : faEyeSlash} /></div></Tooltip>
    </div>
  </div>
  <div class="flex flex-col">
    {#each data["_"+which] as image, index}
	
	{#if imageTargetPosition.index === index && !imageTargetPosition.after} 
		<div class="rect-target-separator"></div> 
	{/if}
    <div class="indented"
		on:mousemove={e => mouseMove(e, index)}
	>
	
	  <div class="
			{ "move-rect" }
			{ imageIndexToBeMoved < 0 || imageIndexToBeMoved == index ? "blue-rect" : "bg-gray-600" }
		   "
		on:mousedown={() => {
		  imageIndexToBeMoved = index
		  imageTargetPosition = { index, after: true }
		}}
	  >
	  </div>

      <div class="flex my-1">
        <label>
          <span>X</span>
          <TextInput number value={image.x} on:input={e => { image.x = e.target.value, updateSettings()}} />
        </label>
        <label>
          <span>Y</span>
          <TextInput number value={image.y} on:input={e => { image.y = e.target.value, updateSettings()}} />
        </label>
        <Tooltip inline bottom end title={$_("button-delete")}>
          <div class="cursor-pointer text-red-500 text-sm"
            on:click|stopPropagation={() => {
              $settings["_"+which].splice(index, 1)
              updateSettings()
            }}
          >
            <Icon icon={faTrash} />
          </div>
        </Tooltip>
      </div>

      <div class="flex">
        <label>
          <span>Url</span>
          <div class="rtl-input">
            <TextInput placeholder="x_transformice/x_evt/x_evt_19/svtrixcv/bateau.png"
              value={image.url} on:input={e => { image.url = e.target.value, updateSettings()}} />
          </div>
        </label>
      </div>

      {#if which === "disappearingImages"}
      <div class="indented mt-1"
        on:mouseenter={() => $highlightedObject = image.index}
        on:mouseleave={() => $highlightedObject = null}
      >
        <div class="text-xs text-gray-300">{$_("disappearing-rectangle")}</div>
        <div class="flex">
          <label>
            <span class="text-xs">{$_("left")}</span>
            <TextInput number value={image.rx} on:input={e => { image.rx = e.target.value, updateSettings()}} />
          </label>
          <label>
            <span class="text-xs">{$_("top")}</span>
            <TextInput number value={image.ry} on:input={e => { image.ry = e.target.value, updateSettings()}} />
          </label>
        </div>
        <div class="flex">
          <label>
            <span>L</span>
            <TextInput number value={image.rw} on:input={e => { image.rw = e.target.value, updateSettings()}} />
          </label>
          <label>
            <span>H</span>
            <TextInput number value={image.rh} on:input={e => { image.rh = e.target.value, updateSettings()}} />
          </label>
        </div>
      </div>
      {/if}

    </div>
	{#if imageTargetPosition.index === index && imageTargetPosition.after} 
		<div class="rect-target-separator"></div> 
	{/if}
	
    {/each}
  </div>
</section>

<style lang="text/postcss">
  .rtl-input {
    direction: rtl;
  }
  .rtl-input:focus-within {
    direction: initial;
  }
  .indented {
    background: rgba(255,255,255,0.1);
    @apply border-l-2 border-white pl-5 pr-3 mb-2;
	position: relative;
  }
  .move-rect {
    @apply absolute left-0 top-0 w-3 h-full cursor-pointer;
  }
  .blue-rect {
	@apply bg-blue-600;
  }
  .blue-rect:hover {
	@apply bg-blue-400 ;
  }
  .rect-target-separator {
	@apply bg-blue-600 mb-2 h-2;
  }
  section {
    @apply flex items-center mb-1;
  }
  label {
    transition: 200ms;
    @apply flex items-center justify-between;
  }
  label:not(:last-child) {
    @apply mr-4;
  }
  label > span{
    user-select: none;
    white-space: nowrap;
    @apply mr-3 text-sm text-gray-300;
  }
</style>