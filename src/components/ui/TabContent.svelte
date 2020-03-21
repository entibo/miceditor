
<script>

import PlatformsMenu from "/components/ui/menus/PlatformsMenu.svelte"
import MapSettingsMenu from "/components/ui/menus/MapSettingsMenu.svelte"
import SelectionMenu from "/components/ui/menus/SelectionMenu.svelte"

const tabToComponent = {
  "platforms": PlatformsMenu,
  "basic": SelectionMenu,
  "decorations": SelectionMenu,
  "shamanObjects": SelectionMenu,
  "lines": SelectionMenu,
  "mechanics": SelectionMenu,
  "images": SelectionMenu,
  "layers": SelectionMenu,
  "mapSettings": MapSettingsMenu,
  "selection": SelectionMenu,
}

export let tab


</script>

<svelte:component this={tabToComponent[tab]} />