<script>
  import Scene from "components/scene/Scene.svelte"
  import Header from "components/ui/Header.svelte"
  import Panel from "components/ui/Panel.svelte"
  import TabMovement from "components/ui/TabMovement.svelte"
  import Toolbar from "components/ui/Toolbar.svelte"

  import { layoutConfig } from "state/layout"

  console.info("App loaded")
</script>


<main class="flex h-screen">

  <Panel panelName="left" bind:panel={$layoutConfig.panels.left} direction="vertical" resize="right" />

  <div class="flex-grow flex flex-col-reverse">
    <Panel panelName="bottom" bind:panel={$layoutConfig.panels.bottom} direction="horizontal" resize="top" />
    <div class="relative w-full h-full">
      <Scene/>
      <Toolbar />
    </div>
    <Header/>
  </div>

  <Panel panelName="right" bind:panel={$layoutConfig.panels.right} direction="vertical" resize="left" />

  <TabMovement/>

</main>
