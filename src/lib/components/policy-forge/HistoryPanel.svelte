<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db } from '$lib/db';
  import { policyStore } from '$lib/stores/policy-forge';
  import { browser } from '$app/environment';
  import { Trash2, X, Check } from 'lucide-svelte';

  export let dict: any;

  // Use a store for liveQuery to handle SSR gracefully
  let history = liveQuery(() => browser ? db.policyForgeHistory.orderBy('createdAt').reverse().toArray() : []);

  function load(item: any) {
      policyStore.load(item.data);
  }

  let deletingId: number | null = null;

  function requestDelete(event: Event, id: number) {
      // Event is handled by the wrapper div's stopPropagation, but good to be explicit if passed directly
      deletingId = id;
  }

  async function confirmDelete(event: Event, id: number) {
      await db.policyForgeHistory.delete(id);
      deletingId = null;
  }

  function cancelDelete(event: Event) {
      deletingId = null;
  }
</script>

<div class="w-full md:w-80 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
    <div class="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 class="font-semibold text-slate-800 dark:text-white">{dict.history.title}</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-2 space-y-2">
        {#if $history}
            {#if $history.length === 0}
                <div class="p-4 text-center text-slate-500 text-sm">
                    {dict.history.empty}
                </div>
            {:else}
                {#each $history as item (item.id)}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-interactive-supports-focus -->
                    <div
                        role="button"
                        class="w-full text-left group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
                        on:click={() => load(item)}
                    >
                        <div class="min-w-0 flex-1">
                            <div class="font-medium text-slate-900 dark:text-white truncate text-sm">{item.companyName || 'Untitled'}</div>
                            <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div on:click|stopPropagation class="flex items-center">
                            {#if deletingId === item.id}
                                <div class="flex items-center gap-1">
                                    <button class="p-1 text-green-600 hover:bg-green-100 rounded transition-colors" on:click={(e) => confirmDelete(e, item.id!)} title="Confirm">
                                        <Check size={16} />
                                    </button>
                                    <button class="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" on:click={cancelDelete} title="Cancel">
                                        <X size={16} />
                                    </button>
                                </div>
                            {:else}
                                <button class="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" on:click={(e) => requestDelete(e, item.id!)}>
                                    <Trash2 size={16} />
                                </button>
                            {/if}
                        </div>
                    </div>
                {/each}
            {/if}
        {/if}
    </div>
</div>
