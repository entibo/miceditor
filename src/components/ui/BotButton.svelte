<script>
  import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck"
  import { faCopy } from "@fortawesome/free-solid-svg-icons/faCopy"
  import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons/faExclamationTriangle"
  import { faPaperPlane } from "@fortawesome/free-solid-svg-icons/faPaperPlane"
  import { faPlug } from "@fortawesome/free-solid-svg-icons/faPlug"
  import { faRobot } from "@fortawesome/free-solid-svg-icons/faRobot"
  import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner"
  import clipboardCopy from "clipboard-copy"
  import { debounce } from "common"
  import Button from "components/common/Button.svelte"
  import Checkbox from "components/common/Checkbox.svelte"
  import TextInput from "components/common/TextInput.svelte"
  import Tooltip from "components/common/Tooltip.svelte"
  import Icon from "fa-svelte"
  import {
    botConfig,
    botInviteCommand,
    botRoomCommand,
    botLuaModule,
    botStatus,
    connectToBot,
    isValidName,
    isWarning,
    sendMap,
    testBot,
  } from "state/bot"
  import { _ } from "state/locale"
  import { exportXML } from "state/map"
  import { xml } from "state/xml"
  import { fly, slide } from "svelte/transition"

  let panelOpen = false

  let sendIconActive = false
  function removeSendIconActive() {
    sendIconActive = false
  }
  function sendButton() {
    exportXML()
    sendMap($xml)
    sendIconActive = true
    debounce(removeSendIconActive, 500)
  }

  $: validName = isValidName($botConfig.name)
</script>

