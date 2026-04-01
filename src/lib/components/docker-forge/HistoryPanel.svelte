<script lang="ts">
  import { workspace, toggleStar as toggleStarAction, deleteHistoryItem, clearHistory as clearHistoryAction, type ToolHistoryItem } from '$lib/db/workspace';
  import { dictionaries } from '$lib/dictionaries';
  import { Trash2, RotateCcw, Clock, Star } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import { browser } from '$app/environment';

  export let lang: string;
  export let onRestore: (item: ToolHistoryItem) => void;

  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = dict.tools.dockerForge;
  $: hp = d.historyPanel || { title: "Workspace History", empty_state: "No history yet.", clear: "Clear All", restore: "Restore" };
  $: b = d.buttons || { delete: "Delete", star: "Star" };

  let historyItems: Promise<ToolHistoryItem[]> = browser ? getHistory() : Promise.resolve([]);

  async function getHistory() {
    return workspace.history.where('toolId').equals('docker-forge').reverse().limit(50).sortBy('timestamp');
  }

  export function refreshHistory() {
      if (browser) historyItems = getHistory();
  }

  async function deleteItem(id: number | undefined) {
    if (id) {
      await deleteHistoryItem(id);
      historyItems = getHistory();
    }
  }

  async function toggleStar(item: ToolHistoryItem) {
    if (item.id) {
      await toggleStarAction(item.id);
      historyItems = getHistory();
    }
  }

  async function clearHistory() {
    if (confirm(hp.clear + '?')) {
      await clearHistoryAction('docker-forge');
      historyItems = getHistory();
    }
  }

  function getBaseImage(item: ToolHistoryItem) {
      try {
          const input = item.input as any;
          return input?.baseImage || 'Unknown Image';
      } catch {
          return 'Unknown Image';
      }
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
    <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium min-h-[44px]">
      <Clock size={18} />
      {hp.title}
    </div>
    <button
      class="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
      on:click={clearHistory}
      aria-label={hp.clear}
      title={hp.clear}
    >
      {hp.clear}
    </button>
  </div>

  <div class="flex-1 overflow-y-auto p-2 space-y-2 max-h-[600px]">
    {#await historyItems}
      <div class="p-4 text-center text-slate-500 dark:text-slate-400">Loading...</div>
    {:then items}
      {#if items.length === 0}
        <div class="p-8 text-center text-slate-500 dark:text-slate-400">
          {hp.empty_state}
        </div>
      {:else}
        {#each items as item (item.id)}
          <div transition:fade class="group relative bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <div class="flex justify-between items-start gap-2 mb-2">
              <div class="font-mono text-sm text-slate-900 dark:text-white truncate" title={getBaseImage(item)}>
                {getBaseImage(item)}
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button
                  class="text-slate-400 hover:text-yellow-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-1"
                  on:click={() => toggleStar(item)}
                  aria-label={b.star}
                  title={b.star}
                >
                  <Star size={16} class={item.starred ? 'fill-yellow-500 text-yellow-500' : ''} />
                </button>
                <button
                  class="text-slate-400 hover:text-blue-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-1"
                  on:click={() => onRestore(item)}
                  title={hp.restore}
                  aria-label={hp.restore}
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  class="text-slate-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-1"
                  on:click={() => deleteItem(item.id)}
                  title={b.delete}
                  aria-label={b.delete}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 truncate">
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
        {/each}
      {/if}
    {/await}
  </div>
</div>
