<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { db, type TableForgeHistory } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { X, Clock, Trash2, RotateCcw } from '@lucide/svelte';

  export let dict: any;
  const dispatch = createEventDispatcher();

  let history = liveQuery(() => db.tableForgeHistory.orderBy('createdAt').reverse().limit(50).toArray());

  function restore(item: TableForgeHistory) {
    dispatch('restore', item);
  }

  function deleteItem(id: number) {
    db.tableForgeHistory.delete(id);
  }

  function clearAll() {
    db.tableForgeHistory.clear();
  }
</script>

<div class="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-xl z-20 absolute right-0 top-0 bottom-0" transition:slide={{ axis: 'x', duration: 200 }}>
  <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
    <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
      <Clock size={18} />
      {dict.history}
    </h3>
    <div class="flex items-center gap-1">
        <button class="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center" on:click={clearAll} title={dict.clear}>
            <Trash2 size={16} />
        </button>
        <button class="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded min-h-[44px] min-w-[44px] flex items-center justify-center" on:click={() => dispatch('close')} aria-label="Close">
            <X size={18} />
        </button>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-2 space-y-2">
    {#if $history}
      {#if $history.length === 0}
        <div class="text-center text-slate-500 py-8 text-sm">{dict.historyEmpty || 'No history'}</div>
      {/if}
      {#each $history as item (item.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="group p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer relative" on:click={() => restore(item)}>
           <div class="flex justify-between items-start mb-1">
               <span class="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded">
                   {item.format || 'Table'}
               </span>
               <span class="text-[10px] text-slate-400">
                   {item.createdAt.toLocaleDateString()}
               </span>
           </div>
           <div class="text-xs text-slate-500 line-clamp-2 font-mono bg-slate-50 dark:bg-slate-900/50 p-1 rounded">
               {JSON.stringify(item.data).slice(0, 100)}...
           </div>

           <button
                class="absolute top-2 right-2 p-1.5 bg-white dark:bg-slate-700 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
                on:click|stopPropagation={() => item.id && deleteItem(item.id)}
                aria-label="Delete history item"
           >
               <Trash2 size={14} />
           </button>
        </div>
      {/each}
    {/if}
  </div>
</div>
