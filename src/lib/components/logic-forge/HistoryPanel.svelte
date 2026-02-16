<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { db, type LogicForgeHistory } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { getDictionary } from '$lib/dictionaries';

  export let lang: string = 'en';

  $: dict = getDictionary(lang).logicForge;
  const dispatch = createEventDispatcher();

  let history = liveQuery(() => db.logicForgeHistory.orderBy('createdAt').reverse().limit(20).toArray());

  function formatDate(d: Date) {
    return new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  }

  function restore(item: LogicForgeHistory) {
      dispatch('restore', item.expression);
  }

  function deleteItem(id: number) {
      db.logicForgeHistory.delete(id);
  }

  function clearAll() {
      db.logicForgeHistory.clear();
  }
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
    <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="font-semibold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-history"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12"/><path d="M3 3v9h9"/><path d="M12 7v5l4 2"/></svg>
            {dict.history}
        </h3>
        <button on:click={clearAll} class="text-xs text-red-500 hover:text-red-700 font-medium">
            {dict.clear}
        </button>
    </div>

    <div class="flex-1 overflow-auto max-h-[400px]">
        {#if $history && $history.length > 0}
            <div class="divide-y divide-gray-100">
                {#each $history as item}
                    <div class="p-3 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                        <button on:click={() => restore(item)} class="text-left flex-1 min-w-0">
                            <div class="font-mono text-sm text-gray-800 truncate">{item.expression}</div>
                            <div class="text-xs text-gray-400 mt-1">{formatDate(item.createdAt)}</div>
                        </button>
                        <button on:click={() => item.id && deleteItem(item.id)} class="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={dict.delete}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="p-8 text-center text-gray-400 text-sm">
                No history yet.
            </div>
        {/if}
    </div>
</div>
