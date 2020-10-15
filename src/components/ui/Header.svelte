<script>

  import clipboardCopy from "clipboard-copy"

  import { tick, onMount } from "svelte"
  import { fly, slide } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faCopy } from "@fortawesome/free-solid-svg-icons/faCopy"
  import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo"
  import { faRedo } from "@fortawesome/free-solid-svg-icons/faRedo"
  import { faCog } from "@fortawesome/free-solid-svg-icons/faCog"
  import { faEdit } from "@fortawesome/free-solid-svg-icons/faEdit"
  import { faSearchPlus } from "@fortawesome/free-solid-svg-icons/faSearchPlus"
  import { faQuestion } from "@fortawesome/free-solid-svg-icons/faQuestion"

  import { debounce } from "common"

/*   import { 
    xml, settings, 
    undo, redo, canUndo, canRedo,
    highQuality, parkour, showGameGUI, showMapBorder, zoom, firstVisit,
    language, _, localeFlag
  } from "stores/stores.js" */

  import TextInput from "components/common/TextInput.svelte"
  import Button from "components/common/Button.svelte"
  import Slider from "components/common/Slider.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import UserSettingsMenu from "components/ui/menus/UserSettingsMenu.svelte"
  import XmlEditor from "components/ui/XmlEditor.svelte"
  import HelpMenu from "components/ui/menus/HelpMenu.svelte"
  import LanguageMenu from "components/ui/menus/LanguageMenu.svelte"


  import { xml, defaultXML } from "state/xml"
  import { importXML, exportXML } from "state/map"
  import { localeFlag, language, _ } from "state/locale"
  import { undo, redo, canUndo, canRedo } from "state/history"
  import { zoom } from "state/user"


  let copyIconActive = false
  function removeCopyIconActive() {
    copyIconActive = false
  }
  async function copyXML() {
    exportXML()
    try {
      await clipboardCopy($xml)
      copyIconActive = true
      debounce(removeCopyIconActive, 500)
    } catch(e) { console.error("copyXML; error.") }
  }
  async function selectXML(e) {
    exportXML()
    e.target.select()
    await tick()
    e.target.select()
  }

  // let currentMenu = firstVisit ? "help" : null
  let currentMenu = null // null | "help" | "language" | "settings" | "zoom" | "xmlEditor"
  function selectMenu(which) {
    if(currentMenu === which)
      currentMenu = null
    else currentMenu = which
  }

  function onKeydown({key}) {
    if(key.toLowerCase() === "h") {
      selectMenu("help")
    }
  }

  

</script>

<svelte:window
  on:keydown={onKeydown}
/>

