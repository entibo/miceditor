
<script>

  import ColorPicker from "./ColorPicker.svelte"
  import Tooltip from "./Tooltip.svelte"
  import TextInput from "./TextInput.svelte"

  export let value

  let tooltipElement
  let colorPickerVisible = false

</script>

<svelte:window 
  on:mousedown={e => colorPickerVisible = e.path.includes(tooltipElement) }
/>

<Tooltip inline noStyle bottom end active={colorPickerVisible}>
  <TextInput bind:value={value} on:input on:change
    on:focus={() => colorPickerVisible = true}
  />
  <div bind:this={tooltipElement} slot="tooltip" on:click|preventDefault
    class="pointer-events-auto shadow-lg rounded bg-gray-900" 
  >
    <ColorPicker bind:value={value} on:input />
  </div>
</Tooltip>
