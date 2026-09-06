<script lang="ts">
  import registry from "$lib/registry.json";

  export let lang: 'en' | 'ko';
  export let currentSlug: string;
  export let currentCategory: string;

  $: relatedTools = registry
    .filter(t => t.category === currentCategory && t.slug !== currentSlug)
    .slice(0, 3);
</script>

{#if relatedTools.length > 0}
  <div class="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6">
      {lang === 'ko' ? '관련 도구 추천' : 'Related Tools'}
    </h3>
    <div class="grid md:grid-cols-3 gap-6">
      {#each relatedTools as tool (tool.id)}
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a
          href="/{lang}/tools/{tool.slug}"
          class="block p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all min-h-[44px] min-w-[44px]"
        >
          <div class="font-semibold text-slate-900 dark:text-white mb-2">
            {tool.title[lang]}
          </div>
          <div class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {tool.description[lang]}
          </div>
        </a>
      {/each}
    </div>
  </div>
{/if}