<div>
  <div class="flex">
    <Tooltip inline bottom title={$_("bot-settings")}>
      <Button class="text-sm" on:click={() => (panelOpen = !panelOpen)}>
        <div class="flex justify-center items-center">
          <span
            class="icon text-lg {$botStatus.connectionError
              ? 'text-red-500'
              : $botStatus.connected
              ? $isWarning
                ? 'text-green-500'
                : 'text-yellow-500'
              : ''}"
            class:active={panelOpen}
          >
            <Icon icon={faRobot} />
          </span>
        </div>
      </Button>
    </Tooltip>

    <Tooltip inline bottom title={$_("load-map-bot")}>
      <Button
        class="text-sm"
        on:click={sendButton}
      >
        <div class="flex justify-center items-center">
          <span class="icon text-sm" class:active={sendIconActive}>
            <Icon icon={faPaperPlane} />
          </span>
          <span class="ml-2 hidden xl:inline">{$_("button-load")}</span>
        </div>
      </Button>
    </Tooltip>
  </div>
  {#if panelOpen}
    <div
      class="lower-panel p-2 xl:p-4 max-w-sm"
      transition:slide={{ duration: 100 }}
    >
      <div class="form tabContent">
        <div class="explanation text-xs text-gray-400 select-text">
          {$_("bot-explanation")}
        </div>

        <div class="mb-2" />

        <div class="flex w-full">
          <Button
            class="text-sm"
            on:click={connectToBot}
            disabled={$botStatus.connected}
          >
            <div class="flex justify-center items-center">
              <span class="icon flex items-center">
                {#if $botStatus.connecting}
                  <div class="spinner">
                    <Icon icon={faSpinner} />
                  </div>
                {:else}
                  <Icon icon={faPlug} />
                {/if}
              </span>
              <span class="ml-2 hidden xl:inline">{$_("button-connect")}</span>
            </div>
          </Button>
          <label class="w-full">
            <span>{$_("bot-auto-connect")}</span>
            <Checkbox bind:checked={$botConfig.autoConnect} />
          </label>
        </div>
        {#if $botStatus.connected}
          <div transition:fly={{ duration: 80, y: -50 }}>
            <div class="validation-wrapper items-center ml-2">
              <div class="validation-icon">
                {#if $botStatus.isBotOnline}
                  <Icon icon={faCheck} class="text-green-500 text-sm" />
                {:else}
                  <Icon
                    icon={faExclamationTriangle}
                    class="text-yellow-500 text-sm"
                  />
                {/if}
              </div>
              <div class="w-full text-xs text-gray-400 mt-1">
                <span>{$_("bot-online")}</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
      <div class="group flex flex-col mt-2">
        <div class="tabList">
          <div
            class="tab cursor-pointer"
            class:active={$botConfig.tab === "room"}
            on:click={() => ($botConfig.tab = "room")}
          >
            {$_("module-room")}
          </div>
          <div
            class="tab cursor-pointer"
            class:active={$botConfig.tab === "tribehouse"}
            on:click={() => ($botConfig.tab = "tribehouse")}
          >
            {$_("tribehouse")}
          </div>
        </div>
        <div class="form tabContent">
          {#if $botConfig.tab === "room"}
            <div class="validation-wrapper">
              <label class="w-full">
                <span>{$_("room-name")}</span>
                <TextInput bind:value={$botConfig.room} />
              </label>
            </div>

            <div class="mb-2" />

            <div class="flex">
              <div class="flex items-center">
                <div
                  class="material-input text-xs p-1 h-6 overflow-hidden select-all w-64"
                >
                  <pre><code>{$botRoomCommand}</code></pre>
                </div>
              </div>
              <Button on:click={() => clipboardCopy($botRoomCommand)}>
                <div class="flex justify-center items-center">
                  <span class="icon">
                    <Icon icon={faCopy} />
                  </span>
                </div>
              </Button>
            </div>
          {:else if $botConfig.tab === "tribehouse"}
            <div class="explanation text-xs text-gray-400 select-text">
              {$_("bot-explanation-2")}
              <img src="https://i.imgur.com/CNlOrqv.png" alt="" />
            </div>
            <div class="mb-2" />
            <div class="validation-wrapper">
              <div class="validation-icon">
                {#if validName}
                  <Icon icon={faCheck} class="text-green-500 text-sm" />
                {:else}
                  <Icon
                    icon={faExclamationTriangle}
                    class="text-yellow-500 text-sm"
                  />
                {/if}
              </div>
              <label class="w-full">
                <span>{$_("username")}</span>
                <TextInput
                  placeholder="Souris#1234"
                  value={$botConfig.name}
                  set={(value) => ($botConfig.name = value)}
                />
              </label>
            </div>
            <div class="mb-2" />
            <div class="validation-wrapper">
              <div class="validation-icon">
                {#if $botStatus.isModuleLoaded}
                  <Icon icon={faCheck} class="text-green-500 text-sm" />
                {:else}
                  <Icon
                    icon={faExclamationTriangle}
                    class="text-yellow-500 text-sm"
                  />
                {/if}
              </div>
              <div>
                <div class="explanation">
                  {$_("load-module-in-tribehouse")} (/lua):
                </div>
                <div class="flex">
                  <div class="flex items-center">
                    <div
                      class="material-input text-xs p-1 h-6 overflow-hidden select-all w-64"
                    >
                      <pre><code>{botLuaModule}</code></pre>
                    </div>
                  </div>
                  <Button on:click={() => clipboardCopy(botLuaModule)}>
                    <div class="flex justify-center items-center">
                      <span class="icon">
                        <Icon icon={faCopy} />
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
            <div class="mb-2" />
            <div class="validation-wrapper">
              <div class="validation-icon">
                {#if $botStatus.hasTribehouseAccess}
                  <Icon icon={faCheck} class="text-green-500 text-sm" />
                {:else}
                  <Icon
                    icon={faExclamationTriangle}
                    class="text-yellow-500 text-sm"
                  />
                {/if}
              </div>
              <div>
                <div class="explanation">
                  {$_("invite-bot-tribehouse")}:
                </div>
                <div class="flex">
                  <div class="flex items-center">
                    <div
                      class="material-input text-xs p-1 h-6 overflow-hidden select-all w-64"
                    >
                      <pre><code>{botInviteCommand}</code></pre>
                    </div>
                  </div>
                  <Button on:click={() => clipboardCopy(botInviteCommand)}>
                    <div class="flex justify-center items-center">
                      <span class="icon">
                        <Icon icon={faCopy} />
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
            <div class="mb-2" />
            <Button class="text-sm" on:click={testBot}
              >{$_("button-check")}</Button
            >
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style lang="text/postcss">
  .explanation {
    @apply text-sm whitespace-normal;
  }
  .validation-wrapper {
    @apply flex;
  }
  .validation-icon {
    @apply pr-2;
  }
  .lower-panel {
    transform: translateY(100%);
    bottom: 1px;
    @apply absolute;
    @apply shadow-lg rounded-b text-gray-300 whitespace-no-wrap bg-gray-800;
  }

  .icon {
    transition: 50ms;
    display: flex;
  }
  .icon.active {
    transform: scale(1.3);
  }
</style>
