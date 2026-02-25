<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type GitForgeHistory } from '$lib/db';
  import { createEventDispatcher } from 'svelte';
  import { Copy, Trash2, Clock, Star, Terminal, FileCode, MessageSquare } from 'lucide-svelte';
  import { slide } from 'svelte/transition';

  export let dictionary: any;

  const dispatch = createEventDispatcher();

  let history = liveQuery(() => db.gitForgeHistory.orderBy('createdAt').reverse().limit(50).toArray());

  async function deleteItem(id: number | undefined) {
      if (id) await db.gitForgeHistory.delete(id);
  }

  async function clear() {
      if (confirm('Clear all history?')) {
          await db.gitForgeHistory.clear();
      }
  }

  async function toggleStar(item: GitForgeHistory) {
      if (item.id) {
          await db.gitForgeHistory.update(item.id, { starred: item.starred ? 0 : 1 });
      }
  }

  function copy(content: string) {
      navigator.clipboard.writeText(content);
      dispatch('copy');
  }
</script>

<div class="h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-sm text-slate-700 dark:text-slate-200">{dictionary.history.title}</h3>
        {#if $history && $history.length > 0}
            <button on:click={clear} class="text-xs text-red-500 hover:text-red-600 underline">
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
                <div class="group relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors" transition:slide|local>
                    <div class="flex items-start gap-3">
                        <div class="p-1.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 mt-0.5">
                            <svelte:component this={item.type === 'command' ? Terminal : item.type === 'ignore' ? FileCode : MessageSquare} size={14} />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{item.type}</span>
                                <span class="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <div class="font-mono text-xs text-slate-800 dark:text-slate-200 truncate mt-1" title={item.content}>
                                {item.content}
                            </div>
                            {#if item.details}
                                <div class="text-[10px] text-slate-500 mt-1 truncate">{item.details}</div>
                            {/if}
                        </div>
                    </div>

                    <div class="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 shadow-sm rounded border border-slate-100 dark:border-slate-700">
                        <button on:click={() => copy(item.content)} class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-500 rounded" title="Copy">
                            <Copy size={12} />
                        </button>
                        <button on:click={() => toggleStar(item)} class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-yellow-500 rounded" title="Star">
                            <Star size={12} fill={item.starred ? "currentColor" : "none"} class={item.starred ? "text-yellow-500" : ""} />
                        </button>
                        <button on:click={() => deleteItem(item.id)} class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 rounded" title="Delete">
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>
