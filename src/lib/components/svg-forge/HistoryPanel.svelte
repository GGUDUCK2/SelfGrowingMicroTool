<script lang="ts">
  import { onMount } from 'svelte';
  import { workspace, type ToolHistoryItem } from '$lib/db/workspace';
  import Button from '$lib/components/Button.svelte';

  export let t: any;
  export let onRestore: (input: string, result: string, config: any) => void;
  export let onToast: (msg: string) => void;

  let historyItems: ToolHistoryItem[] = [];

  async function loadHistory() {
    historyItems = await workspace.history
      .where('toolId')
      .equals('svgForge')
      .reverse()
      .sortBy('timestamp');
  }

  onMount(() => {
    loadHistory();

    // Auto-refresh when db changes if using observable, simple approach here is polling or manual refresh
    // We'll rely on the parent to trigger reloads or manual refresh
  });

  export async function refresh() {
    await loadHistory();
  }

  async function deleteItem(id: number) {
    await workspace.history.delete(id);
    await loadHistory();
    onToast(t.history.deleted);
  }

  async function clearHistory() {
    const items = await workspace.history.where('toolId').equals('svgForge').toArray();
    const toDelete = items.filter(item => !item.starred).map(item => item.id!);
    if (toDelete.length > 0) {
      await workspace.history.bulkDelete(toDelete);
      await loadHistory();
      onToast(t.history.cleared);
    }
  }

  async function toggleStar(id: number, current: boolean) {
    await workspace.history.update(id, { starred: !current });
    await loadHistory();
  }

  function handleRestore(item: ToolHistoryItem) {
    const inputStr = item.input as string;
    const resultStr = item.result as string;
    // Assuming config might be stored in action or details, but for now we just restore the raw SVG
    // We can enhance to store config in 'details' JSON
    let config = null;
    try {
      if (item.details) {
         config = JSON.parse(item.details);
      }
    } catch(e){}
    onRestore(inputStr, resultStr, config);
    onToast(t.history.restored);
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleString();
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
    <h2 class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
      {t.history.title}
    </h2>
    {#if historyItems.length > 0}
      <Button variant="danger" size="sm" onclick={clearHistory} class="min-h-[44px]">
        {t.history.clearAll}
      </Button>
    {/if}
  </div>

  <div class="p-4 flex-grow overflow-y-auto">
    {#if historyItems.length === 0}
      <div class="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
        {t.history.empty}
      </div>
    {:else}
      <div class="space-y-3">
        {#each historyItems as item}
          <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 group flex items-start justify-between gap-3">
            <div class="flex-grow overflow-hidden">
              <div class="text-xs text-slate-500 dark:text-slate-400 mb-1">{formatDate(item.timestamp)}</div>
              <!-- Snippet preview -->
              <div class="text-sm font-mono text-slate-700 dark:text-slate-300 truncate">
                {(item.input as string)?.substring(0, 50)}...
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
               <button
                onclick={() => toggleStar(item.id!, item.starred)}
                class="p-2 text-slate-400 hover:text-yellow-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                title={t.history.star}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={item.starred ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={item.starred ? "text-yellow-500" : ""}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
              <button
                onclick={() => handleRestore(item)}
                class="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                title={t.history.restore}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
              <button
                onclick={() => deleteItem(item.id!)}
                class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                title={t.history.delete}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>