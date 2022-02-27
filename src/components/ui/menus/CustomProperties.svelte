<script>
  import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"
  import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes"
  import Button from "components/common/Button.svelte"
  import TextInput from "components/common/TextInput.svelte"
  import Icon from "fa-svelte"
  import { _ } from "state/locale"

  export let props

  let adding = null
</script>

{#if props}
  {#each Object.keys(props) as k (k)}
    {#if props[k] !== undefined}
      <label>
        <span class="font-mono">{k}</span>
        <div class="flex justify-end">
          <TextInput bind:value={props[k]} />
          <label
            class="icon-btn"
            on:click={() => {
              props[k] = undefined
            }}
          >
            <Icon class="text-red-500" icon={faTimes} />
          </label>
        </div>
      </label>
    {/if}
  {/each}
  {#if adding !== null}
    <div class="flex">
      <TextInput
        autofocus
        placeholder="prop"
        bind:value={adding}
        on:change={() => {
          props[adding] = ""
          adding = null
        }}
      />
      <label class="icon-btn">
        <Icon class="text-green-500" icon={faCheck} />
      </label>
    </div>
  {:else}
    <Button
      class="text-xs"
      on:click={() => {
        adding = ""
      }}
    >
      <div class="flex justify-center items-center">
        <span class="flex"><Icon icon={faPlus} /></span>
        <span class="">{$_("button-add")}</span>
      </div>
    </Button>
  {/if}
{/if}
