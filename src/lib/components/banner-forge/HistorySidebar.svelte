<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { db, type BannerForgeHistory } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { slide } from 'svelte/transition';

  export let dict: any;

  const dispatch = createEventDispatcher();

  let history = liveQuery(() => db.bannerForgeHistory.orderBy('createdAt').reverse().limit(20).toArray());

  function restore(item: BannerForgeHistory) {
      dispatch('restore', JSON.parse(item.config));
  }

  function deleteItem(id: number) {
      db.bannerForgeHistory.delete(id);
  }
</script>

<div class="h-full flex flex-col bg-white dark:bg-slate-900 shadow-xl w-full sm:w-80 border-l border-slate-200 dark:border-slate-800">
    <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h2 class="font-bold text-slate-800 dark:text-white">{dict.history.title}</h2>
        <button on:click={() => dispatch('close')} class="text-slate-500 hover:text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4">
        {#if $history}
            {#if $history.length === 0}
                <p class="text-center text-slate-500 text-sm mt-10">{dict.history.empty}</p>
            {/if}
            {#each $history as item (item.id)}
                <div class="group relative border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden hover:border-indigo-500 transition-colors" transition:slide>
                    <!-- Preview -->
                    <button class="w-full aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative" on:click={() => restore(item)}>
                        {#if item.preview}
                            <img src={item.preview} alt={item.name} class="w-full h-full object-cover" />
                        {:else}
                            <span class="text-xs text-slate-400">No Preview</span>
                        {/if}
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </button>

                    <div class="p-2 bg-white dark:bg-slate-800 flex justify-between items-center">
                        <div class="text-xs font-medium truncate flex-1 text-slate-700 dark:text-slate-300">{item.name || 'Untitled'}</div>
                        <div class="flex gap-2 items-center">
                             <span class="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                             <button on:click|stopPropagation={() => item.id && deleteItem(item.id)} class="text-slate-400 hover:text-red-500 transition-colors p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                             </button>
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>
