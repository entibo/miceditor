<script>
  import Scene from "components/scene/Scene.svelte"

  import {xml} from "state/xml"
  import {importXML} from "state/map"
  import {showGameGUI, showMapBorder, showDeathBorder, showMechanics, showInvisibleGrounds, zoom} from "state/user"
  import {tick} from "svelte"
  window.xml = xml
  window.importXML = importXML
  window.showGameGUI = showGameGUI
  window.showMapBorder = showMapBorder
  window.showDeathBorder = showDeathBorder
  window.showMechanics = showMechanics
  window.showInvisibleGrounds = showInvisibleGrounds
  window.zoom = zoom
  window.tick = tick

  console.info("(Minimal) App loaded")
</script>


<main class="flex h-screen">

  <div class="flex-grow flex flex-col-reverse">
    <div class="relative w-full h-full">
      <Scene/>
    </div>
  </div>

</main>
