<script lang="ts">
  import { History, Trash2, ArrowRight } from 'lucide-svelte';
  import type { CurlHistoryItem } from '$lib/utils/curl-forge/db';
  import { db } from '$lib/utils/curl-forge/db';
  import { liveQuery } from 'dexie';

  export let dict: any = {};
  export let onLoad: (item: CurlHistoryItem) => void;

  let history$ = liveQuery(() => db.history.orderBy('createdAt').reverse().toArray());

  async function handleClearHistory() {
    await db.history.clear();
  }

  async function handleDelete(id: number) {
    await db.history.delete(id);
  }

  function getMethodColor(method: string) {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-green-600 dark:text-green-400';
      case 'POST': return 'text-blue-600 dark:text-blue-400';
      case 'PUT': return 'text-orange-600 dark:text-orange-400';
      case 'DELETE': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  }
</script>

<div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center">
      <History class="w-5 h-5 mr-2 text-blue-500" />
      {dict?.history?.title || 'Recent Activities'}
    </h3>
    {#if $history$ && $history$.length > 0}
      <button
        on:click={handleClearHistory}
        class="text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 min-h-[44px] min-w-[44px] px-2 rounded-lg flex items-center transition-colors"
      >
        {dict?.history?.clear || 'Clear History'}
      </button>
    {/if}
  </div>

  {#if !$history$ || $history$.length === 0}
    <div class="text-center py-8 text-slate-500 dark:text-slate-400">
      <History class="w-8 h-8 mx-auto mb-3 opacity-50" />
      <p>{dict?.history?.empty || 'No requests found.'}</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each $history$ || [] as item (item.id)}
        <div class="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors group">
          <button
            on:click={() => onLoad(item)}
            class="flex-1 text-left flex items-center min-h-[44px] overflow-hidden"
          >
            <span class="font-bold text-sm mr-3 {getMethodColor(item.method)} w-12 shrink-0">{item.method}</span>
            <span class="text-sm text-slate-700 dark:text-slate-300 truncate w-full max-w-[200px] sm:max-w-[400px]">{item.url || 'No URL'}</span>
          </button>

          <div class="flex items-center shrink-0 ml-2">
            <button
              on:click={() => onLoad(item)}
              class="p-2 text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
              aria-label="Load Request"
            >
              <ArrowRight class="w-4 h-4" />
            </button>
            <button
              on:click={() => item.id && handleDelete(item.id)}
              class="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
              aria-label="Delete Request"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
