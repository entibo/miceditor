
<script>
  import cc from "color-convert"
  import { onMount } from "svelte"
  import { getUniqueId } from "/utils.js"
  import decorationMetadata from "/decorationMetadata.js"

  export let decoration
  export let active

  let instanceId = getUniqueId()

  $: metadata = getDecorationMetadata(decoration)
  const specialMetadataOffset = {
    T: { x: 21, y: 31 },
    F: { x: 23, y: 21 },
    DS: { x: 26, y: 43 },
    DC: { x: 26, y: 43 },
    DC2: { x: 26, y: 43 },
  }
  function getDecorationMetadata(decoration) {
    if(decoration.name === "P") {
      return decorationMetadata[decoration._type]
    }
    return { 
      type: decoration._type, 
      filters: [],
      offset: specialMetadataOffset[decoration._type],
    }
  }

  $: filters = getFilters(decoration)
  function getFilters() {
    return metadata.filters.map(({name,defaultColor}, index) => {
      let color = decoration["_displayColor"+index]
      let matrix = getColorMatrix(color)
      return { name, matrix }
    })
  }

  function withInstancedFilterIds(xml) {
    for(let {name} of filters) {
      xml = xml.replace(new RegExp(name, "g"), name+"-"+instanceId)
    }
    return xml
  }

  $: filtersLength = filters.length
  $: decorationType = decoration._type
  
  let promise
  $: if(filtersLength)
      promise = fetch(`decorations/${decorationType}.svg`).then(r => r.text()).then(withInstancedFilterIds)

  function getColorMatrix(hex) {
    let [r,g,b] = cc.hex.rgb(hex).map(x => x/255)
    return `
      1 0 0 0 ${r-0.5}
      0 1 0 0 ${g-0.5}
      0 0 1 0 ${b-0.5}
      0 0 0 1 0`.trim()
  }

</script>




<g on:mousedown 
  class="decoration" class:active={active} 
  transform="translate({decoration._x}, {decoration._y}) {decoration._reverse ? 'scale(-1, 1)' : ''}"
>
  <g transform="translate(-{metadata.offset.x}, -{metadata.offset.y})">

    {#if filters.length}

      {#each filters as filter}
      <filter id="{filter.name}-{instanceId}" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values={filter.matrix} x="0%" y="0%" width="100%" height="100%" in="colormatrix" result="colormatrix1"/>
      </filter>
      {/each}

      {#await promise then svg}
        {@html svg}
      {/await}

    {:else}

      <image href="decorations/{decoration._type}.png"/>

    {/if}

  </g>
</g>

<style lang="text/postcss">
  .decoration * {
    transition: fill 100ms, outline-color 50ms;
    outline-width: 4px;
    outline-offset: -4px;
    outline-style: dashed;
    outline-color: rgba(255,255,255,0.0);
  }
  .decoration *:hover {
    cursor: pointer;
    outline-color: rgba(255,255,255,0.5);
  }
  .decoration.active * {
    outline-color: rgba(255,255,255,0.95);
  }

</style>