
<script>

  import Icon from "fa-svelte"
  import { faSquare } from "@fortawesome/free-solid-svg-icons/faSquare"
  import { faCheckSquare } from "@fortawesome/free-solid-svg-icons/faCheckSquare"
  import { faMinusSquare } from "@fortawesome/free-solid-svg-icons/faMinusSquare"
  import { faLock } from "@fortawesome/free-solid-svg-icons/faLock"
  import { faUnlock } from "@fortawesome/free-solid-svg-icons/faUnlock"
  import { faEye } from "@fortawesome/free-solid-svg-icons/faEye"
  import { faEyeSlash } from "@fortawesome/free-solid-svg-icons/faEyeSlash"

  let className = ""
  export {className as class}

  export let checked
  export let set = null

  export let type = "check"

  function onChange(e) {
    if(checked) checked = false
    else checked = true
    if(set) set(checked)
  }

  const icons = {
    check: {
      false: faSquare,
      true: faCheckSquare,
      indeterminate: faMinusSquare,
    },
    eye: {
      false: faEye,
      true: faEyeSlash,
      indeterminate: faEyeSlash,
    },
    lock: {
      false: faUnlock,
      true: faLock,
      indeterminate: faLock,
    },
  }

  $: icon = checked === true ? icons[type].true
          : checked === false ? icons[type].false
          : icons[type].indeterminate

</script>

<label class="cursor-pointer {className}">

  <input type="checkbox" checked={checked} on:change={onChange} class="hidden" />
  <Icon {icon} class={type === "check" ? (checked === true ? "text-blue-200" : "") : checked === false ? "" : checked === true ? "text-red-500" : "text-yellow-500"}/>

</label>

<style lang="text/postcss">
  label {
    line-height: 0;
  }
</style>
