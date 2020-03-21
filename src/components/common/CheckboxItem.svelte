
<script>
  import Checkbox from "./Checkbox.svelte"

  export let checked
  export let name
</script>

<label class="cursor-pointer">
  <Checkbox bind:checked />
  <span class="ml-2">{name}</span>
</label>

<style lang="text/postcss">
</style>