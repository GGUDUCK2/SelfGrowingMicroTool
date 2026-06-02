<script lang="ts">
  import { liveQuery } from 'dexie';
  import { getHistoryObservable, deleteHistoryItem, clearHistory, toggleStar } from '$lib/db/workspace';
  import type { ToolHistoryItem } from '$lib/db/workspace';
  import { createEventDispatcher } from 'svelte';
  import { Copy, Trash2, Clock, Star, Terminal, FileCode, MessageSquare } from '@lucide/svelte';
  import { slide } from 'svelte/transition';
  import type { GitForgeDictionary } from './types';

  export let dictionary: GitForgeDictionary;

  const dispatch = createEventDispatcher();

  let history = liveQuery(() => getHistoryObservable('git-forge').toArray());

  async function deleteItem(id: number | undefined) {
      if (id) await deleteHistoryItem(id);
  }

  async function clear() {
      if (confirm('Clear all history?')) {
          await clearHistory('git-forge');
      }
  }

  async function toggleStarItem(item: ToolHistoryItem) {
      if (item.id) {
          await toggleStar(item.id);
      }
  }

  function copy(content: string) {
      navigator.clipboard.writeText(content);
      dispatch('copy');
  }

    function handleRestore(item: ToolHistoryItem) {
        dispatch('restore', item);
    }
</script>

<div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-sm text-slate-700 dark:text-slate-200">{dictionary.history.title}</h3>
        {#if $history && $history.length > 0}
            <button on:click={clear} class="min-h-[44px] min-w-[44px] text-xs text-red-500 hover:text-red-600 underline">
                {dictionary.history.clear}
            </button>
        {/if}
    </div>

    <div class="flex-1 overflow-y-auto space-y-3 pr-2">
        {#if $history?.length === 0}
            <div class="text-center text-slate-500 text-sm py-8">
                {dictionary.history.empty}
            </div>
        {:else if $history}
            {#each $history as item (item.id)}
                {@const payload = item.input || { type: 'command', content: '', details: '' }}
                <div class="group relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer" transition:slide|local>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="flex items-start gap-3 w-full min-h-[44px]" on:click={() => handleRestore(item)} role="button" tabindex="0">
                        <div class="p-1.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 mt-0.5">
                            <svelte:component this={payload.type === 'command' ? Terminal : payload.type === 'ignore' ? FileCode : MessageSquare} size={14} />
                        </div>
                        <div class="flex-1 min-w-0 text-left">
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{payload.type}</span>
                                <span class="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div class="font-mono text-xs text-slate-800 dark:text-slate-200 truncate mt-1" title={payload.content}>
                                {payload.content}
                            </div>
                            {#if payload.details}
                                <div class="text-[10px] text-slate-500 mt-1 truncate">{payload.details}</div>
                            {/if}
                        </div>
                    </div>

                    <div class="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 shadow-sm rounded border border-slate-100 dark:border-slate-700">
                        <button on:click={() => copy(payload.content)} class="min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-500 rounded" title="Copy" aria-label="Copy">
                            <Copy size={16} />
                        </button>
                        <button on:click={() => toggleStarItem(item)} class="min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-yellow-500 rounded" title="Star" aria-label="Star">
                            <Star size={16} fill={item.starred ? "currentColor" : "none"} class={item.starred ? "text-yellow-500" : ""} />
                        </button>
                        <button on:click={() => deleteItem(item.id)} class="min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 rounded" title="Delete" aria-label="Delete">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>
