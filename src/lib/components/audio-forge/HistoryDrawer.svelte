<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { liveQuery } from 'dexie';
  import { db, type AudioForgeHistory } from '$lib/db';
  import { createEventDispatcher } from 'svelte';
  import { Trash2, Clock, PlayCircle } from 'lucide-svelte';

  export let show = false;
  export let dict: any;
  const dispatch = createEventDispatcher<{ restore: AudioForgeHistory; close: void }>();

  let history$ = liveQuery(() => db.audioForgeHistory.orderBy('createdAt').reverse().toArray());

  function restore(item: AudioForgeHistory) {
      dispatch('restore', item);
  }

  async function deleteItem(id?: number) {
      if (id && confirm(dict.history.deleteConfirm)) {
          await db.audioForgeHistory.delete(id);
      }
  }

  function formatTime(date: Date) {
      return new Date(date).toLocaleString();
  }

  function formatDuration(s: number) {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${m}:${sec.toString().padStart(2, '0')}`;
  }
</script>

{#if show}
    <button aria-label="Close history overlay" class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm w-full h-full cursor-default" on:click={() => dispatch('close')} transition:fade></button>

    <div class="fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col" transition:slide={{ axis: 'x', duration: 300 }}>
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <h3 class="font-bold text-lg text-slate-800 dark:text-white">{dict.history.title}</h3>
            <button aria-label="Close" on:click={() => dispatch('close')} class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3">
            {#if $history$}
                {#each $history$ as item (item.id)}
                    <div class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="font-medium text-slate-900 dark:text-slate-100 truncate pr-2" title={item.name}>{item.name}</h4>
                            <button on:click|stopPropagation={() => deleteItem(item.id)} class="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>

                        <div class="flex items-center gap-4 text-xs text-slate-500 mb-3">
                            <span class="flex items-center gap-1">
                                <Clock class="w-3 h-3" /> {formatDuration(item.duration)}
                            </span>
                            <span class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded uppercase font-mono text-[10px]">{item.format}</span>
                        </div>

                        <div class="flex items-center justify-between">
                            <span class="text-[10px] text-slate-400">{formatTime(item.createdAt)}</span>
                            <button on:click={() => restore(item)} class="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                                <PlayCircle class="w-3 h-3" /> {dict.history.load}
                            </button>
                        </div>
                    </div>
                {/each}
                {#if $history$.length === 0}
                    <div class="text-center py-8 text-slate-500 text-sm">
                        {dict.history.empty}
                    </div>
                {/if}
            {/if}
        </div>
    </div>
{/if}
