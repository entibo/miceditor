
<script>
  import TextInput from "/components/common/TextInput.svelte"
  import Button from "/components/common/Button.svelte"

  import { _ } from "/stores/stores.js"

  let data = [
    {
      context: "Global",
      rows: [
        {
          inputs: ["Space", "Drag"],
          description: $_("move-camera"),
        },
        {
          inputs: ["Ctrl", "Scroll"],
          description: $_("button-zoom"),
        },
        {
          inputs: ["Click/Drag"],
          description: $_("select-unselect"),
        },
        {
          inputs: ["Shift", "Click/Drag"],
          description: $_("select-unselect"),
        },
        {
          inputs: ["Ctrl", "A"],
          description: $_("select-all"),
        },
        {
          inputs: ["Ctrl", "Shift", "A"],
          description: $_("unselect-all"),
        },
        {
          inputs: ["Escape"],
          description: $_("reset-camera"),
        },
        {
          inputs: ["Ctrl", "Z"],
          description: $_("button-undo"),
        },
        {
          inputs: ["Ctrl", "Y"],
          description: $_("button-redo"),
        },
        {
          inputs: ["Ctrl", "Shift", "Z"],
          description: $_("button-redo"),
        },
      ],
    },

    {
      context: "Selection",
      rows: [
        {
          inputs: ["Drag"],
          description: $_("move-selection"),
        },
        {
          inputs: ["Arrows"],
          description: $_("move-selection"),
        },
        {
          inputs: ["Shift", "Arrows"],
          description: $_("move-selection") + " (±10)",
        },
        {
          inputs: ["Ctrl", "Arrows"],
          description: $_("move-selection") + " (±100)",
        },
        {
          inputs: ["Scroll"],
          description: $_("rotate"),
        },
        {
          inputs: ["Shift", "Scroll"],
          description: $_("rotate-around-cursor"),
        },
        {
          inputs: ["Alt", "Scroll"],
          description: $_("rotate-slower"),
        },
        {
          inputs: ["Delete"],
          description: $_("button-delete"),
        },
        {
          inputs: ["D"],
          description: $_("button-duplicate"),
        },
        {
          inputs: ["Ctrl", "C"],
          description: $_("button-copy"),
        },
        {
          inputs: ["Ctrl", "X"],
          description: $_("cut"),
        },
        {
          inputs: ["Ctrl", "V"],
          description: $_("paste"),
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