<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { db, type VCardForgeHistory } from '$lib/db';
    import { liveQuery } from 'dexie';

    export let dict: any;

    const dispatch = createEventDispatcher();

    let historyItems: VCardForgeHistory[] = [];

    // Reactive live query for history
    const historyObservable = liveQuery(
      async () => await db.vcardForgeHistory.reverse().sortBy('createdAt')
    );

    $: if ($historyObservable) {
      historyItems = $historyObservable;
    }

    async function toggleStar(item: VCardForgeHistory) {
      if (item.id === undefined) return;
      await db.vcardForgeHistory.update(item.id, { starred: item.starred ? 0 : 1 });
    }

    async function deleteItem(id: number | undefined) {
      if (id === undefined) return;
      await db.vcardForgeHistory.delete(id);
    }

    function loadItem(item: VCardForgeHistory) {
      dispatch('load', item);
    }
  </script>

  <div class="h-full w-full sm:w-96 bg-white dark:bg-slate-800 flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-700">
    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {dict?.history || 'History'}
      </h2>
      <button
        on:click={() => dispatch('close')}
        class="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Close Sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      {#if historyItems.length === 0}
        <div class="text-center text-slate-500 dark:text-slate-400 py-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p>{dict?.noHistory || 'No saved vCards yet.'}</p>
        </div>
      {:else}
        {#each historyItems as item (item.id)}
          <div role="button" tabindex="0" class="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors shadow-sm cursor-pointer" on:click={() => loadItem(item)} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') loadItem(item); }}>
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-3 truncate">
                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {#if item.photoData}
                        <img src={item.photoData} alt="avatar" class="w-full h-full object-cover" />
                    {:else}
                        <svg class="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    {/if}
                </div>
                <div class="truncate">
                    <h3 class="font-medium text-slate-800 dark:text-white truncate" title={item.name}>{item.name}</h3>
                    <p class="text-xs text-slate-500 truncate" title={item.company}>{item.company}</p>
                </div>
              </div>
              <div class="flex flex-col gap-1 items-end">
                <button
                  on:click|stopPropagation={() => toggleStar(item)}
                  class="text-slate-400 hover:text-amber-500 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                  aria-label="Toggle Star"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 {item.starred ? 'text-amber-500 fill-current' : 'fill-none'}" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <button
                    on:click|stopPropagation={() => deleteItem(item.id)}
                    class="text-slate-400 hover:text-rose-500 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center opacity-0 group-hover:opacity-100"
                    aria-label="Delete History"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
              </div>
            </div>
            <div class="text-[10px] text-slate-400 flex justify-between">
                <span>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>