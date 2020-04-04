
<script>

  import Icon from "fa-svelte"
  import { faSquare } from "@fortawesome/free-solid-svg-icons/faSquare"
  import { faCheckSquare } from "@fortawesome/free-solid-svg-icons/faCheckSquare"
  import { faMinusSquare } from "@fortawesome/free-solid-svg-icons/faMinusSquare"

  let className = ""
  export {className as class}

  export let checked
  export let set = null

  function onChange(e) {
    if(checked) checked = false
    else checked = true
    if(set) set(checked)
  }

  $: icon = checked === true ? faCheckSquare
          : checked === false ? faSquare
          : faMinusSquare

</script>

<label class="cursor-pointer {className}">

  <input type="checkbox" checked={checked} on:change={onChange} class="hidden" />
  <Icon {icon} />

</label>

<style lang="text/postcss">
  label {
    line-height: 0;
  }
</style>
