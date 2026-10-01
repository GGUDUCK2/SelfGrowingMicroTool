<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/db';
  import { Clock, Trash2, Star, Download, Play } from '@lucide/svelte';
  import { formatDistanceToNow } from 'date-fns';
  import { enUS, ko } from 'date-fns/locale';
  import type { FlexForgeHistoryItem } from '$lib/db/flex-forge';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dict: Record<string, any>;
  export let onSelect: (item: FlexForgeHistoryItem) => void;
  export let lang: string = 'en';

  let historyItems: FlexForgeHistoryItem[] = [];

  const loadHistory = async () => {
    historyItems = await db.flexForgeHistory.orderBy('createdAt').reverse().toArray();
  };

  onMount(() => {
    loadHistory();
  });

  const deleteItem = async (id: number) => {
    await db.flexForgeHistory.delete(id);
    await loadHistory();
  };

  const toggleStar = async (item: FlexForgeHistoryItem) => {
    await db.flexForgeHistory.update(item.id!, { starred: !item.starred });
    await loadHistory();
  };
</script>

<div class="h-full flex flex-col bg-slate-50 dark:bg-slate-800/50 p-4 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
  <div class="flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
    <Clock size={20} class="text-indigo-500" />
    <h3 class="text-lg font-bold">{dict.historySidebar.title}</h3>
  </div>

  {#if historyItems.length === 0}
    <div class="text-center py-12 text-slate-500 dark:text-slate-400">
      <Clock size={48} class="mx-auto mb-4 opacity-20" />
      <p>{dict.historySidebar.empty}</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each historyItems as item (item.id || item.createdAt)}
        <div class="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group relative">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
              {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: lang === 'ko' ? ko : enUS })}
            </span>
            <button
              class="text-slate-400 hover:text-yellow-500 transition-colors p-1"
              on:click={() => toggleStar(item)}
            >
              <Star size={16} class={item.starred ? "fill-yellow-500 text-yellow-500" : ""} />
            </button>
          </div>

          <div class="flex gap-2 flex-wrap text-xs text-slate-600 dark:text-slate-300 font-mono mb-4">
             <span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">{item.containerProps.flexDirection}</span>
             <span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">{item.items.length} items</span>
          </div>

          <div class="flex gap-2 w-full mt-2">
            <button
              class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg text-sm font-medium transition-colors"
              on:click={() => onSelect(item)}
            >
              <Play size={14} />
              {dict.historySidebar.load}
            </button>
            <button
              class="flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              on:click={() => deleteItem(item.id!)}
              title={dict.historySidebar.delete}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
