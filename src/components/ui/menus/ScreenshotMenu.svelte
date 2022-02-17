
<script>
  import { tick } from "svelte"
  import { slide, fly } from "svelte/transition"
  
  import clipboardCopy from "clipboard-copy"
  import { debounce } from "common"

  import Icon from "fa-svelte"
  import { faCamera } from "@fortawesome/free-solid-svg-icons/faCamera"
  import { faLink } from "@fortawesome/free-solid-svg-icons/faLink"
  import { faUnlink } from "@fortawesome/free-solid-svg-icons/faUnlink"
  import { faCopy } from "@fortawesome/free-solid-svg-icons/faCopy"
  import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner"

  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"

  import { _ } from "state/locale"
  import { screenshotUpload } from "state/user"
  import { mapSettings } from "state/map"
  import { xml } from "state/xml"

  $: width = $mapSettings.width
  $: height = $mapSettings.height
  let widthHeightLinked = true

  function onSetWidth(v) {
    if(widthHeightLinked) {
      let factor = v / width
      height = height * factor
    }
    width = v
  }
  function onSetHeight(v) {
    if(widthHeightLinked) {
      let factor = v / height
      width = width * factor
    }
    height = v
  }

  let loading = false
  let status
  function getScreenshot() {
    status = null
    loading = true
    let data = { xml: $xml }
    data.raw = $screenshotUpload === false
    if(width != $mapSettings.width || height != $mapSettings.height) {
      data.width = width
      data.height = height
    }
    fetch("https://miceditor-map-preview.herokuapp.com/", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async res => {
      if(res.status === 200) {
        let raw = res.headers.get("Content-Type").includes("png")
        let url = raw ? URL.createObjectURL(await res.blob()) : await res.text()
        status = {
          ok: true,
          url,
          link: !raw ? url : ""
        }
      } else {
        status = {
          ok: false,
          error: await res.text()
        }
      }
    })
    .catch(e => {
      console.log("error:", e)
      status = {
        ok: false,
        error: e,
      }
    })
    .finally(() => {
      loading = false
    })
  }

  let copyIconActive = false
  function removeCopyIconActive() {
    copyIconActive = false
  }
  async function copyLink() {
    try {
      await clipboardCopy(status.link)
      copyIconActive = true
      debounce(removeCopyIconActive, 500)
    } catch(e) { console.error("copyLink; error.") }
  }
  async function selectLink(e) {
    e.target.select()
    await tick()
    e.target.select()
  }

</script>


<div class="form tabContent">

  <label>
    <span>Upload to Imgur</span>
    <Checkbox bind:checked={$screenshotUpload}  />
  </label>

  <div class="mb-2"></div>

  <div class="flex justify-center">
    <label>
      <span class="incompressible w-6">L</span>
      <TextInput int min={10} step={10} sliderMax={$mapSettings.width} value={width} set={onSetWidth} class="w-16" bgColor="bg-gray-700"/>
    </label>
    <label class="icon-btn text-xs mx-1" on:click={() => widthHeightLinked = !widthHeightLinked} >
      <Icon icon={widthHeightLinked ? faLink : faUnlink} />
    </label>
    <label>
      <span class="incompressible w-6">H</span>
      <TextInput int min={10} step={10} sliderMax={800} value={height} set={onSetHeight} class="w-16" bgColor="bg-gray-700"/>
    </label>
  </div> 

  <div class="mb-4"></div>

  <div class="flex justify-center">
    <Button class="" on:click={getScreenshot} disabled={loading}>
      <div class="flex justify-center items-center">
        <span class="flex items-center">
          {#if loading}
            <div class="spinner">
              <Icon icon={faSpinner}/> 
            </div>
          {:else}
            <Icon icon={faCamera}/> 
          {/if}
        </span>
        <div>Screenshot</div>
      </div>
    </Button>
  </div>

</div>

{#if status}
<div class="mb-5"></div>

<div class="flex flex-col justify-center max-w-xs">
  {#if !status.ok}
    <div class="text-red-500 font-bold select-all">{status.error}</div>
  {:else}
    {#if status.link}
      <div class="flex mx-2">
        <TextInput value={status.link} set={()=>{}} on:click={selectLink} 
          bgColor="bg-gray-700" textColor="text-gray-300"
          outerClass="flex-grow mr-2"
        />  
        <Tooltip inline bottom title={$_("copy-map-to-clipboard")} >
          <Button class="text-sm" on:click={copyLink}>
            <div class="flex justify-center items-center" >
              <span class="icon" class:active={copyIconActive}>
                <Icon icon={faCopy}/> 
              </span>
              <span class="ml-2 hidden xl:inline">{$_("button-copy")}</span>
            </div>
          </Button>
        </Tooltip>
      </div>

      <div class="mb-2"></div>
    {/if}
    <img src={status.url} alt="result"/>
  {/if}
</div>
{/if}



<style lang="text/postcss">
  .icon {
    transition: 50ms;
    display: flex;
  }
  .icon.active {
    transform: scale(1.3);
  }
</style>