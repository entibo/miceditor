
<script>
  import TextInput from "/components/common/TextInput.svelte"
  import Button from "/components/common/Button.svelte"

  let data = [
    {
      context: "Global",
      rows: [
        {
          inputs: ["Space", "Drag"],
          description: "Move the camera",
        },
        {
          inputs: ["Ctrl", "Scroll"],
          description: "Zoom in/out",
        },
        {
          inputs: ["Click/Drag"],
          description: "Select objects",
        },
        {
          inputs: ["Shift", "Click/Drag"],
          description: "Select/unselect objects",
        },
        {
          inputs: ["Ctrl", "A"],
          description: "Select all",
        },
        {
          inputs: ["Ctrl", "Shift", "A"],
          description: "Unselect all",
        },
        {
          inputs: ["Escape"],
          description: "Cancel, unselect, reset camera",
        },
        {
          inputs: ["Ctrl", "Z"],
          description: "Undo last action",
        },
        {
          inputs: ["Ctrl", "Y"],
          description: "Redo",
        },
        {
          inputs: ["Ctrl", "Shift", "Z"],
          description: "Redo",
        },
      ],
    },

    {
      context: "Selection",
      rows: [
        {
          inputs: ["Drag"],
          description: "Move selection",
        },
        {
          inputs: ["Arrows"],
          description: "Move selection",
        },
        {
          inputs: ["Shift", "Arrows"],
          description: "Move selection (±10)",
        },
        {
          inputs: ["Ctrl", "Arrows"],
          description: "Move selection (±100)",
        },
        {
          inputs: ["Scroll"],
          description: "Rotate",
        },
        {
          inputs: ["Shift", "Scroll"],
          description: "Rotate around cursor",
        },
        {
          inputs: ["Alt", "Scroll"],
          description: "Rotate slower",
        },
        {
          inputs: ["Delete"],
          description: "Delete",
        },
        {
          inputs: ["D"],
          description: "Duplicate",
        },
        {
          inputs: ["Ctrl", "C"],
          description: "Copy",
        },
        {
          inputs: ["Ctrl", "X"],
          description: "Cut",
        },
        {
          inputs: ["Ctrl", "V"],
          description: "Paste",
        },
      ],
    },
    {
      context: "Numbers",
      rows: [
        {
          inputs: ["Up/Down"],
          description: "± 1",
        },
        {
          inputs: ["Shift", "Up/Down"],
          description: "± 10",
        },
        {
          inputs: ["Ctrl", "Up/Down"],
          description: "± 100",
        },
        {
          inputs: ["Alt", "Up/Down"],
          description: "± 0.1",
        },
      ]
    },
    // {
    //   context: "Buttons",
    //   rows: [
    //     {
    //       inputs: ["Click"],
    //       description: "± 1",
    //     },
    //     {
    //       inputs: ["Shift", "Click"],
    //       description: "± 10",
    //     },
    //     {
    //       inputs: ["Ctrl", "Click"],
    //       description: "± 100",
    //     },
    //     {
    //       inputs: ["Alt", "Click"],
    //       description: "± 0.1",
    //     },
    //   ]
    // }

  ]

  let numberValue = 1
</script>


<div class="container">
  {#each data as {context, rows}}
  <label class="context">
    <span class="mr-2">{context}</span>
    {#if context === "Numbers"}
    <TextInput number bind:value={numberValue} />
    {:else if context === "Buttons"}
    <Button class="text-sm" on:click={() => numberValue++}>+</Button>
    {/if}
  </label>
  <table class="table">
    {#each rows as {inputs, description}}
    <tr class="row">
      <td class="inputs">
        {#each inputs as input}
        <div class="input">{input}</div> 
        {/each}
      </td>
      <td class="description">{description}</td>
    </tr>
    {/each}
  </table>
  {/each}
</div>



<style lang="text/postcss">
  .container {
    overflow: auto;
    max-height: 70vh;
  }
  .context:not(:last-child) {
    @apply mt-2;
  }
  .context {
    @apply text-lg text-gray-100 mb-2 mx-2 flex;
  }
  .row {
    @apply text-sm mb-1;
  }
  .inputs {
    @apply flex justify-end;
  }
  .input {
    @apply bg-gray-200 border-black text-gray-800 rounded-sm shadow;
    @apply px-2 text-xs mx-1;
  }
  .description {
    @apply pl-4 text-left;
  }
</style>