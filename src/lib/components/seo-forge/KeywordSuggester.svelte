<script lang="ts">
  import { extractKeywords, type MetaTags } from '$lib/utils/seo';

  export let tags: MetaTags;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dictionary: any;

  let suggestions: string[] = [];

  $: {
      if (tags.title || tags.description) {
          const combined = (tags.title + ' ' + tags.description);
          suggestions = extractKeywords(combined, 8);
      }
  }

  function addKeyword(keyword: string) {
      const current = tags.keywords ? tags.keywords.split(',').map(k => k.trim()) : [];
      if (!current.includes(keyword)) {
          current.push(keyword);
          tags.keywords = current.join(', ');
      }
  }

  $: currentKeywords = tags.keywords ? tags.keywords.split(',').map(k => k.trim()) : [];
</script>

<div class="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700 mt-4">
  <div class="flex items-center gap-2 mb-3">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">{dictionary.keywordSuggester?.title || 'Smart Keyword Suggestions'}</h3>
  </div>

  {#if suggestions.length === 0}
      <p class="text-xs text-slate-500 italic">{dictionary.keywordSuggester?.empty || 'Type in the title or description to generate suggestions...'}</p>
  {:else}
      <div class="flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
          {#each suggestions as keyword}
              <button
                  on:click={() => addKeyword(keyword)}
                  disabled={currentKeywords.includes(keyword)}
                  class="min-h-[44px] min-w-[44px] text-xs px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1
                  {currentKeywords.includes(keyword)
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 cursor-default'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:border-indigo-500'}"
                  title={dictionary.keywordSuggester?.usage || 'Click to add'}
              >
                  {keyword}
                  {#if currentKeywords.includes(keyword)}
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  {:else}
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  {/if}
              </button>
          {/each}
      </div>
  {/if}
</div>
