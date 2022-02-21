<script>
  import * as Creation from "state/creation"
  import { creation } from "state/creation"
  import { mapSettings } from "state/map"
  import shamanObjectMetadata from "metadata/shamanObject/index"

  import ShamanObjectImage from "components/ui/ShamanObjectImage.svelte"
  import { readShamanTools, writeShamanTools } from "data/base/MapSettings"

  export let value = null
  $: list = readShamanTools(value)
  $: rows = (() => {
    const rows = []
    for (let i = 0; i < list.length; i += 3) {
      rows.push(list.slice(i, i + 3))
    }
    return rows
  })()

  $: console.log("value", value)
  $: console.log("list", list)

  export let onChange = (value) => {
    console.log("onChange", value)
  }

  function onSelect(type) {
    console.log("select", type)
    if (list.includes(type)) {
      list = list.filter((t) => t !== type)
    } else {
      list.push(type)
    }
    onChange(writeShamanTools(list))
  }
</script>

<div class="flex flex-row">
  <div class="menu flex flex-wrap justify-center">
    {#each shamanObjectMetadata
      .shamanToolsEntries()
      .filter(([_, data]) => !data.isVariant) as [type, data]}
      <div
        class="tile"
        class:active={list.includes(type)}
        on:click={() => onSelect(type)}
      >
        <ShamanObjectImage tile {data} />
      </div>
    {/each}
  </div>
  <div class="menu flex flex-col items-center">
    {#each rows as row}
      <div class="flex flex-no-wrap self-start">
        {#each row as type}
          <div class="tile" on:click={() => onSelect(type)}>
            <ShamanObjectImage tile data={shamanObjectMetadata.get(type)} />
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .menu {
    min-width: 160px;
    max-height: 300px;
    overflow: auto;
  }
</style>
