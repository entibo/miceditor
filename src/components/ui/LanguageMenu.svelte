
<script>
  import { language, _, localeFlag } from "/stores/stores.js"

</script>

<div class="container">
  {#each Object.entries(localeFlag) as [locale, flag]}
  <div class="m-1 cursor-pointer flag flag-{flag}"
    on:click={() => $language = locale}
  ></div>
  {/each}
  <div class="mt-2 text-sm">Help translate:</div>
</div>


<style lang="text/postcss">
  .container {
    overflow: auto;
    max-height: 70vh;
  }
  .row {
    @apply text-sm mb-1;
  }
  .description {
    @apply pl-4 text-left;
  }
</style>