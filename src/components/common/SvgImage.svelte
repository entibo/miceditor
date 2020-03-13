
<script>
  export let href
  export let x = 0
  export let y = 0
  export let width = 0
  export let height = 0
  let className = ""
  export { className as class }

  function getDimensions(href) {
    let img = new Image()
    img.onload = () => {
      width = img.width
      height = img.height
    }
    img.src = href
  }
  $: if(width === 0 && height === 0) getDimensions(href)
</script>

<image class={className} {href} {x} {y} {width} {height} 
  on:mousedown|preventDefault
/>