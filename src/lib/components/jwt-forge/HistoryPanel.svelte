<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db } from '$lib/db';
  import { format } from 'date-fns';
  import { createEventDispatcher } from 'svelte';

  export let dictionary: any;

  const dispatch = createEventDispatcher();

  let history = liveQuery(() => db.jwtForgeHistory.orderBy('createdAt').reverse().limit(10).toArray());

  function restore(item: any) {
    dispatch('restore', item);
  }

  function deleteItem(id: number) {
    db.jwtForgeHistory.delete(id);
  }

  function clearHistory() {
    db.jwtForgeHistory.clear();
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
  <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
    <h3 class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/><path d="M3 3v9h9"/><path d="M12 7v5l4 2"/></svg>
      {dictionary.jwtForge.history}
    </h3>
    <button on:click={clearHistory} class="text-xs text-red-500 hover:text-red-600 font-medium">
      {dictionary.jwtForge.clear}
    </button>
  </div>

  <div class="p-2 space-y-2">
    {#if $history}
      {#each $history as item (item.id)}
        <div class="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
          <button class="flex-1 text-left overflow-hidden mr-4" on:click={() => restore(item)}>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {item.algorithm || 'JWT'}
              </span>
              <span class="text-xs text-slate-400">
                {format(item.createdAt, 'MMM d, HH:mm')}
              </span>
            </div>
            <div class="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
              {item.token.substring(0, 15)}...{item.token.substring(item.token.length - 10)}
            </div>
          </button>

          <button
            on:click|stopPropagation={() => item.id && deleteItem(item.id)}
            class="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      {/each}

      {#if $history.length === 0}
        <div class="p-8 text-center text-slate-400 text-sm">
          {dictionary.jwtForge.noHistory}
        </div>
      {/if}
    {:else}
       <div class="p-4 text-center text-slate-400 text-sm">Loading...</div>
    {/if}
  </div>
</div>
