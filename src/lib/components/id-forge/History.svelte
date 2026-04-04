<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type IdForgeHistory } from '$lib/db';
  import { slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  const dispatch = createEventDispatcher<{
    restore: IdForgeHistory;
  }>();

  $: dict = getDictionary($page.params.lang ?? 'en').tools.idForge;

  // Query: 100 recent non-starred + all starred
  // But Dexie liveQuery with complex OR logic is hard.
  // We'll simplify: Get top 200, then filter/sort in JS if needed, or just 100.
  // Actually, prompt says: "retains the 100 most recent non-starred entries".
  // For display, we usually just show the recent ones.
  // Let's show recent 20 + all starred.

  let history = liveQuery(async () => {
    // We want recent items.
    // Let's just fetch recent 50 for the UI to be responsive.
    return await db.idForgeHistory
        .orderBy('createdAt')
        .reverse()
        .limit(50)
        .toArray();
  });

  async function deleteItem(id: number) {
      await db.idForgeHistory.delete(id);
  }

  async function toggleStar(item: IdForgeHistory) {
      if (item.id) {
          await db.idForgeHistory.update(item.id, { starred: item.starred ? 0 : 1 });
      }
  }

  function handleRestore(item: IdForgeHistory) {
      dispatch('restore', item);
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">{dict.history}</h2>
  </div>

  {#if $history}
    <div class="space-y-3">
        {#each $history as item (item.id)}
            <div transition:slide class="group relative flex flex-col md:flex-row md:items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                <!-- Main Content -->
                <button style="min-height: 44px; min-width: 44px;"
                    on:click={() => handleRestore(item)}
                    class="flex-1 flex flex-col items-start text-left w-full outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 -m-1"
                >
                    <div class="flex items-center space-x-2 mb-1">
                        {#if item.starred}
                            <span class="text-yellow-400">
                                <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </span>
                        {/if}
                        <span class="font-bold text-slate-800 dark:text-slate-200">{item.type}</span>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">x{item.count}</span>
                    </div>
                    <code class="text-xs text-slate-500 font-mono truncate max-w-full md:max-w-md block">{item.sample}...</code>
                    <span class="text-[10px] text-slate-400 mt-1">{item.createdAt.toLocaleString()}</span>
                </button>

                <!-- Actions -->
                <div class="flex items-center space-x-1 mt-3 md:mt-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-700">
                     <button style="min-height: 44px; min-width: 44px;"
                        on:click|stopPropagation={() => toggleStar(item)}
                        class="p-2 text-slate-400 hover:text-yellow-500 transition-colors"
                        aria-label={item.starred ? "Unstar" : "Star"}
                    >
                        {#if item.starred}
                            <svg class="w-5 h-5 fill-current text-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        {:else}
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        {/if}
                    </button>
                    <button style="min-height: 44px; min-width: 44px;"
                        on:click|stopPropagation={() => item.id && deleteItem(item.id)}
                        class="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        aria-label={dict.buttons.delete}
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        {/each}
        {#if $history.length === 0}
            <div class="text-center p-8 text-slate-500 dark:text-slate-400">
                {dict.emptyHistory}
            </div>
        {/if}
    </div>
  {/if}
</div>
