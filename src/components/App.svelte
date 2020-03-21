<script>
  import Scene from "/components/scene/Scene.svelte"
  import Header from "/components/ui/Header.svelte"
  //import ObjectPalette from "/components/ui/ObjectPalette.svelte"
  //import MainPanel from "/components/ui/MainPanel.svelte"
  //import LeftPanel from "/components/ui/LeftPanel.svelte"
  //import BottomPanel from "/components/ui/BottomPanel.svelte"
  import Panel from "/components/ui/Panel.svelte"
  import TabMovement from "/components/ui/TabMovement.svelte"

  import { layoutConfig, tabMovement } from "/state/layout"

  console.info("App loaded")
</script>


<main class="flex h-screen">

  <Panel panelName="left" bind:panel={$layoutConfig.panels.left} direction="vertical" resize="right" />

  <div class="flex-grow flex flex-col-reverse">
    <Panel panelName="bottom" bind:panel={$layoutConfig.panels.bottom} direction="horizontal" resize="top" />
    <Scene/>
    <Header/>
  </div>

  <Panel panelName="right" bind:panel={$layoutConfig.panels.right} direction="vertical" resize="left" />

  <TabMovement/>

</main>

<style lang="text/postcss">

</style>
