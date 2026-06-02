<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { db, type SnippetForgeHistory } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { X, Trash2, Clock } from '@lucide/svelte';
  import { slide } from 'svelte/transition';

  export let dict: any;
  const dispatch = createEventDispatcher();

  let history = liveQuery(() => db.snippetForgeHistory.orderBy('createdAt').reverse().toArray());

  function formatDate(date: Date) {
      return new Date(date).toLocaleString();
  }

  function handleSelect(item: SnippetForgeHistory) {
      dispatch('select', item);
  }

  function handleDelete(id: number, e: Event) {
      e.stopPropagation();
      if(confirm('Delete this snippet?')) {
          db.snippetForgeHistory.delete(id);
      }
  }

  function handleClose() {
      dispatch('close');
  }
</script>

<div class="fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800" transition:slide={{ axis: 'x', duration: 300 }}>
    <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
        <h3 class="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <Clock size={18} />
            {dict.history}
        </h3>
        <button on:click={handleClose} class="text-slate-500 hover:text-slate-800 dark:hover:text-white">
            <X size={20} />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-3">
        {#if $history}
            {#each $history as item}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-interactive-supports-focus -->
                <div
                    class="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500 hover:shadow-md transition-all group relative cursor-pointer"
                    role="button"
                    on:click={() => handleSelect(item)}
                >
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{item.title || 'Untitled'}</span>
                        <span class="text-[10px] text-slate-400 font-mono uppercase bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{item.language}</span>
                    </div>
                    <div class="text-xs text-slate-500 mb-2 font-mono line-clamp-2 opacity-70">
                        {item.code.slice(0, 100)}
                    </div>
                    <div class="flex justify-between items-center text-[10px] text-slate-400">
                         <span>{formatDate(item.createdAt)}</span>
                    </div>

                    <button
                        class="absolute bottom-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        on:click={(e) => handleDelete(item.id!, e)}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            {/each}
            {#if $history.length === 0}
                <div class="text-center py-10 text-slate-400">
                    <Clock size={32} class="mx-auto mb-2 opacity-20" />
                    <p>{dict.noHistory}</p>
                </div>
            {/if}
        {/if}
    </div>
</div>
