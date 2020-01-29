
<script lang="ts">

export let props


</script>


<div>

  <row> 
    <span>X</span> 
    <input type="number" bind:value={props.x} />
  </row>

  <row> 
    <span>Foreground</span> 
    <input type="checkbox" bind:value={props.foreground} />
  </row>
  
  <row> 
    <span>Friction</span> 
    <input type="number" bind:value={props.friction} />
    <div class="icon ml-3" 
      class:disabled={multi._friction_default === "" || multi._friction === multi._friction_default}
      on:click={() => resetProperty("friction")}
    ><Icon icon={faUndo} /></div>
  </row>

</div>