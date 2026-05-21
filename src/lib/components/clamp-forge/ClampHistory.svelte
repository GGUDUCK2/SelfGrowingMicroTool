<script lang="ts">
  import { db, type ClampForgeHistory } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { browser } from '$app/environment';
  import { Trash2, RotateCcw, Star } from 'lucide-svelte';
  import { dictionaries } from '$lib/dictionaries';

  export let lang: string = 'en';
  export let onRestore: (item: ClampForgeHistory) => void;

  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = dict.tools.clampForge;

  let history = liveQuery(() => {
    if (browser) {
      return db.clampForgeHistory.orderBy('createdAt').reverse().limit(50).toArray();
    }
    return [];
  });

  const deleteItem = async (id?: number) => {
    if (id && browser) {
      await db.clampForgeHistory.delete(id);
    }
  };

  const clearAll = async () => {
    if (browser && confirm('Are you sure you want to clear all history?')) {
        await db.clampForgeHistory.clear();
    }
  };

  const toggleStar = async (item: ClampForgeHistory) => {
    if (item.id && browser) {
      await db.clampForgeHistory.update(item.id, { starred: item.starred ? 0 : 1 });
    }
  };
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center mb-2">
    <h3 class="text-sm font-semibold text-slate-500 uppercase">{d.history}</h3>
    <button on:click={clearAll} class="min-h-[44px] min-w-[44px] text-xs text-rose-500 hover:text-rose-700 underline">
        {d.clear}
    </button>
  </div>

  {#if $history && $history.length > 0}
    <div class="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
      {#each $history as item (item.id)}
        <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-colors group">
          <div class="flex-1 min-w-0 pr-2">
            <p class="text-sm font-medium text-slate-900 dark:text-white truncate font-mono">{item.result}</p>
            <p class="text-xs text-slate-500 mt-1">
              {item.minSize}{item.unit}@{item.minWidth}px → {item.maxSize}{item.unit}@{item.maxWidth}px
            </p>
          </div>
          <div class="flex items-center space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md transition-colors {item.starred ? 'text-yellow-500 hover:bg-yellow-50' : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50'}" on:click={() => toggleStar(item)} title="Star" aria-label="Star">
              <Star size={16} fill={item.starred ? 'currentColor' : 'none'} />
            </button>
            <button class="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" on:click={() => onRestore(item)} title={d.restore} aria-label={d.restore}>
              <RotateCcw size={16} />
            </button>
            <button class="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" on:click={() => deleteItem(item.id)} title={d.delete} aria-label={d.delete}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center py-10 text-slate-400 text-sm">
      {d.history} is empty.
    </div>
  {/if}
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #cbd5e1;
        border-radius: 20px;
    }
    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #475569;
    }
</style>
