<script>
  import Icon from "fa-svelte";
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
  import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";

  import TextInput from "components/common/TextInput.svelte";
  import Tooltip from "components/common/Tooltip.svelte";
  import Button from "components/common/Button.svelte";

  import { colorPalette, brushPalette } from "state/user";

  import { _ } from "state/locale";
  import { groups } from "state/sceneObjects";
  import { creation } from "state/creation"

  async function addcolor() {
    let newcolor = { color: "FFFFFF" };
    $colorPalette = [...$colorPalette, newcolor];
  }

  function removecolor(color) {
    $colorPalette = $colorPalette.filter((b) => b !== color);
  }

  function updateColor(color, newColor) {
    const oldColor = color.color;
    color.color = newColor;
    $colorPalette = $colorPalette;

    for (let platform of groups.platforms) {
      if (platform.color === oldColor) {
        platform.color = newColor;
        platform.invalidate();
      }
    }
    for (let decoration of groups.decorations) {
      if (decoration.colors.includes(oldColor)) {
        decoration.colors = decoration.colors.map((c) =>
          c === oldColor ? newColor : c
        );
        decoration.invalidate();
      }
    }
    for (let line of groups.joints) {
      if (line.color === oldColor) {
        line.color = newColor;
        line.invalidate();
      }
    }
    brushPalette.update(brushes => {
      return brushes.map(brush => {
        if(brush.color === oldColor) {
          brush.color = newColor;
        }
        return brush;
      })
    })
    creation.invalidate()
  }
</script>

<div class="flex flex-col">
  <div class="form flex flex-col justify-between">
    {#each $colorPalette as color}
      <div class="flex flex-row">
        <label>
          <TextInput
            color
            value={color.color}
            set={(newColor) => updateColor(color, newColor)}
            class="w-16"
          />
        </label>
        <div
          class="text-red-600 w-6 h-6 flex items-center ml-1 cursor-pointer"
          on:click|preventDefault|stopPropagation={() => removecolor(color)}
        >
          <Icon icon={faTimes} />
        </div>
      </div>
    {/each}
  </div>
  <Button class="text-sm mt-2" on:click={addcolor}>
    <div class="flex justify-center items-center">
      <span class="flex"><Icon icon={faPlus} /></span>
      <span class="ml-1">{$_("button-add")}</span>
    </div>
  </Button>
</div>

<style lang="postcss">
</style>
