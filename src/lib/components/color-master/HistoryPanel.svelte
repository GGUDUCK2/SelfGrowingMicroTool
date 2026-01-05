<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type ColorHistory } from '$lib/db';
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  export let t: any;

  const dispatch = createEventDispatcher();

  let history = liveQuery(() => db.colorHistory.orderBy('createdAt').reverse().limit(10).toArray());

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }).format(date);
  }

  function load(item: ColorHistory) {
    dispatch('load', item);
  }

  function deleteItem(id: number) {
    db.colorHistory.delete(id);
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
  <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t.recentPalettes}</h3>

  {#if $history}
    <div class="space-y-2">
      {#each $history as item (item.id)}
        <div transition:slide|local class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group">
          <button
            class="flex items-center gap-3 flex-1 text-left focus:outline-none"
            on:click={() => load(item)}
          >
            <div class="w-8 h-8 rounded-full shadow-sm border border-slate-200 dark:border-slate-700" style="background-color: {item.baseColor}"></div>
            <div>
              <p class="text-sm font-medium text-slate-700 dark:text-slate-200">{item.baseColor}</p>
              <p class="text-xs text-slate-500">{item.paletteType} • {formatDate(item.createdAt)}</p>
            </div>
          </button>

          <button
            class="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
            on:click={() => item.id && deleteItem(item.id)}
            aria-label="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      {/each}
      {#if $history.length === 0}
         <p class="text-sm text-slate-400 italic text-center py-4">{t.noHistory}</p>
      {/if}
    </div>
  {/if}
</div>
