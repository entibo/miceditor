
<script>

// import { platformProps as props } from "state/selectionProperties"
export let props

$: console.log(props)


</script>


<div class="form">

  <row> 
    <span>X</span> 
    <input type="number" bind:value={props.x} />
  </row>
  <row> 
    <span>Y</span> 
    <input type="number" bind:value={props.y} />
  </row>

  <row> 
    <span>invisible</span> 
    <input type="checkbox" bind:value={props.invisible} />
  </row>
  
  <row> 
    <span>lua</span> 
    <input bind:value={props.lua} />
  </row>

</div>