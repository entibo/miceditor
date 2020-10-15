
<script>

  import cc from "color-convert"

  export let value = "000000"

  let hsv
  let lastSetValue
  function setValue(h, s, v) {
    hsv = [h, s, v]
    lastSetValue = value = cc.hsv.hex(h, s, v)
  }
  $: if(value !== lastSetValue) hsv = cc.hex.hsv(value || "000000")

  $: onlyHue = `hsl(${hsv[0]}, 100%, 50%)`
  $: hStyle = `
    background: ${onlyHue};
    left: 50%; 
    transform: translate(-50%, -50%) 
               translateY(${hueHeight*(1-hsv[0]/360)}px);`
  $: svStyle = `
    background: #${value}; 
    transform: translate(-50%, -50%) 
               translate(${svWidth*hsv[1]/100}px, ${svHeight*(1-hsv[2]/100)}px);`

  let hueElement, svElement
  let hueWidth, hueHeight, svWidth, svHeight
  let movingHue = false, movingSV = false
  function onHueMousedown(e) {
    movingHue = true
    onMousemove(e)
  }
  function onSVMousedown(e) {
    movingSV = true
    onMousemove(e)
  }
  function onMousemove({x,y}) {
    if(!movingHue && !movingSV) return
    let [h,s,v] = hsv
    if(movingHue) {
      let { top, right, bottom, left, width, height } = hueElement.getBoundingClientRect()
      let dy = Math.min(1, Math.max(0, (y - top) / height))
      let h = (1-dy) * 360
      setValue(h, s, v)
    }
    if(movingSV) {
      let { top, right, bottom, left, width, height } = svElement.getBoundingClientRect()
      let dx = Math.min(1, Math.max(0, (x - left) / width))
      let dy = Math.min(1, Math.max(0, (y - top) / height))
      let s = dx * 100
      let v = (1-dy) * 100
      setValue(h, s, v)
    }
    hueElement.dispatchEvent(new Event("input", { bubbles: true }))
  }
  function onMouseup(e) {
    movingHue = movingSV = false
  }
  
</script>

<svelte:window
  on:mousemove={onMousemove}
  on:mouseup={onMouseup}
  on:mouseleave={onMouseup}
/>

<div class="flex p-4 h-64" style="width: 14rem;" on:input >
  <div class="hue-select w-4 mr-4 rounded-sm relative"
    on:mousedown={onHueMousedown}
    bind:this={hueElement}
    bind:clientWidth={hueWidth}
    bind:clientHeight={hueHeight}
  >
    <div class="selector" style={hStyle} ></div>
  </div>
  <div class="value-saturation-select relative flex-grow rounded-sm"
    style="background: {onlyHue};"
    on:mousedown={onSVMousedown}
    bind:this={svElement}
    bind:clientWidth={svWidth}
    bind:clientHeight={svHeight}
  >
    <div class="selector" style={svStyle} ></div>
  </div>
</div>


<style lang="text/postcss">
  .hue-select {
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAEWCAYAAACnsf0eAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wcPEgMV7xXP/AAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAFTSURBVDjLfZFdksMgDIM/q0D35x57/+NtgMb7kMZAN9MXjyRLwpngP8UFQvCF4IbgjiAhKOewjGCMO8LK6TtQbAcN5FaQDe3oC/RKyzvN3vvyui1ot4SqgxrMaHNQD60G6oDaqjX+F0wxQD3opfmiagP0iFsm30vLxXBArGNfqUc9nJ/1GJqBvJyDDPIMsgLaM0jl1IZFQX21sGp7aBaJlJcFgV60WwE9LnxKQakIGkregm4IOqqxxSvKtDnhY7su8Io+6agfWkV+lLZ/iUZFmf5EU7P3uKXNV0FDOZrnx1/e+I3f2FGOP/gdKMcogD4mmtCNHRUcpWO7oFvECqBs6YnSEQPd2Z+JjBYzHg9ZII+FUDlahIotidl8Xpp5PDUBooJoAwnRdkS1WBiieVgcUYdP4XNEM+TVkTXWgn2JbUL0eHegLehI1KDt4mZAeCCzA/0BoHfNUPyhWYUAAAAASUVORK5CYII=');
    background-repeat: repeat-x;
    background-size: contain;
  }
  .value-saturation-select:before {
    content: "";
    @apply w-full h-full absolute rounded-sm;
    background: linear-gradient(to top, black, transparent), linear-gradient(to right, white, transparent);
  }
  .selector {
    @apply absolute w-4 h-4 rounded-full border-2 border-white shadow;
  }
</style>