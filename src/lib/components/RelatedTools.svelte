<script lang="ts">
  import { page } from "$app/stores";
  import registry from "$lib/registry.json";

  export let currentToolId: string;
  export let category: string;

  $: lang = $page.params.lang || "en";

  // Filter tools by same category, exclude current, limit to 3
  $: relatedTools = registry
    .filter(
      (tool) => tool.category === category && tool.id !== currentToolId
    )
    .slice(0, 3);
</script>

{#if relatedTools.length > 0}
  <div class="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 pb-8">
    <h2 class="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
      {lang === "ko" ? "관련 도구 추천" : "Related Tools"}
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each relatedTools as tool}
        <a
          href="/{lang}/tools/{tool.slug}"
          class="block p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all hover:border-indigo-500 dark:hover:border-indigo-400 group min-h-[44px]"
        >
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
            {tool.title[lang] || tool.title["en"]}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {tool.description[lang] || tool.description["en"]}
          </p>
        </a>
      {/each}
    </div>
  </div>
{/if}
