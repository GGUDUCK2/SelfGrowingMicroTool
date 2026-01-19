<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type PromptForgeHistory } from '$lib/db';
  import { slide } from 'svelte/transition';

  export let dict: Record<string, any>;
  export let onLoad: (item: PromptForgeHistory) => void;

  let searchTerm = "";

  // Reactive query
  let history$ = liveQuery(async () => {
    let collection = db.promptForgeHistory.orderBy('createdAt').reverse();
    const items = await collection.toArray();

    if (searchTerm.trim()) {
        const lower = searchTerm.toLowerCase();
        return items.filter(i => i.title.toLowerCase().includes(lower) || i.template.toLowerCase().includes(lower));
    }
    return items;
  });

  async function deleteItem(id: number | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this prompt?')) {
        await db.promptForgeHistory.delete(id);
    }
  }

  function formatDate(d: Date) {
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
</script>

<div class="h-full flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700">
     <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-3">{dict.history.title}</h2>
     <div class="relative">
        <input
            type="text"
            bind:value={searchTerm}
            placeholder={dict.history.search}
            class="w-full h-9 pl-9 pr-3 bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
     </div>
  </div>

  <div class="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
    {#if $history$}
        {#if $history$.length === 0}
            <div class="text-center py-10 text-slate-400 text-sm">
                {dict.history.empty}
            </div>
        {/if}

        {#each $history$ as item (item.id)}
            <div class="group relative bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-lg p-3 transition-all cursor-pointer shadow-sm hover:shadow-md"
                 on:click={() => onLoad(item)}
                 on:keydown={(e) => e.key === 'Enter' && onLoad(item)}
                 role="button"
                 tabindex="0"
                 transition:slide|local
            >
                <div class="flex justify-between items-start mb-1">
                    <h3 class="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1 pr-6">{item.title}</h3>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-mono mb-2 opacity-80">
                    {item.template.slice(0, 100)}
                </p>
                <div class="flex justify-between items-center text-[10px] text-slate-400">
                    <span>{formatDate(item.createdAt)}</span>
                    <span class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                        {Object.keys(item.variables || {}).length} vars
                    </span>
                </div>

                <button
                    class="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    on:click|stopPropagation={() => deleteItem(item.id)}
                    title={dict.history.delete}
                    aria-label={dict.history.delete}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        {/each}
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
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
  }
</style>
