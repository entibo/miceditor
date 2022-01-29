
<script>

import MapSettingsMenu from "components/ui/menus/MapSettingsMenu.svelte"
import SelectionMenu from "components/ui/menus/SelectionMenu.svelte"
import LayersMenu from "components/ui/menus/LayersMenu.svelte"
import TreeMenu from "components/ui/menus/TreeMenu.svelte"
import PlatformsMenu from "components/ui/menus/PlatformsMenu.svelte"
import BasicMenu from "components/ui/menus/BasicMenu.svelte"
import DecorationsMenu from "components/ui/menus/DecorationsMenu.svelte"
import ShamanObjectsMenu from "components/ui/menus/ShamanObjectsMenu.svelte"
import ShamanObjectVariantsMenu from "components/ui/menus/ShamanObjectVariantsMenu.svelte"
import LinesMenu from "components/ui/menus/LinesMenu.svelte"
import MechanicsMenu from "components/ui/menus/MechanicsMenu.svelte"
import ImagesMenu from "components/ui/menus/ImagesMenu.svelte"
import ColorPaletteMenu from "./menus/ColorPaletteMenu.svelte";

const tabToComponent = {
  "mapSettings": MapSettingsMenu,
  "selection": SelectionMenu,
  "platforms": PlatformsMenu,
  "basic": BasicMenu,
  "decorations": DecorationsMenu,
  "shamanObjects": ShamanObjectsMenu,
  "shamanObjectVariants": ShamanObjectVariantsMenu,
  "lines": LinesMenu,
  "mechanics": MechanicsMenu,
  "images": ImagesMenu,
  "layers": LayersMenu,
  "tree": TreeMenu,
  "colorPalette": ColorPaletteMenu,
}

export let tab

</script>


<svelte:component this={tabToComponent[tab]} />