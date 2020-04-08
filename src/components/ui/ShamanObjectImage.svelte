
<script>
  export let data

  $: elementWidth = Math.max(40, data.boundingWidth)
  $: elementHeight = Math.max(40, data.boundingHeight)

  $: offset = data.offset ? data.offset : { x: 0, y: 0 }

  $: filename = data.sprite || data.spritesheet

</script>

<div style="width: {elementWidth}px; height: {elementHeight}px;" class="relative">
  <div class="floating">
    <img src="dist/shamanObjects/{filename}" alt={filename}
      style=" object-fit: none;
              object-position:  {-offset.x}px 
                                {-offset.y}px;
              width: {data.width}px; 
              height: {data.height}px;
              min-width: {data.width}px; 
              min-height: {data.height}px;"
    />
  </div>
</div>

<style>
  .floating {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
</style>
