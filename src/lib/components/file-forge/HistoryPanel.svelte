<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db } from '$lib/db';
  import { slide } from 'svelte/transition';
  import { Trash2, Clock, File } from 'lucide-svelte';

  export let dict: any;

  let history = liveQuery(() => db.fileForgeHistory.orderBy('createdAt').reverse().limit(20).toArray());

  async function clearHistory() {
    await db.fileForgeHistory.clear();
  }

  async function deleteItem(id: number) {
    await db.fileForgeHistory.delete(id);
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
      <Clock size={16} />
      {dict.history.title}
    </h3>
    {#if $history && $history.length > 0}
      <button on:click={clearHistory} class="text-xs text-red-500 hover:text-red-600 hover:underline">
        {dict.history.clear}
      </button>
    {/if}
  </div>

  {#if $history}
    {#if $history.length === 0}
      <div class="text-center py-8 text-slate-400 text-sm">
        {dict.history.empty}
      </div>
    {:else}
      <div class="space-y-2">
        {#each $history as item (item.id)}
          <div transition:slide class="group bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="p-2 bg-slate-100 dark:bg-slate-700 rounded text-slate-500">
                <File size={16} />
              </div>
              <div class="min-w-0">
                <div class="text-sm font-medium truncate text-slate-800 dark:text-slate-200">{item.name}</div>
                <div class="text-xs text-slate-400 flex gap-2">
                  <span>{(item.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button
                on:click={() => item.id && deleteItem(item.id)}
                class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
