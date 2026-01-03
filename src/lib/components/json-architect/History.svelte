<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type JsonHistory } from '$lib/db';
  import { createEventDispatcher } from 'svelte';

  export let t: any;

  const dispatch = createEventDispatcher();

  let history = liveQuery(() => db.jsonHistory.orderBy('createdAt').reverse().limit(10).toArray());

  function restore(item: JsonHistory) {
      dispatch('restore', item.content);
  }

  function remove(id: number) {
      db.jsonHistory.delete(id);
  }
</script>

<div class="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t.history}</h3>

  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {#if $history}
      {#each $history as item (item.id)}
        <div class="group relative p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
           <div class="flex justify-between items-start mb-2">
              <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  {item.action?.toUpperCase() || 'EDIT'}
              </span>
              <span class="text-xs text-gray-400">
                  {item.createdAt.toLocaleDateString()}
              </span>
           </div>
           <div class="h-16 overflow-hidden text-xs text-gray-500 dark:text-gray-400 font-mono mb-3 bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
              {item.content.slice(0, 100)}...
           </div>

           <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                 on:click={() => restore(item)}
                 class="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                  {t.restore}
              </button>
               <button
                 on:click={() => item.id && remove(item.id)}
                 class="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                  {t.delete}
              </button>
           </div>
        </div>
      {/each}
      {#if $history.length === 0}
         <div class="col-span-full text-center py-8 text-gray-400">
             {t.historyEmpty || "No history yet"}
         </div>
      {/if}
    {/if}
  </div>
</div>
