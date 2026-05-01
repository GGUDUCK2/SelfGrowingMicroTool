<script lang="ts">
  import { onMount } from 'svelte';
  import { getHistory, toggleStar, deleteFromHistory, clearHistory, type YamlForgeHistoryItem } from '$lib/db/yaml-forge';
  import { Star, Trash2, Clock, Code, FileJson } from 'lucide-svelte';

  export let dict: Record<string, unknown>;
  export let onSelect: (item: YamlForgeHistoryItem) => void;

  let history: (YamlForgeHistoryItem & { id: number; timestamp: number; starred: boolean })[] = [];

  const loadHistory = async () => {
    history = (await getHistory()) as typeof history;
  };

  onMount(() => {
    loadHistory();
  });

  const handleToggleStar = async (e: Event, id: number, currentStarred: boolean) => {
    e.stopPropagation();
    await toggleStar(id, currentStarred);
    await loadHistory();
  };

  const handleDelete = async (e: Event, id: number) => {
    e.stopPropagation();
    await deleteFromHistory(id);
    await loadHistory();
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all unstarred history?')) {
      await clearHistory();
      await loadHistory();
    }
  };

  const truncate = (str: string, len: number) => {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString();
  };
</script>

<div class="h-full flex flex-col">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
      <Clock size={20} />
      {dict.history.title}
    </h2>
    {#if history.length > 0}
      <button
        class="text-sm text-red-500 hover:text-red-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center px-2"
        on:click={handleClearAll}
      >
        {dict.history.clear}
      </button>
    {/if}
  </div>

  <div class="flex-1 overflow-y-auto space-y-3 pr-2">
    {#if history.length === 0}
      <div class="text-center text-slate-500 dark:text-slate-400 py-8">
        {dict.history.empty}
      </div>
    {:else}
      {#each history as item (item.id)}
        <div
          class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors cursor-pointer group"
          on:click={() => onSelect(item)}
          on:keydown={(e) => e.key === 'Enter' && onSelect(item)}
          role="button"
          tabindex="0"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2 mb-1">
              {#if item.mode.includes('json')}
                <FileJson size={16} class="text-indigo-500" />
              {:else}
                <Code size={16} class="text-emerald-500" />
              {/if}
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {item.mode}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button
                class="p-1.5 rounded-lg text-slate-400 hover:text-yellow-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                on:click={(e) => handleToggleStar(e, item.id, item.starred)}
                aria-label="Toggle Star"
              >
                <Star size={16} class={item.starred ? 'fill-yellow-500 text-yellow-500' : ''} />
              </button>
              <button
                class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                on:click={(e) => handleDelete(e, item.id)}
                aria-label="Delete History Item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate mt-1">
            {truncate(item.input, 40)}
          </div>
          <div class="text-xs text-slate-400 mt-2">
            {formatDate(item.timestamp)}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
