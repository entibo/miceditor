

<script>
  import { tick } from "svelte"
  import { fly } from "svelte/transition"

  import TextInput from "components/common/TextInput.svelte"

  import { mapSettings } from "state/map"

  export let name
  export let current


  let editing = false
  let inputContainerEl
  async function edit() {
    editing = true
    await tick()
    if(!inputContainerEl) return
    let input = inputContainerEl.querySelector("input")
    if(!input) return
    input.focus()
  }

  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher()
  function setName(str) {
    dispatch("name", str)
  }

</script>

<div class="title-text relative" class:current class:editing >
  <div class="name-read" on:dblclick={edit} >
    {name}
  </div>
  {#if editing}
    <div class="name-write" transition:fly={{duration: 80, x:-100}} bind:this={inputContainerEl} >
      <TextInput class="w-24"
        value={name} set={setName}
        on:blur={() => editing = false} 
      />
    </div>
  {/if}
</div>

<style>
  .title-text {
    @apply font-cursive text-sm font-thin text-gray-400;
  }
  *:hover > .title-text {
    @apply text-white;
  }
  .title-text.current {
    @apply text-white font-bold;
  }

  .name-write {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    z-index: 40;
  }
</style>