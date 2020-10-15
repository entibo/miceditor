
<script>

  import ColorPicker from "./ColorPicker.svelte"
  import Tooltip from "./Tooltip.svelte"
  import TextInput from "./TextInput.svelte"

  export let value

  let tooltipElement
  let colorPickerVisible = false

  function eventPath(evt) {
    var path = (evt.composedPath && evt.composedPath()) || evt.path,
        target = evt.target;

    if (path != null) {
        // Safari doesn't include Window, but it should.
        return (path.indexOf(window) < 0) ? path.concat(window) : path;
    }

    if (target === window) {
        return [window];
    }

    function getParents(node, memo) {
        memo = memo || [];
        var parentNode = node.parentNode;

        if (!parentNode) {
            return memo;
        }
        else {
            return getParents(parentNode, memo.concat(parentNode));
        }
    }

    return [target].concat(getParents(target), window);
}

</script>

<svelte:window 
  on:mousedown={e => colorPickerVisible = eventPath(e).includes(tooltipElement) }
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
