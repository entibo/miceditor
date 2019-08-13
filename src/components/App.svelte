<script>
  import Header from "/components/ui/Header.svelte"
  import Footer from "/components/ui/Header.svelte"
  import ObjectPalette from "/components/ui/ObjectPalette.svelte"
  import MainPanel from "/components/ui/MainPanel.svelte"
  import Scene from "/components/scene/Scene.svelte"

  import { undo, redo, hasChanged } from "/stores/stores.js"

  function onKeydown({ctrlKey, shiftKey, key}) {
    if(ctrlKey) {
      if(key.toLowerCase() === "z") {
        if(shiftKey) redo()
        else undo()
      }
      if(key.toLowerCase() === "y") redo()
    }
  }

  function unloadConfirmation() {
    if(!confirm("Exit ?")) return false
    return true
  }
  $: window.onbeforeunload = $hasChanged ? unloadConfirmation : null
</script>

<svelte:window 
  on:keydown={onKeydown}
/>

<main class="flex h-screen">
  <ObjectPalette />
  <div class="flex-grow flex flex-col-reverse">
    <Scene />
    <Header/>
  </div>
  <MainPanel />
</main>

<style lang="text/postcss">

</style>
