<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { loadHistory, deleteHistoryItem, toggleStar, clearHistory } from '$lib/db/workspace';
  import { fade, slide } from 'svelte/transition';

  export let dict: any;
  const dispatch = createEventDispatcher();

  let historyItems: any[] = [];
  let isDeleting = false;
  let editingId: number | null = null;
  let editName: string = "";
  import { workspaceDB } from '$lib/db/workspace';

  async function handleRename(id: number, currentName: string | undefined) {
      editingId = id;
      editName = currentName || "";
  }

  async function saveRename(id: number) {
      if (editName.trim()) {
          await workspaceDB.history.update(id, { name: editName.trim() });
      }
      editingId = null;
      await fetchHistory();
  }

  function handleKeydown(e: KeyboardEvent, id: number) {
      if (e.key === 'Enter') saveRename(id);
      if (e.key === 'Escape') editingId = null;
  }

  onMount(async () => {
      await fetchHistory();
  });

  async function fetchHistory() {
      historyItems = await loadHistory('url-forge');
  }

  async function handleToggleStar(id: number) {
      await toggleStar(id);
      await fetchHistory();
  }

  async function handleDelete(id: number) {
      isDeleting = true;
      await deleteHistoryItem(id);
      await fetchHistory();
      isDeleting = false;
  }

  async function handleClearAll() {
      isDeleting = true;
      await clearHistory('url-forge');
      await fetchHistory();
      isDeleting = false;
  }

  function formatDate(timestamp: number) {
      return new Date(timestamp).toLocaleString(undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
  }
</script>

<div class="w-80 bg-white dark:bg-slate-900 h-full flex flex-col border-l border-slate-200 dark:border-slate-800">
    <!-- Header -->
    <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
        <h2 class="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {dict.history}
        </h2>
        <div class="flex gap-2">
            {#if historyItems.length > 0}
            <button
                on:click={handleClearAll}
                disabled={isDeleting}
                class="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                aria-label="Clear all non-starred history"
            >
                Clear
            </button>
            {/if}
            <button on:click={() => dispatch('close')} class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close History">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {#if historyItems.length === 0}
            <div class="text-center text-slate-500 dark:text-slate-400 py-12 text-sm">
                No history yet. Start forging URLs!
            </div>
        {/if}

        {#each historyItems as item (item.id)}
            <div transition:slide|local class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">

                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs text-slate-400 font-medium">{formatDate(item.timestamp)}</span>
                    <div class="flex gap-1">
                        <button on:click={() => handleRename(item.id, item.name)} class="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-500" aria-label="Rename">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button on:click={() => handleToggleStar(item.id)} class="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Star Item">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 {item.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </button>
                        <button on:click={() => handleDelete(item.id)} class="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" aria-label="Delete Item">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>

                {#if editingId === item.id}
                    <div class="mb-3 flex gap-2">
                        <input type="text" bind:value={editName} on:keydown={(e) => handleKeydown(e, item.id)} class="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded outline-none min-h-[44px]" placeholder="Project Name..." />
                        <button on:click={() => saveRename(item.id)} class="text-xs bg-indigo-500 text-white px-2 rounded min-h-[44px] min-w-[44px]">Save</button>
                    </div>
                {:else if item.name}
                    <div class="font-bold text-sm text-slate-800 dark:text-white mb-1">{item.name}</div>
                {/if}

                <div class="font-mono text-xs text-slate-700 dark:text-slate-300 line-clamp-2 mb-3 break-all bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">

                    {item.input.rawUrl}
                </div>

                <button
                    on:click={() => dispatch('restore', { data: item })}
                    class="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-lg transition-colors touch-manipulation min-h-[44px]"
                >
                    Restore
                </button>
            </div>
        {/each}
    </div>
</div>

<style lang="postcss">
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-200 dark:bg-slate-700 rounded-full;
  }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    @apply bg-slate-300 dark:bg-slate-600;
  }
</style>
