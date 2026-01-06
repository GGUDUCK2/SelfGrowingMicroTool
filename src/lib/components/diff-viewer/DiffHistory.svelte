<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type DiffHistory } from '$lib/db';
  import { slide } from 'svelte/transition';
  import { Trash2, RotateCcw, Star, Calendar } from 'lucide-svelte';

  export let onSelect: (item: DiffHistory) => void;
  export let translations: any;

  // Use liveQuery to make the list reactive
  let history = liveQuery(async () => {
    return await db.diffHistory
      .orderBy('createdAt')
      .reverse()
      .limit(50)
      .toArray();
  });

  async function toggleStar(item: DiffHistory, e: Event) {
    e.stopPropagation();
    if (item.id) {
        await db.diffHistory.update(item.id, { starred: item.starred ? 0 : 1 });
    }
  }

  async function deleteItem(id: number, e: Event) {
      e.stopPropagation();
      await db.diffHistory.delete(id);
  }

  function formatDate(date: Date) {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }

  function getModeLabel(mode: string) {
      return mode.charAt(0).toUpperCase() + mode.slice(1);
  }
</script>

<div class="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 w-80">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar class="w-4 h-4" />
            {translations.history || 'History'}
        </h3>
    </div>

    <div class="flex-1 overflow-y-auto p-2 space-y-2">
        {#if $history}
            {#each $history as item (item.id)}
                <div
                    class="group relative bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer"
                    on:click={() => onSelect(item)}
                    on:keydown={(e) => e.key === 'Enter' && onSelect(item)}
                    role="button"
                    tabindex="0"
                    transition:slide={{ duration: 200 }}
                >
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                            {getModeLabel(item.mode)}
                        </span>
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-yellow-500"
                                on:click={(e) => toggleStar(item, e)}
                                title="Star"
                            >
                                <Star class="w-3.5 h-3.5 {item.starred ? 'fill-yellow-500 text-yellow-500' : ''}" />
                            </button>
                            <button
                                class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-red-500"
                                on:click={(e) => deleteItem(item.id!, e)}
                                title="Delete"
                            >
                                <Trash2 class="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 line-clamp-2 font-mono">
                        {item.original.slice(0, 50)}...
                    </div>

                    <div class="text-[10px] text-gray-400 flex justify-end">
                        {formatDate(item.createdAt)}
                    </div>
                </div>
            {/each}

            {#if $history.length === 0}
                <div class="text-center py-8 text-gray-500 text-sm">
                    {translations.noHistory || 'No history yet'}
                </div>
            {/if}
        {/if}
    </div>
</div>
