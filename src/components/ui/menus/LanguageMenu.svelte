
<script>
  import { userLocale, _, locales, translators } from "state/locale"

  import Tooltip from "components/common/Tooltip.svelte"

  function formatTranslatorsTooltipTitle(list) {
    if(!list || !list.length) return ""
    return `By ${list.join(", ")}`
  }

</script>

<div class="container">
  {#each locales as locale}
    <Tooltip bottom
      active={ translators[locale] !== undefined ? null : false }
      title={ formatTranslatorsTooltipTitle(translators[locale]) }
      class="inline"
    >
      <div class="m-1 cursor-pointer flag flag-{locale}"
        on:click={() => $userLocale = locale}
      ></div>
    </Tooltip>
  {/each}
  <div class="ml-1 text-sm text-center">
    <Tooltip bottom title="Request to be editor and tell me which language you want to translate!">
      <a href="https://docs.google.com/spreadsheets/d/1Hfjn9HaykT3OxKRfR3psSnK9LqLPDkwYMk3EJnU3CnY">
        Translation spreadsheet
      </a>
    </Tooltip>
  </div>
</div>


<style lang="text/postcss">
  .container {
    max-height: 70vh;
    text-align: center;
  }
  .row {
    @apply text-sm mb-1;
  }
  .description {
    @apply pl-4 text-left;
  }
  a {
    @apply appearance-none text-white font-bold;
  }
</style>