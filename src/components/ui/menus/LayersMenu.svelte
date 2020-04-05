
<script>
  import Tooltip from "components/common/Tooltip.svelte"
  import Button from "components/common/Button.svelte"

</script>

<div class="form">
  <Tooltip top       title="Tooltip"><Button >This is a button</Button></Tooltip>
  <Tooltip top start title="Tooltip"><Button >This is a button</Button></Tooltip>
  <Tooltip top end   title="Tooltip"><Button >This is a button</Button></Tooltip>
  
  <Tooltip bottom       title="Tooltip"><Button >This is a button</Button></Tooltip>
  <Tooltip bottom start title="Tooltip"><Button >This is a button</Button></Tooltip>
  <Tooltip bottom end   title="Tooltip"><Button >This is a button</Button></Tooltip>
  
  <Tooltip left       title="Tooltip"><Button >This is a button</Button></Tooltip>
  <Tooltip left start title="Tooltip"><Button >This is a button</Button></Tooltip>
  <Tooltip left end   title="Tooltip"><Button >This is a button</Button></Tooltip>
  
  <Tooltip right       title="Tooltip"><Button >This is a button</Button></Tooltip>
  <Tooltip right start title="Tooltip"><Button >This is a button</Button></Tooltip>
  <Tooltip right end   title="Tooltip"><Button >This is a button</Button></Tooltip>
</div>