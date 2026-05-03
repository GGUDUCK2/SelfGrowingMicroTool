<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { liveQuery } from 'dexie';
  import { cspForgeWorkspace } from '$lib/db/csp-forge';
  import { db } from '$lib/db';
  import { fade } from 'svelte/transition';

  export let dictionary: any;

  const dispatch = createEventDispatcher();

  let history$ = liveQuery(() => db.cspForgeHistory.orderBy('createdAt').reverse().toArray());

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
  }

  async function toggleStar(id: number) {
     await cspForgeWorkspace.toggleStar(id);
  }

  async function deleteItem(id: number) {
     await cspForgeWorkspace.delete(id);
  }

  async function clearHistory() {
     if (confirm('Clear all unstarred history?')) {
        await cspForgeWorkspace.clear();
     }
  }

  function restoreItem(item: any) {
     dispatch('restore', item);
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full flex flex-col">
  <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
    <h3 class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      {dictionary?.cspForge?.history || 'History'}
    </h3>
    {#if $history$ && $history$.length > 0}
       <button
         on:click={clearHistory}
         class="text-xs text-slate-500 hover:text-red-500 font-medium px-2 py-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
         title={dictionary?.cspForge?.clearHistory || 'Clear History'}
       >
         {dictionary?.cspForge?.clearHistory || 'Clear History'}
       </button>
    {/if}
  </div>

  <div class="flex-1 overflow-y-auto p-2 space-y-2">
    {#if $history$ && $history$.length > 0}
       {#each $history$ as item (item.id)}
         <div in:fade class="group relative bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer shadow-sm hover:shadow-md">
            <div
              class="absolute inset-0"
              role="button"
              tabindex="0"
              on:click={() => restoreItem(item)}
              on:keydown={(e) => e.key === 'Enter' && restoreItem(item)}
            ></div>

            <div class="relative z-10 flex justify-between items-start mb-2">
               <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {formatDate(item.createdAt)}
               </div>
               <div class="flex items-center gap-1">
                  <button
                    type="button"
                    on:click|stopPropagation={() => toggleStar(item.id)}
                    class="text-slate-400 hover:text-yellow-500 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Toggle Star"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={item.starred ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={item.starred ? "text-yellow-500" : ""}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </button>
                  <button
                    type="button"
                    on:click|stopPropagation={() => deleteItem(item.id)}
                    class="text-slate-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title={dictionary?.cspForge?.delete || 'Delete'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
               </div>
            </div>

            <div class="relative z-10 text-sm font-mono text-slate-700 dark:text-slate-300 line-clamp-2 break-all pointer-events-none">
               {item.policy}
            </div>
         </div>
       {/each}
    {:else}
       <div class="text-center p-8 text-slate-500 dark:text-slate-400 text-sm">
          {dictionary?.cspForge?.noHistory || 'No history'}
       </div>
    {/if}
  </div>
</div>
