<script lang="ts">
    import { onMount } from 'svelte';
    import { Trash2, Star } from '@lucide/svelte';
    import { getHistoryObservable, toggleStar, deleteHistoryItem, clearHistory } from '$lib/db/workspace';
    import { liveQuery } from 'dexie';

    export let toolId = 'demographics-forge';
    export let t: Record<string, any>;
    export let onRestore: (input: any) => void;

    let historyStore: any;

    onMount(() => {
        historyStore = liveQuery(() => getHistoryObservable(toolId));
    });

    async function handleClear() {
        if (confirm(t.confirmClear || 'Are you sure?')) {
            await clearHistory(toolId);
        }
    }

    function formatTime(timestamp: number) {
        return new Intl.DateTimeFormat(undefined, {
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(timestamp));
    }
</script>

<div class="flex flex-col h-full bg-surface border border-border/50 rounded-xl overflow-hidden shadow-sm">
    <div class="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
        <h3 class="font-semibold text-sm">{t.historyTitle || 'History'}</h3>
        <button class="min-h-[44px] min-w-[44px] text-xs text-muted-foreground hover:text-danger transition-colors p-1"
            on:click={handleClear}
            title={t.clear}
            aria-label={t.clear}
        >
            <Trash2 class="w-4 h-4" />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto p-2 space-y-2 min-h-[300px]">
        {#if $historyStore && $historyStore.length > 0}
            {#each $historyStore as item (item.id)}
                <div class="group relative bg-background border border-border/50 rounded-lg p-3 hover:border-primary/50 transition-colors flex flex-col gap-2">

                    <!-- Content -->
                    <div
                        class="flex flex-col cursor-pointer flex-1"
                        role="button"
                        tabindex="0"
                        on:click={() => onRestore(item.input)}
                        on:keydown={(e) => e.key === 'Enter' && onRestore(item.input)}
                    >
                        <div class="flex items-start justify-between">
                            <span class="text-sm font-medium line-clamp-1 flex-1 pr-4">
                                {item.input.region} ({item.input.year})
                            </span>
                            <span class="text-[10px] text-muted-foreground shrink-0">{formatTime(item.timestamp)}</span>
                        </div>
                        {#if item.input.compareRegion !== 'none'}
                            <div class="text-xs text-muted-foreground truncate">
                                vs {item.input.compareRegion}
                            </div>
                        {/if}
                    </div>

                    <!-- Actions overlay -->
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1 mt-1">
                        <button class="min-h-[44px] min-w-[44px] p-1.5 text-muted-foreground hover:text-amber-500 rounded-md hover:bg-muted transition-colors {item.starred ? 'text-amber-500 opacity-100' : ''}"
                            on:click|stopPropagation={() => toggleStar(item.id!)}
                            title="Star"
                            aria-label="Star"
                        >
                            <Star class="w-4 h-4 {item.starred ? 'fill-current' : ''}" />
                        </button>
                        <button class="min-h-[44px] min-w-[44px] p-1.5 text-muted-foreground hover:text-danger rounded-md hover:bg-muted transition-colors"
                            on:click|stopPropagation={() => deleteHistoryItem(item.id!)}
                            title={t.delete}
                            aria-label={t.delete}
                        >
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            {/each}
        {:else}
            <div class="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <p class="text-sm">{t.emptyHistory || 'No history saved yet.'}</p>
            </div>
        {/if}
    </div>
</div>
