<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type ColorHistory } from '$lib/db';
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import type { ColorMasterDictionary } from '$lib/types/color-master';

  export let t: ColorMasterDictionary;

  const dispatch = createEventDispatcher();

  // Separate queries to ensure starred items persist even if they are old
  let starredHistory = liveQuery(() => db.colorHistory.where('starred').equals(1).reverse().toArray());
  let recentHistory = liveQuery(() => db.colorHistory.orderBy('createdAt').reverse().limit(20).toArray());

  // Filter recent items to exclude those that are already shown in starred list to avoid duplication if desired,
  // OR just show them as recent.
  // The user probably wants "Starred" at the top, and "Recent" below.
  // We can let them duplicate if they are both recent and starred, or filter.
  // Let's filter: Recent list should show non-starred items, or just all recent?
  // Usually "Recent" implies timeline. "Starred" implies saved.
  // Let's just show all recent in "Recent", but maybe highlight if they are starred.
  // The review pointed out that starred items *disappear* from the UI if they fall out of the query.
  // So using two queries fixes that.

  $: starredItems = $starredHistory || [];
  $: recentItems = ($recentHistory || []).filter(item => item.starred !== 1); // Only show non-starred in recent to avoid duplication in view

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }).format(date);
  }

  function load(item: ColorHistory) {
    dispatch('load', item);
  }

  function deleteItem(id: number) {
    db.colorHistory.delete(id);
  }

  function toggleStar(item: ColorHistory) {
    if (item.id) {
      db.colorHistory.update(item.id, { starred: item.starred === 1 ? 0 : 1 });
    }
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">

  <!-- Starred Section -->
  {#if starredItems.length > 0}
    <div>
      <h3 class="text-sm uppercase tracking-wider text-slate-500 font-bold mb-3">{t.starredPalettes}</h3>
      <div class="space-y-2">
        {#each starredItems as item (item.id)}
          <div transition:slide|local class="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 transition-colors group">
            <button
              class="flex items-center gap-3 flex-1 text-left focus:outline-none min-h-[44px] min-w-[44px]"
              on:click={() => load(item)}
              on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && load(item)}
            >
              <div class="w-8 h-8 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 shrink-0" style="background-color: {item.baseColor}"></div>
              <div class="overflow-hidden">
                <p class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{item.baseColor}</p>
                <p class="text-xs text-slate-500 truncate">{item.paletteType}</p>
              </div>
            </button>

            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                class="p-2 text-amber-500 hover:text-amber-600 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                on:click={() => toggleStar(item)}
                aria-label="Unstar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Recent Section -->
  <div>
    <h3 class="text-sm uppercase tracking-wider text-slate-500 font-bold mb-3">{t.recentPalettes}</h3>
    {#if recentItems.length > 0}
      <div class="space-y-2">
        {#each recentItems as item (item.id)}
          <div transition:slide|local class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group">
            <button
              class="flex items-center gap-3 flex-1 text-left focus:outline-none min-h-[44px] min-w-[44px]"
              on:click={() => load(item)}
              on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && load(item)}
            >
              <div class="w-8 h-8 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 shrink-0" style="background-color: {item.baseColor}"></div>
              <div class="overflow-hidden">
                <p class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{item.baseColor}</p>
                <p class="text-xs text-slate-500 truncate">{item.paletteType}</p>
              </div>
            </button>

            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                class="p-2 text-slate-400 hover:text-amber-500 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                on:click={() => toggleStar(item)}
                aria-label="Star"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </button>
              <button
                class="p-2 text-slate-400 hover:text-red-500 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                on:click={() => item.id && deleteItem(item.id)}
                aria-label="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-sm text-slate-400 italic text-center py-4">{t.noHistory}</p>
    {/if}
  </div>
</div>
