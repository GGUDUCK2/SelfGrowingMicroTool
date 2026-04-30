<script lang="ts">

  import { Star, StarOff, Trash2, Clock, File, Type, KeyRound } from 'lucide-svelte';
  import { getHistory, toggleStar, deleteFromHistory, clearHistory, type HashForgeHistoryItem } from '$lib/db/hash-forge';
  import type { ToolHistoryItem } from '$lib/db/workspace';
  import { slide } from 'svelte/transition';

  export let history: ToolHistoryItem<HashForgeHistoryItem>[] = [];
  export let onSelect: (item: HashForgeHistoryItem) => void;

  async function loadHistory() {
    const rawHistory = await getHistory();
    history = rawHistory as unknown as ToolHistoryItem<HashForgeHistoryItem>[];
  }

  async function handleToggleStar(id: number, currentStarred: boolean) {
    await toggleStar(id, currentStarred);
    await loadHistory();
  }

  async function handleDelete(id: number) {
    await deleteFromHistory(id);
    await loadHistory();
  }

  async function handleClearHistory() {
    if (confirm("Clear all unstarred history?")) {
      await clearHistory();
      await loadHistory();
    }
  }

  import { onMount } from 'svelte';
onMount(() => {
    loadHistory();
    // In a real scenario, we'd use Svelte store reactivity or Dexie liveQuery.
    // For now, we'll reload when needed via a method or interval.
  });

  export const refreshHistory = loadHistory;

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
  <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
    <h3 class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
      <Clock size={16} class="text-indigo-500" />
      History
    </h3>
    <button
      on:click={handleClearHistory}
      class="text-xs text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
      aria-label="Clear unstarred history"
    >
      Clear Unstarred
    </button>
  </div>

  <div class="flex-1 overflow-y-auto p-4 space-y-3">
    {#if history.length === 0}
      <div class="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
        No recent activities.
      </div>
    {:else}
      {#each history as item (item.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="group relative bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer"
          on:click={() => onSelect(item.input)}
          transition:slide|local
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              {#if item.input.type === 'text'}
                <Type size={12} /> Text
              {:else if item.input.type === 'file'}
                <File size={12} /> File
              {:else}
                <KeyRound size={12} /> HMAC
              {/if}
              • {item.input.algorithm}
            </span>
            <span class="text-[10px] text-slate-400">{formatDate(item.timestamp)}</span>
          </div>

          <div class="text-sm text-slate-700 dark:text-slate-300 truncate font-medium mb-1">
            {item.input.inputName}
          </div>

          <div class="text-xs text-slate-500 dark:text-slate-500 font-mono truncate">
            {item.input.result}
          </div>

          <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-800/50 p-1 rounded-md">
            <button
              on:click|stopPropagation={() => handleToggleStar(item.id, item.starred)}
              class="p-1 rounded text-slate-400 hover:text-yellow-500 dark:hover:text-yellow-400"
              aria-label={item.starred ? "Unstar" : "Star"}
            >
              {#if item.starred}
                <Star size={14} class="fill-yellow-500 text-yellow-500" />
              {:else}
                <StarOff size={14} />
              {/if}
            </button>
            <button
              on:click|stopPropagation={() => handleDelete(item.id)}
              class="p-1 rounded text-slate-400 hover:text-red-500 dark:hover:text-red-400"
              aria-label="Delete from history"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
