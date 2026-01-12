<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { db, type StringHistory } from '$lib/db/string-theory';
  import { liveQuery } from 'dexie';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  $: dict = getDictionary($page.params.lang || 'en').tools.stringTheory;

  let history$ = liveQuery(() => db.history.orderBy('timestamp').reverse().limit(50).toArray());

  function restore(item: StringHistory) {
    dispatch('restore', item.text);
  }

  function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString();
  }

  async function toggleFavorite(item: StringHistory) {
      if (item.id) {
          await db.history.update(item.id, { isFavorite: !item.isFavorite });
      }
  }

  async function deleteItem(id: number) {
      await db.history.delete(id);
  }

  async function clearHistory() {
      await db.history.clear();
  }
</script>

<div class="h-full flex flex-col bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 w-80 fixed right-0 top-0 bottom-0 shadow-xl transform transition-transform duration-300 z-50 overflow-hidden">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
    <h2 class="font-semibold text-slate-800 dark:text-white">{dict.history}</h2>
    <div class="flex gap-2">
      <button on:click={clearHistory} class="text-xs text-red-500 hover:text-red-600 font-medium">Clear</button>
      <button
        on:click={() => dispatch('close')}
        class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        aria-label="Close History"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-4 space-y-3">
    {#if $history$}
      {#each $history$ as item (item.id)}
        <div transition:slide|local class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group relative">
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
              {item.operation}
            </span>
            <span class="text-[10px] text-slate-400">{formatTime(item.timestamp)}</span>
          </div>

          <button
            class="text-left w-full text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-mono break-all mb-2 cursor-pointer hover:text-slate-900 dark:hover:text-white focus:outline-none"
            on:click={() => restore(item)}
            aria-label="Restore text"
          >
            {item.text}
          </button>

          <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              on:click|stopPropagation={() => toggleFavorite(item)}
              class="text-slate-400 hover:text-yellow-500 transition-colors"
              title="Favorite"
              aria-label="Toggle Favorite"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 {item.isFavorite ? 'text-yellow-500 fill-current' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button
              on:click|stopPropagation={() => restore(item)}
              class="text-slate-400 hover:text-indigo-500 transition-colors"
              title="Restore"
              aria-label="Restore"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              on:click|stopPropagation={() => deleteItem(item.id!)}
              class="text-slate-400 hover:text-red-500 transition-colors"
              title="Delete"
              aria-label="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      {/each}
    {:else}
      <div class="text-center text-slate-400 py-10">
        <p>No history yet.</p>
      </div>
    {/if}
  </div>
</div>
