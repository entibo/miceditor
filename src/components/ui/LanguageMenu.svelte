
<script>
  import { language, _, localeFlag, localeTranslators } from "state/locale"

  import Tooltip from "components/common/Tooltip.svelte"

  function formatTranslatorsTooltipTitle(list) {
    if(!list || !list.length) return ""
    return `By ${list.join(", ")}`
  }

</script>

<div class="container">
  {#each Object.entries(localeFlag) as [locale, flag]}
  <Tooltip bottom
    active={ localeTranslators[locale] !== undefined ? null : false }
    title={ formatTranslatorsTooltipTitle(localeTranslators[locale]) }
  >
    <div class="m-1 cursor-pointer flag flag-{flag}"
      on:click={() => $language = locale}
    ></div>
  </Tooltip>
  {/each}
  <div class="mt-2 text-sm">
    <Tooltip bottom title="Send me an email with the language(s) you want to translate!">
      <a href="mailto:thibautguenedal@gmail.com">
        Help translate!
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