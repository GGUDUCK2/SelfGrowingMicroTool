<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { History, Star, Trash2 } from '@lucide/svelte';
    import { workspace, type ToolHistoryItem } from '$lib/db/workspace';

    export let dict: any;
    const TOOL_ID = 'base64-forge';

    let historyItems: ToolHistoryItem[] = [];

    onMount(() => {
        loadHistory();

        // Listen for Dexie changes on the history table
        const subscription = workspace.history
            .where('toolId')
            .equals(TOOL_ID)
            .reverse()
            .sortBy('timestamp');

        // Use liveQuery alternative or just reload on interval since we don't have liveQuery imported directly here easily
        const interval = setInterval(loadHistory, 2000);
        return () => clearInterval(interval);
    });

    async function loadHistory() {
        historyItems = await workspace.history
            .where('toolId')
            .equals(TOOL_ID)
            .reverse()
            .limit(20)
            .sortBy('timestamp');
    }

    async function toggleStar(id: number | undefined) {
        if (!id) return;
        const item = await workspace.history.get(id);
        if (item) {
            await workspace.history.update(id, { starred: !item.starred });
            loadHistory();
        }
    }

    async function deleteItem(id: number | undefined) {
        if (!id) return;
        await workspace.history.delete(id);
        loadHistory();
    }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-[600px] flex flex-col">
    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <History size={18} class="text-slate-500" />
        <h3 class="font-semibold text-slate-800 dark:text-white">{dict.history}</h3>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-3">
        {#if historyItems.length === 0}
            <div class="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <History size={32} class="opacity-20" />
                <p class="text-sm">{dict.noHistory}</p>
            </div>
        {:else}
            {#each historyItems as item (item.id)}
                <div transition:fade class="group bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded">
                            {(item.input as any)?.mode || 'convert'}
                        </span>

                        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button on:click={() => toggleStar(item.id)} class="text-slate-400 hover:text-yellow-500 transition-colors p-1 rounded-md min-h-[32px] min-w-[32px] flex items-center justify-center">
                                <Star size={14} fill={item.starred ? "currentColor" : "none"} class={item.starred ? "text-yellow-500" : ""} />
                            </button>
                            <button on:click={() => deleteItem(item.id)} class="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md min-h-[32px] min-w-[32px] flex items-center justify-center">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>

                    <p class="text-xs text-slate-600 dark:text-slate-400 font-mono break-all line-clamp-2">
                        {(item.input as any)?.input || ''}
                    </p>
                    <div class="mt-2 text-[10px] text-slate-400 flex justify-between">
                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                        <span>{(item.result as any)?.outputLength || 0} chars output</span>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>
