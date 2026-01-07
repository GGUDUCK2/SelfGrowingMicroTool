<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type IdForgeHistory } from '$lib/db';
  import { slide } from 'svelte/transition';

  let history = liveQuery(() => db.idForgeHistory.orderBy('createdAt').reverse().limit(20).toArray());

  async function restore(item: IdForgeHistory) {
      // Just copy sample to clipboard or something?
      // Or maybe we can't fully restore generation options without storing them.
      // For now, let's just let them copy the sample.
      await navigator.clipboard.writeText(item.sample);
  }

  async function deleteItem(id: number) {
      await db.idForgeHistory.delete(id);
  }
</script>

<div class="space-y-4">
  <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">Recent Activity</h2>
  {#if $history}
    <div class="space-y-3">
        {#each $history as item (item.id)}
            <div transition:slide class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div class="flex flex-col">
                    <div class="flex items-center space-x-2">
                        <span class="font-bold text-slate-800 dark:text-slate-200">{item.type}</span>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">x{item.count}</span>
                    </div>
                    <code class="text-xs text-slate-500 mt-1 truncate max-w-[200px] md:max-w-md">{item.sample}...</code>
                    <span class="text-[10px] text-slate-400 mt-1">{item.createdAt.toLocaleString()}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <button
                        on:click={() => item.id && deleteItem(item.id)}
                        class="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        aria-label="Delete"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        {/each}
        {#if $history.length === 0}
            <div class="text-center p-8 text-slate-500 dark:text-slate-400">
                No recent history.
            </div>
        {/if}
    </div>
  {/if}
</div>
