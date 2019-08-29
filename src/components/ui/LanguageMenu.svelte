
<script>
  import { language, _, localeFlag } from "/stores/stores.js"

  import Tooltip from "/components/common/Tooltip.svelte"

</script>

<div class="container">
  {#each Object.entries(localeFlag) as [locale, flag]}
  <div class="m-1 cursor-pointer flag flag-{flag}"
    on:click={() => $language = locale}
  ></div>
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