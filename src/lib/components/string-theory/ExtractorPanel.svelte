<script lang="ts">
  import { slide } from 'svelte/transition';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import type { ExtractionResult } from '$lib/utils/string-theory/types';

  export let extractions: ExtractionResult[] = [];

  $: dict = getDictionary($page.params.lang || 'en').tools.stringTheory.extractors;

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  function getLabel(type: string) {
      // Use dictionary keys if available, otherwise fallback to type
      return (dict as any)[type] || type;
  }
</script>

{#if extractions.length > 0}
  <div transition:slide class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div class="px-6 py-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/50 flex justify-between items-center">
      <h3 class="text-lg font-bold text-indigo-900 dark:text-indigo-300">{dict.title}</h3>
      <span class="text-xs font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-full">
        {extractions.reduce((a, b) => a + b.count, 0)} {dict.itemsFound}
      </span>
    </div>

    <div class="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {#each extractions as item}
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{getLabel(item.type)} ({item.count})</span>
            <button
              on:click={() => copy(item.value)}
              class="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              {dict.copyAll}
            </button>
          </div>
          <div class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 max-h-32 overflow-y-auto text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {item.value}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
