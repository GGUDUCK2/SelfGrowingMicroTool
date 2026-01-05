<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type CronHistory as CronHistoryType } from '$lib/db';
  import { slide } from 'svelte/transition';
  import { getDictionary } from '$lib/dictionaries';

  export let lang: string = 'en';
  export let onSelect: (expression: string) => void;

  $: dict = getDictionary(lang).tools.cronEditor;

  let history = liveQuery(async () => {
    return await db.cronHistory
      .orderBy('createdAt')
      .reverse()
      .limit(20)
      .toArray();
  });

  async function deleteItem(id: number) {
    if (id) await db.cronHistory.delete(id);
  }

  async function clearHistory() {
    await db.cronHistory.clear();
  }

  function formatDate(date: Date) {
      return new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }).format(date);
  }
</script>

<div class="bg-white/5 border border-white/10 rounded-xl p-6 min-h-[200px]">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-white">
      {dict.historyTitle}
    </h3>
    {#if $history && $history.length > 0}
      <button
        class="text-xs text-red-400 hover:text-red-300 transition-colors"
        on:click={clearHistory}
      >
        {dict.clearAll}
      </button>
    {/if}
  </div>

  {#if !$history}
    <p class="text-gray-500 text-sm animate-pulse">{dict.loading}</p>
  {:else if $history.length === 0}
    <p class="text-gray-500 text-sm">{dict.emptyHistory}</p>
  {:else}
    <div class="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {#each $history as item (item.id)}
        <div class="group flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 border border-white/5 hover:border-white/10 transition-all" transition:slide>
          <button
            class="flex-1 text-left"
            on:click={() => onSelect(item.expression)}
          >
             <div class="flex items-center space-x-2">
                 <span class="font-mono text-indigo-300 font-medium">{item.expression}</span>
                 <span class="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
             </div>
             <p class="text-xs text-gray-400 mt-1 truncate max-w-[200px] lg:max-w-[300px]">
                 {item.description}
             </p>
          </button>
          <button
            class="p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-white/5"
            aria-label="Delete"
            on:click={() => item.id && deleteItem(item.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
