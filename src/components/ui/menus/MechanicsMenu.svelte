
<script>
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"
  import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes"
  import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons/faExternalLinkAlt"

  import TextInput from "/components/common/TextInput.svelte"
  import Tooltip from "/components/common/Tooltip.svelte"
  import Button from "/components/common/Button.svelte"
  import Checkbox from "/components/common/Checkbox.svelte"


  import * as Creation from "/state/creation"
  import { creation } from "/state/creation"
  import {  } from "/state/user"

  import { _ } from "/state/locale"

  const data = [
      { type: "JD",
        key: "distance-joint",
      },
      { type: "JP",
        key: "prismatic-joint",
      },
      { type: "JR",
        key: "rotation-joint",
      },
      { type: "JPL",
        key: "pulley-joint",
      },
    ]

</script>

<div class="flex flex-wrap">
  {#each data as {type, key}}
    <Tooltip title={$_(key)}>
      <div class="tile dim-40 bg-tfm-blue"
           class:active={$creation.enabled && $creation.creationType === "MECHANIC" && $creation.type === type}
           on:click={() => Creation.setMechanic(type)}
      >
        <div class="font-mono text-xs text-white whitespace-no-wrap">
          <span class="text-gray-400">&#x3C;</span>{type}<span class="text-gray-400">&#x3E;</span>
        </div>
      </div>
    </Tooltip>
  {/each}
</div>