<header class="relative flex justify-between items-center px-4 py-2 bg-gray-800 shadow-lg text-white z-50">

  <div class="flex flex-wrap items-center">

    <Button class="text-sm" on:click={selectMenu.bind(null, "language")}>
      <div class="flex justify-center items-center">
        <span class="icon" class:active={currentMenu === "language"}>
          <span class="m-1 flag flag-{localeFlag[$language]}"></span>
      </div>
    </Button>

    <div class="mr-1"></div>

    <Tooltip inline bottom title="H" >
      <Button class="text-sm" on:click={selectMenu.bind(null, "help")}>
        <div class="flex justify-center items-center">
          <span class="icon" class:active={currentMenu === "help"}>
            <Icon icon={faQuestion}/> 
              </span>
            <span class="ml-2 hidden xl:inline">{$_("button-help")}</span>
        </div>
      </Button>
    </Tooltip>

    <div class="mr-1"></div>

    <Tooltip inline bottom title={$_("editor-settings")} >
      <Button class="text-sm" on:click={selectMenu.bind(null, "settings")}>
        <div class="flex justify-center items-center">
          <span class="icon" class:active={currentMenu === "settings"}>
            <Icon icon={faCog}/> 
              </span>
          <span class="ml-2 hidden xl:inline">{$_("button-settings")}</span>
        </div>
      </Button>
    </Tooltip>

    <div class="mr-1"></div>

    <Tooltip inline bottom title="Ctrl+Scroll" >
      <Button class="text-sm" on:click={selectMenu.bind(null, "zoom")}>
        <div class="flex justify-center items-center">
          <span class="icon" class:active={currentMenu === "zoom"}>
            <Icon icon={faSearchPlus}/> 
              </span>
            <span class="ml-2 hidden xl:inline">{$_("button-zoom")}</span>
        </div>
      </Button>
    </Tooltip>

  </div>


  <div class="mr-4"></div>


  <div class="flex justify-center flex-wrap items-center">
    <Tooltip inline bottom title={$_("large-xml-editor")} >
      <Button class="text-sm" on:click={selectMenu.bind(null, "xmlEditor")}>
        <div class="flex justify-center items-center" >
          <span class="icon" class:active={currentMenu === "xmlEditor"}>
            <Icon icon={faEdit}/> 
          </span>
          <span class="ml-2 hidden xl:inline">{$_("button-edit")}</span>
        </div>
      </Button>
    </Tooltip>

    <div class="mr-1"></div>

    <div class="flex">
      <label class="icon-btn mx-1" on:click={() => importXML(defaultXML)} >
        <Icon icon={faUndo} class="text-sm"/>
      </label>
      <TextInput value={$xml} set={importXML} on:click={selectXML} 
                bgColor="bg-gray-700" textColor="text-gray-300"
      />
    </div>

    <div class="mr-1"></div>

    <Tooltip inline bottom title={$_("copy-map-to-clipboard")} >
      <Button class="text-sm" on:click={copyXML}>
        <div class="flex justify-center items-center" >
          <span class="icon" class:active={copyIconActive}>
            <Icon icon={faCopy}/> 
          </span>
          <span class="ml-2 hidden xl:inline">{$_("button-copy")}</span>
        </div>
      </Button>
    </Tooltip>
  </div>


  <div class="mr-4"></div>


  <div class="flex flex-wrap">
    <Tooltip inline bottom title="Ctrl+Z" >
      <Button class="text-sm" disabled={!$canUndo} on:click={undo}>
        <div class="flex justify-center items-center">
          <Icon icon={faUndo}/> <span class="ml-2 hidden xl:inline">{$_("button-undo")}</span>
        </div>
      </Button>
    </Tooltip>
    <div class="mr-1"></div>
    <Tooltip inline bottom end title="Ctrl+Shift+Z / Ctrl+Y" >
      <Button class="text-sm" disabled={!$canRedo} on:click={redo}>
        <div class="flex justify-center items-center">
          <Icon icon={faRedo}/> <span class="ml-2 hidden xl:inline">{$_("button-redo")}</span>
        </div>
      </Button>
    </Tooltip>
  </div>



  {#if currentMenu === "settings"}

  <div class="lower-panel p-2 xl:p-4" transition:slide={{duration: 100}}>

    <UserSettingsMenu />

  </div>

  {:else if currentMenu === "zoom"}

  <div class="lower-panel p-2 xl:p-4" transition:slide={{duration: 100}}>
    
    <div class="form tabContent">
      <label>
        <span class="min-w-16">{$_("button-zoom")}</span>
        <div class="flex">
          <label class="icon-btn text-xs" on:click={() => $zoom = 1} >
            <Icon icon={faUndo} />
          </label>
          <TextInput float bind:value={$zoom} class="w-16" />
        </div>
      </label>
      <div class="mb-1"></div>
      <Slider value={Math.log10($zoom)} set={v => $zoom = 10**v}
              min={-1} max={1} step={0.1} 
              widthClass=""
      />
    </div>

  </div>

  {:else if currentMenu === "xmlEditor"}

  <div class="lower-panel xml p-2 xl:p-4" transition:slide={{duration: 100}}>
    
    <XmlEditor />

  </div>

  {:else if currentMenu === "help"}

  <div class="lower-panel p-2 xl:p-4" transition:slide={{duration: 100}}>
    
    <HelpMenu />

  </div>

  {:else if currentMenu === "language"}

  <div class="lower-panel p-2 xl:p-4" transition:slide={{duration: 100}}>
    
    <LanguageMenu />

  </div>

  {/if}


</header>


<style lang="text/postcss">
  .lower-panel {
    transform: translateY(100%);
    bottom: 1px;
    @apply absolute;
    @apply shadow-lg rounded-b text-gray-300 whitespace-no-wrap bg-gray-800;
  }
  .lower-panel.xml {
    @apply left-0 right-0 w-full rounded-none;
  }

  .icon {
    transition: 50ms;
    display: flex;
  }
  .icon.active {
    transform: scale(1.3);
  }
</style>