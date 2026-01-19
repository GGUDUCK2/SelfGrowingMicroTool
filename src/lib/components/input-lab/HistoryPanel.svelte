<script lang="ts">
  import { db, type InputLabHistory } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { Clock, Trash2, Download, Eye, Star } from 'lucide-svelte';
  import { slide } from 'svelte/transition';

  export let dict: any;
  export let onLoad: (data: any) => void;

  let history = liveQuery(() => db.inputLabHistory.orderBy('createdAt').reverse().limit(10).toArray());

  async function deleteItem(id: number) {
    if (id) await db.inputLabHistory.delete(id);
  }

  async function toggleStar(item: InputLabHistory) {
    if (item.id) {
        await db.inputLabHistory.update(item.id, { starred: item.starred ? 0 : 1 });
    }
  }

  function restore(item: InputLabHistory) {
      try {
          const data = JSON.parse(item.data);
          onLoad(data);
      } catch (e) {
          console.error("Failed to parse history item", e);
      }
  }

  function download(item: InputLabHistory) {
      const blob = new Blob([item.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `input-lab-session-${new Date(item.createdAt).toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
  }
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <h3 class="font-bold text-lg flex items-center gap-2">
            <Clock size={20} class="text-indigo-500" />
            {dict.tabs.history} (Saved)
        </h3>
    </div>

    {#if $history}
        <div class="space-y-3">
            {#if $history.length === 0}
                <div class="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p>{dict.history.noEvents}</p>
                </div>
            {/if}

            {#each $history as item (item.id)}
                <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group" transition:slide|local>
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    {item.type}
                                </span>
                                <span class="text-xs text-slate-400">
                                    {item.createdAt.toLocaleDateString()}
                                </span>
                            </div>
                            <div class="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                Session #{item.id}
                            </div>
                        </div>
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button class="p-1.5 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors" on:click={() => toggleStar(item)}>
                                 <Star size={16} fill={item.starred ? "currentColor" : "none"} />
                             </button>
                             <button class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" on:click={() => restore(item)}>
                                 <Eye size={16} />
                             </button>
                             <button class="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" on:click={() => download(item)}>
                                 <Download size={16} />
                             </button>
                             <button class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" on:click={() => deleteItem(item.id!)}>
                                 <Trash2 size={16} />
                             </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <div class="animate-pulse space-y-3">
             <div class="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
             <div class="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        </div>
    {/if}
</div>
