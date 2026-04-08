<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { workspace } from '$lib/db/workspace';
  import { liveQuery } from 'dexie';

  export let t: any;

  const dispatch = createEventDispatcher();
  const TOOL_ID = 'env-forge';

  // Live query for history items specific to this tool
  $: historyItems = liveQuery(async () => {
      const items = await workspace.history
          .where('toolId')
          .equals(TOOL_ID)
          .reverse()
          .sortBy('timestamp');
      return items;
  });

  async function loadItem(id: number) {
      const item = await workspace.history.get(id);
      if (item) {
          dispatch('load', item.input);
      }
  }

  async function toggleStar(id: number) {
      const item = await workspace.history.get(id);
      if (item) {
          await workspace.history.update(id, { starred: !item.starred });
      }
  }

  async function deleteItem(id: number) {
      await workspace.history.delete(id);
  }

  async function clearHistory() {
      if (confirm('Are you sure you want to clear unstarred history?')) {
          const allItems = await workspace.history.where('toolId').equals(TOOL_ID).toArray();
          const toDelete = allItems.filter(i => !i.starred).map(i => i.id!);
          if (toDelete.length > 0) {
              await workspace.history.bulkDelete(toDelete);
          }
      }
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
  <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          {t.tabs.history}
      </h3>
      <button class="min-h-[44px] min-w-[44px] px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" on:click={clearHistory}>
          {t.clear}
      </button>
  </div>

  {#if $historyItems && $historyItems.length > 0}
      <div class="space-y-3">
          {#each $historyItems as item}
              <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
                  <button class="flex-grow min-h-[44px] min-w-[44px] flex items-center justify-start text-left truncate px-2" on:click={() => item.id && loadItem(item.id)}>
                      <span class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                           {new Date(item.timestamp).toLocaleString()}
                      </span>
                  </button>
                  <div class="flex items-center space-x-1 shrink-0">
                      <button class="min-h-[44px] min-w-[44px] p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition" on:click={() => item.id && toggleStar(item.id)} aria-label="Star">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 {item.starred ? 'fill-current' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      </button>
                      <button class="min-h-[44px] min-w-[44px] p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" on:click={() => item.id && deleteItem(item.id)} aria-label="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                  </div>
              </div>
          {/each}
      </div>
  {:else}
      <div class="text-center py-8 text-slate-500 dark:text-slate-400">
          No history yet.
      </div>
  {/if}
</div>