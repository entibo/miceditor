
<script>
  import Icon from "fa-svelte"
  import { faEye } from "@fortawesome/free-solid-svg-icons/faEye"
  import { faEyeSlash } from "@fortawesome/free-solid-svg-icons/faEyeSlash"
  import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp"
  import { faSquare } from "@fortawesome/free-solid-svg-icons/faSquare"
  import { faSquare as faSquareOutline } from "@fortawesome/free-regular-svg-icons/faSquare"

  import { 
    selection, visibility,
    platforms, decorations, shamanObjects,
    _
  } from "/stores/stores.js"

  import Tooltip from "/components/common/Tooltip.svelte"

  export let which
  export let title
  export let collapsed
  export let grow = false
  export let quarter = false
  export let noActions = false
  export let active

  export let count
  export let max

  let countClass = ""
  $: if(count !== undefined && max !== undefined) {
    let ratio = parseInt(count)/parseInt(max)
    countClass = 
      ratio > 1 ? "text-red-400 very-bold" :
      ratio > 0.75 ? "text-orange-400" :
      ratio > 0.5 ? "text-yellow-400" :
      "text-green-300"
  }

</script>

<div class="menu flex flex-col my-1" 
  class:flex-grow={grow && !collapsed} 
  class:active={active}
  class:quarter={quarter}
>
  <div class="flex justify-between items-center cursor-pointer border-b border-white-100"
    on:click={() => collapsed = !collapsed}
  >
    <div class="flex-grow flex justify-between px-1 flex-wrap">
      <div class="flex text-sm">
        <Tooltip bottom start title={collapsed ? $_("expand") : $_("collapse")}>
          <div class="icon mr-3" class:flipped={collapsed}>
            <Icon icon={faChevronUp} />
          </div>
        </Tooltip>
        <div>{title}</div>
      </div>
      {#if !noActions}
      <div class="flex text-sm items-center">
        <div class="text-xs {countClass}">
          {count}/{max}
        </div>
        <div class="mr-3"></div>
        <Tooltip title={$_("unselect-all")}>
          <div class="icon" on:click|stopPropagation={() => selection.unselectGroup(which)}>
            <Icon icon={faSquareOutline} />
          </div>
        </Tooltip>
        <div class="mr-1"></div>
        <Tooltip title={$_("select-all")}>
          <div class="icon" on:click|stopPropagation={() => selection.selectGroup(which)}>
            <Icon icon={faSquare} />
          </div>
        </Tooltip>
        <div class="mr-3"></div>
        <Tooltip title={$_("toggle-visibility")}>
          <div class="icon" class:text-red-500={!$visibility[which]}
            on:click|stopPropagation={() => visibility.toggle(which)}
          >
            <Icon icon={$visibility[which] ? faEye : faEyeSlash} />
          </div>
        </Tooltip>
      </div>
      {/if}
    </div>
  </div>
  {#if !collapsed}
  <slot></slot>
  {/if}
</div>

<style lang="text/postcss">
  .quarter {
    max-height: 25%;
  }
  .very-bold {
    font-weight: bold;
    text-shadow: 0px 0px 3px black;
  }
  .menu.active {
    outline: 4px dashed white;
  }

  .icon {
    transition: transform 80ms;
  }
  .flipped {
    transform-origin: center;
    transform: rotateX(180deg);
  }

</style>