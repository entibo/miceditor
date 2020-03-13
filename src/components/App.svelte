<script>
  import Header from "/components/ui/Header.svelte"
  import Scene from "/components/scene/Scene.svelte"
  console.info("App loaded")
</script>


<main class="flex h-screen">
  <div class="flex-grow flex flex-col-reverse">
    <Scene/>
    <Header/>
  </div>
</main>

<style lang="text/postcss">

</style>
