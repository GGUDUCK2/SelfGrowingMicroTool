<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { shadowStore, type ShadowConfig } from '$lib/utils/shadow-forge/store';
  import { getHistoryObservable } from '$lib/db/workspace';
  import { workspace } from '$lib/db/workspace';
  import { Trash2, Clock, X } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';

  export let dict: any;

  const dispatch = createEventDispatcher();
  let historyItems: any[] = [];
  let loading = true;

  onMount(() => {
    const observable = getHistoryObservable('shadow-forge');
    const subscription = observable.subscribe(items => {
        historyItems = items.sort((a, b) => b.timestamp - a.timestamp);
        loading = false;
    });

    return () => subscription.unsubscribe();
  });

  function loadItem(item: any) {
      if (item.input) {
          $shadowStore = JSON.parse(JSON.stringify(item.input));
          dispatch('close');
      }
  }

  async function deleteItem(id: number, e: Event) {
      e.stopPropagation();
      await workspace.history.delete(id);
  }

  async function clearAll() {
      if (confirm(dict.history.clear + '?')) {
          const itemsToDelete = historyItems.filter(i => !i.starred).map(i => i.id);
          await workspace.history.bulkDelete(itemsToDelete as number[]);
      }
  }

  function formatTime(ts: number) {
      return new Date(ts).toLocaleString();
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end" on:click={() => dispatch('close')} transition:fade={{ duration: 200 }}>
    <div
        class="w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
        on:click|stopPropagation
        transition:fly={{ x: 300, duration: 300 }}
    >
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <h3 class="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Clock size={18} class="text-indigo-600" />
                {dict.history.title}
            </h3>
            <button class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors min-h-[44px]" on:click={() => dispatch('close')}>
                <X size={20} />
            </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {#if loading}
                <div class="animate-pulse space-y-3">
                    <div class="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                    <div class="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                </div>
            {:else if historyItems.length === 0}
                <div class="text-center py-10 text-slate-500">
                    <p>{dict.history.noHistory}</p>
                </div>
            {:else}
                {#each historyItems as item}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                        class="w-full text-left p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl transition-all group relative overflow-hidden shadow-sm cursor-pointer"
                        on:click={() => loadItem(item)}
                    >
                        <div class="flex items-start justify-between">
                            <div>
                                <span class="inline-block px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded mb-2 capitalize">
                                    {(item.input as ShadowConfig).mode}
                                </span>
                                <p class="text-xs text-slate-500">{formatTime(item.timestamp)}</p>
                            </div>
                            <button
                                class="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 rounded-lg absolute top-2 right-2 min-h-[44px] min-w-[44px] flex justify-center items-center"
                                on:click={(e) => deleteItem(item.id, e)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>

        {#if historyItems.length > 0}
            <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <button
                    class="w-full py-2 px-4 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors min-h-[44px]"
                    on:click={clearAll}
                >
                    {dict.history.clear}
                </button>
            </div>
        {/if}
    </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-200 dark:bg-slate-700 rounded-full;
  }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    @apply bg-slate-300 dark:bg-slate-600;
  }
</style>
