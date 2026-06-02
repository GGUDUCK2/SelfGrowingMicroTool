<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db } from '$lib/db';
  import { formatDistanceToNow } from 'date-fns';
  import { FileSpreadsheet, Trash2, Clock, Star } from '@lucide/svelte';
  import type { CsvForgeHistory } from '$lib/db';

  export let dict: any;

  const dispatch = createEventDispatcher();
  let historyItems: CsvForgeHistory[] = [];

  $: historyObservable = liveQuery(() =>
    db.csvForgeHistory.orderBy('createdAt').reverse().limit(50).toArray()
  );

  $: if ($historyObservable) {
    historyItems = $historyObservable;
  }

  async function deleteItem(id: number | undefined) {
    if (id) {
      await db.csvForgeHistory.delete(id);
    }
  }

  async function toggleStar(item: CsvForgeHistory) {
    if (item.id) {
      await db.csvForgeHistory.update(item.id, {
        starred: item.starred ? 0 : 1
      });
    }
  }

  function restoreItem(item: CsvForgeHistory) {
    dispatch('restore', item);
  }
</script>

<div class="space-y-4">
  <div class="flex items-center space-x-2 text-slate-800 dark:text-slate-200 mb-6">
    <Clock size={20} class="text-indigo-500" />
    <h3 class="font-semibold">{dict.historyLabel}</h3>
  </div>

  {#if historyItems.length === 0}
    <div class="text-center py-8 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
      {dict.emptyHistory}
    </div>
  {:else}
    <div class="space-y-3">
      {#each historyItems as item (item.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="w-full text-left group relative bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all cursor-pointer overflow-hidden"
          on:click={() => restoreItem(item)}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && restoreItem(item)}
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center space-x-3 truncate pr-4">
              <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                <FileSpreadsheet size={16} />
              </div>
              <div class="truncate">
                <p class="font-medium text-sm text-slate-900 dark:text-white truncate" title={item.filename}>
                  {item.filename || 'Untitled.csv'}
                </p>
                <div class="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>{item.rowCount} rows</span>
                  <span>•</span>
                  <span>{item.columnCount} cols</span>
                  <span>•</span>
                  <span title={new Date(item.createdAt).toLocaleString()}>{formatDistanceToNow(new Date(item.createdAt))} ago</span>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-amber-500 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                on:click|stopPropagation={() => toggleStar(item)}
                title="Toggle Star"
                aria-label="Toggle Star"
              >
                <Star size={14} class={item.starred ? 'fill-amber-500 text-amber-500' : ''} />
              </button>
              <button
                class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                on:click|stopPropagation={() => deleteItem(item.id)}
                title="Delete"
                aria-label="Delete History Item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
