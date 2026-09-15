<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { History, Trash2, Clock, Play } from '@lucide/svelte';
    import { loadHistory, clearHistory } from '$lib/db/workspace';
    import type { ToolWorkspace } from '$lib/db/workspace';
    import type { CssState, Dictionary } from './types';
    import { formatDistanceToNow } from 'date-fns';
    import { enUS, ko } from 'date-fns/locale';
    import { page } from '$app/stores';

    $: lang = $page.params.lang as 'en' | 'ko';
    $: locale = lang === 'ko' ? ko : enUS;

    const dispatch = createEventDispatcher<{ load: CssState }>();
    const TOOL_ID = 'css-forge';

    let history: ToolWorkspace[] = [];
    let isMounted = false;

    async function fetchHistory() {
        history = await loadHistory(TOOL_ID);
    }

    onMount(() => {
        isMounted = true;
        fetchHistory();

        // Listen for new history items (e.g. from workspace component)
        const interval = setInterval(fetchHistory, 2000);
        return () => clearInterval(interval);
    });

    async function handleClearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            await clearHistory(TOOL_ID);
            await fetchHistory();
        }
    }

    function handleLoadItem(item: ToolWorkspace) {
        if (item.state) {
            dispatch('load', item.state as CssState);
        }
    }

</script>

<div class="flex flex-col h-full max-h-[800px]">
    <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
            <History size={20} class="text-blue-500" />
            History
        </h3>
        {#if history.length > 0}
            <button
                class="text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium flex items-center gap-1 transition-colors min-h-[44px]"
                on:click={handleClearHistory}
            >
                <Trash2 size={16} />
                Clear
            </button>
        {/if}
    </div>

    <div class="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {#if history.length === 0}
            <div class="text-center text-slate-500 dark:text-slate-400 py-8 flex flex-col items-center gap-3">
                <div class="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <History size={24} />
                </div>
                <p class="text-sm">No history yet</p>
                <p class="text-xs">Your work will automatically appear here.</p>
            </div>
        {:else}
            {#each history as item (item.id)}
                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Clock size={12} />
                            {formatDistanceToNow(item.updatedAt, { addSuffix: true, locale })}
                        </div>
                        <div class="flex items-center gap-1">
                            <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">
                                {(item.state as CssState)?.action || 'unknown'}
                            </span>
                        </div>
                    </div>

                    <div class="text-sm text-slate-700 dark:text-slate-300 font-mono truncate mb-3 bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                        {item.preview || 'No preview available'}
                    </div>

                    <button
                        class="w-full flex items-center justify-center gap-2 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors min-h-[44px]"
                        on:click={() => handleLoadItem(item)}
                    >
                        <Play size={14} />
                        Restore
                    </button>
                </div>
            {/each}
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
        background-color: rgba(156, 163, 175, 0.5);
        border-radius: 20px;
    }
</style>
