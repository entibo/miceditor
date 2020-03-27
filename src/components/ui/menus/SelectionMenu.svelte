
<script>
  import { tick } from "svelte"
  import { slide, fly } from "svelte/transition"

  import Icon from "fa-svelte"
  import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo"
  import { faEye } from "@fortawesome/free-solid-svg-icons/faEye"
  import { faEyeSlash } from "@fortawesome/free-solid-svg-icons/faEyeSlash"
  import { faTrashAlt as faTrash } from "@fortawesome/free-solid-svg-icons/faTrashAlt"
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus"
  import { faCircle } from "@fortawesome/free-solid-svg-icons/faCircle"
  import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle"

  import TextInput from "/components/common/TextInput.svelte"
  import Tooltip from "/components/common/Tooltip.svelte"
  import ColorTextInput from "/components/common/ColorTextInput.svelte"
  import Button from "/components/common/Button.svelte"
  import Checkbox from "/components/common/Checkbox.svelte"
  import CheckboxItem from "/components/common/CheckboxItem.svelte"

  import Platforms from "/components/ui/menus/selectionMenu/Platforms.svelte"


  import { platformProps, } from "state/selectionProperties"

  console.log("platformProps", platformProps)

  let _platformProps
  platformProps.subscribe(v => _platformProps = v)
  
  import * as sceneObjects from "/state/sceneObjects"


</script>

<div class="form">

  <Platforms props={_platformProps} />

  <div class="mb-2"></div>

</div>



<style lang="text/postcss">




</style>