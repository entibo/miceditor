<script>
  import { slide, fly } from "svelte/transition";

  import Icon from "fa-svelte";
  import { faPenNib } from "@fortawesome/free-solid-svg-icons/faPenNib";
  import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo";

  import TextInput from "components/common/TextInput.svelte";
  import Tooltip from "components/common/Tooltip.svelte";
  import Button from "components/common/Button.svelte";
  import Checkbox from "components/common/Checkbox.svelte";

  import { generateSlope, slopeConfig } from "state/slope";

  import { _ } from "state/locale";
</script>

<div class="form">
  <label>
    <span>{$_("rotation")} 1</span>
    <TextInput
      float
      min={0}
      max={360}
      step={15}
      bind:value={$slopeConfig.startAngle}
      class="w-16"
    />
  </label>

  <label>
    <span>{$_("rotation")} 2</span>
    <TextInput
      float
      min={0}
      max={360}
      step={15}
      bind:value={$slopeConfig.endAngle}
      class="w-16"
    />
  </label>

  <label>
    <span>{$_("fineness")}</span>
    <TextInput
      int
      min={1}
      sliderMax={25}
      bind:value={$slopeConfig.segments}
      class="w-16"
    />
  </label>

  <div class="mt-2 text-gray-200 font-cursive font-medium text-xs">
    {$_("category-grounds")}
  </div>

  <label>
    <span>W(0=auto)</span>
    <div class="flex">
      <label
        class="icon-btn text-xs mr-1"
        on:click={() => ($slopeConfig.width = 0)}
      >
        <Icon icon={faUndo} />
      </label>
      <TextInput
        int
        min={10}
        sliderMax={120}
        bind:value={$slopeConfig.width}
        class="w-16"
      />
    </div>
  </label>

  <label>
    <span>H</span>
    <TextInput
      int
      min={10}
      sliderMax={120}
      bind:value={$slopeConfig.height}
      class="w-16"
    />
  </label>

  <label>
    <span>{$_("rotation")}</span>
    <TextInput
      int
      min={0}
      max={360}
      step={90}
      bind:value={$slopeConfig.platformAngle}
      class="w-16"
    />
  </label>

  <Button class="text-sm mt-2 w-full" on:click={generateSlope}>
    <div class="flex justify-center items-center">
      <span>{$_("generate")}</span>
    </div>
  </Button>

</div>
