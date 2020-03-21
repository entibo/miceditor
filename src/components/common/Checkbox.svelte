
<script>

  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher()

  import Icon from "fa-svelte"
  import { faSquare } from "@fortawesome/free-solid-svg-icons/faSquare"
  import { faCheckSquare } from "@fortawesome/free-solid-svg-icons/faCheckSquare"

  export let checked = false

  let className = ""
  export {className as class}

</script>

<label class="{className} cursor-pointer">

  <input type="checkbox" bind:checked on:change class="hidden" />
  <Icon icon={checked ? faCheckSquare : faSquare}/>

</label>

<style lang="text/postcss">
  label {
    line-height: 0;
  }
</style>
