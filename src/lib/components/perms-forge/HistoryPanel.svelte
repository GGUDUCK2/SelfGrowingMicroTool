<script lang="ts">
    import { liveQuery } from 'dexie';
    import { getHistoryObservable, deleteHistoryItem, clearHistory, toggleStar } from '$lib/db/workspace';
    import { browser } from '$app/environment';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    // Observable for history items
    let history$ = browser ? liveQuery(() => getHistoryObservable('perms-forge')) : null;

    function restore(item: any) {
        if (item.input) {
            dispatch('restore', item.input);
        }
    }
</script>

<div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 h-full flex flex-col">
    <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            History
        </h3>
        <button on:click={() => clearHistory('perms-forge')} class="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            Clear
        </button>
    </div>

    <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {#if $history$ && $history$.length > 0}
            {#each $history$ as item}
                <div class="group flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow">
                    <button class="flex-1 text-left" on:click={() => restore(item)}>
                        <div class="flex items-baseline gap-2">
                            <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.input.octal}</span>
                            <span class="font-mono text-xs text-slate-500">{item.input.symbolic}</span>
                        </div>
                        <div class="text-[10px] text-slate-400 mt-1">{new Date(item.timestamp).toLocaleTimeString()}</div>
                    </button>

                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button on:click={() => toggleStar(item.id)} class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 {item.starred ? 'text-yellow-400' : 'text-slate-400'}" aria-label="Toggle Star">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={item.starred ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        </button>
                        <button on:click={() => deleteHistoryItem(item.id)} class="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500" aria-label="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
            {/each}
        {:else}
            <div class="text-center py-12 text-slate-400 text-sm">
                No recent activity.
            </div>
        {/if}
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }
    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #475569;
    }
</style>
