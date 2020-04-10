
<script>
  import cc from "color-convert"
  import { onMount } from "svelte"
  import { getUniqueId } from "common"
  import decorationMetadata from "metadata/decoration/index"

  import SvgImage from "components/common/SvgImage.svelte"
  
  import { mapSettings } from "state/map"

  export let obj


  $: selected = $obj.selected
  $: type = $obj.type
  $: x = $obj.x
  $: y = $obj.y
  $: reverse = $obj.reverse
  $: holeColor = $obj.holeColor

  $: specialType = 
    type === "F"
      ? $mapSettings.dodue
          ? $mapSettings.theme === "halloween"
              ? "F-candy"
              : "F-triple"
          : type
      : type === "T"
          ? holeColor !== ""
              ? "T-" + holeColor
              : type
          : type


  $: metadata = decorationMetadata.get(specialType)


  $: filters = metadata.svg
    ? metadata.filters.map(({name}, index) => {
        let matrix = getColorMatrix("#" + $obj.colors[index])
        return { name, matrix }
      })
    : []
  function getColorMatrix(hex) {
    let [r,g,b] = cc.hex.rgb(hex).map(x => x/255)
    return `
      1 0 0 0 ${r-0.5}
      0 1 0 0 ${g-0.5}
      0 0 1 0 ${b-0.5}
      0 0 0 1 0`.trim()
  }

  
  let instanceId = getUniqueId()

  let promise, currentFile = null
  $: if(metadata.svg && metadata.file !== currentFile) {
    currentFile = metadata.file
    promise = fetch(`dist/decorations/${metadata.file}`)
      .then(r => r.text())
      .then(withInstancedFilterIds)
  }
  function withInstancedFilterIds(xml) {
    for(let {name} of filters) {
      xml = xml.replace(new RegExp(name, "g"), name+"-"+instanceId)
    }
    return xml
  }


</script>




<g 
  transform="translate({x}, {y}) {reverse ? 'scale(-1, 1)' : ''}"
>
  <g transform="translate(-{metadata.offset.x}, -{metadata.offset.y})">

    {#if metadata.svg}

      {#each filters as filter}
        <filter id="{filter.name}-{instanceId}" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feColorMatrix type="matrix" values={filter.matrix} x="0%" y="0%" width="100%" height="100%" in="colormatrix" result="colormatrix1"/>
        </filter>
      {/each}

      <g class="object-outline cursor-pointer">
        {#await promise then svg}
          {@html svg}
        {/await}
      </g>

    {:else}
      {#if type == "DS" || type == "DC" || type == "DC2"}

        <SvgImage href="dist/decorations/{metadata.file}" class="pointer-events-none"/>
        <circle
          transform="translate({metadata.offset.x} {metadata.offset.y})"
          r="15"
          fill="transparent"
          class="object-outline-stroke cursor-pointer"
        />

      {:else if type == "F"}

        <SvgImage href="dist/decorations/{metadata.file}" class="pointer-events-none"/>
        <g transform="translate({metadata.offset.x} {metadata.offset.y})">
          <circle
            r="20"
            fill="transparent"
            class="object-outline-stroke cursor-pointer"
          />
          {#if selected}
            <circle r="5" fill="none" stroke="#ff00ff" stroke-width="1" class="pointer-events-none"/>
          {/if}
        </g>

      {:else if type == "T"}

        <SvgImage href="dist/decorations/{metadata.file}" class="pointer-events-none"/>
        <g transform="translate({metadata.offset.x} {metadata.offset.y - 15})">
          <circle
            r="20"
            fill="transparent"
            class="object-outline-stroke cursor-pointer"
          />
          {#if selected}
            <circle r="5" fill="none" stroke="#ff00ff" stroke-width="1" class="pointer-events-none"/>
          {/if}
        </g>        

      {:else}

        <SvgImage href="dist/decorations/{metadata.file}" class="object-outline cursor-pointer"/>

      {/if}
    {/if}

  </g>
</g>


{#if $mapSettings.miceSpawn.type === "random" 
  && type === "DS"
  && selected}    

  <g class="pointer-events-none"
    stroke="white" stroke-width="4" stroke-dasharray="8"
  >
    {#if $mapSettings.miceSpawn.axis === "x"}
      <line 
        x1={0} y1={y}
        x2={$mapSettings.width} y2={y}
      />
    {:else}
      <line 
        x1={x} y1={0} 
        x2={x} y2={$mapSettings.height} 
      />
    {/if}
  </g>

{/if}