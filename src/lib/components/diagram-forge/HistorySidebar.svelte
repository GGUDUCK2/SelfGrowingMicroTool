<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type DiagramForgeHistory } from '$lib/db';
  import { Star, Trash2, Clock } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  export let dict: any;
  export let onLoad: (item: DiagramForgeHistory) => void;

  let history = liveQuery(() => db.diagramForgeHistory.orderBy('createdAt').reverse().toArray());

  async function toggleStar(e: Event, item: DiagramForgeHistory) {
      e.stopPropagation();
      if (item.id) {
          await db.diagramForgeHistory.update(item.id, { starred: item.starred ? 0 : 1 });
      }
  }

  async function deleteItem(e: Event, id?: number) {
      e.stopPropagation();
      if (id) {
          if (confirm('Delete this diagram?')) {
              await db.diagramForgeHistory.delete(id);
          }
      }
  }
</script>

<div class="h-full flex flex-col bg-slate-50 dark:bg-slate-900 w-full md:w-80 border-r border-slate-200 dark:border-slate-700">
    <div class="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Clock size={18} />
            {dict.history}
        </h2>
    </div>

    <div class="flex-1 overflow-y-auto p-2 space-y-2">
        {#if $history}
            {#if $history.length === 0}
                <div class="text-center py-10 text-slate-400 text-sm">
                    {dict.noHistory}
                </div>
            {/if}
            {#each $history as item (item.id)}
                <button
                    class="w-full text-left bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group relative shadow-sm"
                    on:click={() => onLoad(item)}
                    transition:fade
                >
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-medium text-slate-700 dark:text-slate-200 truncate pr-6 text-sm w-full block">
                            {item.title || 'Untitled'}
                        </span>
                        <div class="flex gap-1 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 pl-2 rounded-bl-lg">
                            <div
                                role="button"
                                tabindex="0"
                                class="p-1 hover:text-yellow-500 text-slate-400"
                                on:click={(e) => toggleStar(e, item)}
                                on:keydown={(e) => e.key === 'Enter' && toggleStar(e, item)}
                            >
                                <Star size={14} fill={item.starred ? "currentColor" : "none"} class={item.starred ? "text-yellow-500" : ""} />
                            </div>
                            <div
                                role="button"
                                tabindex="0"
                                class="p-1 hover:text-red-500 text-slate-400"
                                on:click={(e) => deleteItem(e, item.id)}
                                on:keydown={(e) => e.key === 'Enter' && deleteItem(e, item.id)}
                            >
                                <Trash2 size={14} />
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-slate-500">
                        <span class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider">
                            {item.type}
                        </span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                </button>
            {/each}
        {:else}
            <div class="p-4 text-center">
                <div class="animate-pulse h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto mb-2"></div>
                <div class="animate-pulse h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
            </div>
        {/if}
    </div>
</div>
