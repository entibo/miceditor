
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

  import { debounce } from "/utils.js"

  import { 
    xml, settings, 
    undo, redo, canUndo, canRedo,
    highQuality, parkour, showGameGUI, showMapBorder, zoom, firstVisit
  } from "/stores/stores.js"

  import TextInput from "/components/common/TextInput.svelte"
  import Button from "/components/common/Button.svelte"
  import Tooltip from "/components/common/Tooltip.svelte"
  import UserSettings from "/components/ui/UserSettings.svelte"
  import XmlEditor from "/components/ui/XmlEditor.svelte"
  import HelpMenu from "/components/ui/HelpMenu.svelte"

  let copyIconActive = false
  function removeCopyIconActive() {
    copyIconActive = false
  }
  async function copyXML() {
    try {
      await clipboardCopy($xml)
      copyIconActive = true
      debounce(removeCopyIconActive, 500)
    } catch(e) {}
  }
  async function selectXML({target}) {
    target.select()
    await tick()
    target.select()
  }

  // let currentMenu = firstVisit ? "help" : null
  let currentMenu = null
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

<header class="relative flex justify-between items-center px-4 py-2 bg-gray-800 shadow-lg text-white z-10">

  <div class="flex items-center">
    <Tooltip inline bottom title="H" >
      <Button class="text-sm" on:click={selectMenu.bind(null, "help")}>
        <div class="flex justify-center items-center">
          <span class="icon" class:active={currentMenu === "help"}>
            <Icon icon={faQuestion}/> 
              </span>
            <span class="ml-2 hidden xl:inline">Help</span>
        </div>
      </Button>
    </Tooltip>

    <div class="mr-2"></div>

    <Tooltip inline bottom title="Editor settings" >
      <Button class="text-sm" on:click={selectMenu.bind(null, "settings")}>
        <div class="flex justify-center items-center">
          <span class="icon" class:active={currentMenu === "settings"}>
            <Icon icon={faCog}/> 
              </span>
          <span class="ml-2 hidden xl:inline">Settings</span>
        </div>
      </Button>
    </Tooltip>

    <div class="mr-2"></div>

    <Tooltip inline bottom title="Ctrl+Scroll" >
      <Button class="text-sm" on:click={selectMenu.bind(null, "zoom")}>
        <div class="flex justify-center items-center">
          <span class="icon" class:active={currentMenu === "zoom"}>
            <Icon icon={faSearchPlus}/> 
              </span>
            <span class="ml-2 hidden xl:inline">Zoom</span>
        </div>
      </Button>
    </Tooltip>

  </div>


  <div class="mr-4"></div>


  <div class="flex items-center">
    <Tooltip inline bottom title="Large XML editor" >
      <Button class="text-sm" on:click={selectMenu.bind(null, "xmlEditor")}>
        <div class="flex justify-center items-center" >
          <span class="icon" class:active={currentMenu === "xmlEditor"}>
            <Icon icon={faEdit}/> 
              </span>
          <span class="ml-2 hidden xl:inline">Edit</span>
        </div>
      </Button>
    </Tooltip>

    <div class="mr-2"></div>

    <TextInput value={$xml} on:input={e => $xml = e.target.value} on:click={selectXML} />

    <div class="mr-2"></div>

    <Tooltip inline bottom title="Copy XML to clipboard" >
      <Button class="text-sm" on:click={copyXML}>
        <div class="flex justify-center items-center" >
          <span class="icon" class:active={copyIconActive}>
            <Icon icon={faCopy}/> 
          </span>
          <span class="ml-2 hidden xl:inline">Copy</span>
        </div>
      </Button>
    </Tooltip>
  </div>


  <div class="mr-4"></div>


  <div class="flex">
    <Tooltip inline bottom title="Ctrl+Z" >
      <Button class="text-sm" disabled={!$canUndo} on:click={undo}>
        <div class="flex justify-center items-center">
          <Icon icon={faUndo}/> <span class="ml-2 hidden xl:inline">Undo</span>
        </div>
      </Button>
    </Tooltip>
    <div class="mr-2"></div>
    <Tooltip inline bottom end title="Ctrl+Shift+Z / Ctrl+Y" >
      <Button class="text-sm" disabled={!$canRedo} on:click={redo}>
        <div class="flex justify-center items-center">
          <Icon icon={faRedo}/> <span class="ml-2 hidden xl:inline">Redo</span>
        </div>
      </Button>
    </Tooltip>
  </div>



  {#if currentMenu === "settings"}

  <div class="lower-panel w-64 p-2 xl:p-4" transition:slide={{duration: 100}}>

    <UserSettings />

  </div>

  {:else if currentMenu === "zoom"}

  <div class="lower-panel w-64 p-2 xl:p-4" transition:slide={{duration: 100}}>
    
    <section>
      <label>
        <span>Zoom</span>
        <TextInput number bind:value={$zoom} />
      </label>
      <input type=range bind:value={$zoom} min=0.1 max=5 step=0.1 />
    </section>

  </div>

  {:else if currentMenu === "xmlEditor"}

  <div class="lower-panel xml p-2 xl:p-4" transition:slide={{duration: 100}}>
    
    <XmlEditor />

  </div>

  {:else if currentMenu === "help"}

  <div class="lower-panel p-2 xl:p-4" transition:slide={{duration: 100}}>
    
    <HelpMenu />

  </div>

  {/if}


</header>


<style lang="text/postcss">
  section {
    @apply flex items-center;
  }
  label {
    transition: 200ms;
    @apply flex items-center justify-between;
  }
  label + label {
    @apply ml-4;
  }
  label > span, small-text {
    user-select: none;
    white-space: nowrap;
    @apply mr-3 text-sm text-gray-300;
  }

  .lower-panel {
    transform: translateY(100%);
    bottom: 1px;
    @apply absolute;
    @apply z-20 shadow-lg rounded-b text-gray-300 whitespace-no-wrap;
    background-color: #2b3e50;
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