<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type IconForgeProject } from '$lib/db';
  import { Star, Trash2, History as HistoryIcon, ArrowUpRight } from '@lucide/svelte';
  import { createEventDispatcher } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import type { IconForgeDictionary } from '$lib/types/icon-forge';

  export let t: IconForgeDictionary;

  const dispatch = createEventDispatcher<{
    restore: IconForgeProject;
  }>();

  // Use liveQuery to reactively update history
  let history = liveQuery(() =>
    db.iconForgeProjects
      .orderBy('createdAt')
      .reverse()
      .limit(10)
      .toArray()
  );

  async function deleteItem(id: number) {
    await db.iconForgeProjects.delete(id);
  }

  async function toggleStar(item: IconForgeProject) {
    if (item.id) {
        await db.iconForgeProjects.update(item.id, { starred: item.starred ? 0 : 1 });
    }
  }

  function restore(item: IconForgeProject) {
    dispatch('restore', item);
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(date);
  }
</script>

<div class="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 shadow-lg">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-medium text-slate-50 flex items-center">
      <HistoryIcon class="w-5 h-5 mr-2 text-indigo-500" />
      {t.history.title}
    </h3>
  </div>

  {#if $history}
    {#if $history.length === 0}
      <p class="text-slate-500 text-sm italic text-center py-4">{t.history.empty}</p>
    {:else}
      <div class="space-y-3">
        {#each $history as item (item.id)}
          <div
            class="group bg-slate-800 border border-slate-700 rounded-lg p-3 hover:border-indigo-500/50 transition-colors relative"
            in:slide|local
          >
            <div class="flex items-start justify-between">
                <div class="flex items-center space-x-3 overflow-hidden">
                    <div class="w-10 h-10 rounded bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {#if item.config.background}
                             <div class="w-full h-full" style="background-color: {item.config.background}"></div>
                        {:else}
                             <div class="w-full h-full bg-slate-600"></div>
                        {/if}
                    </div>
                    <div class="min-w-0">
                        <p class="text-sm font-medium text-slate-200 truncate">{item.name}</p>
                        <p class="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                    </div>
                </div>

                <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        class="p-1.5 text-slate-400 hover:text-indigo-400 rounded-md hover:bg-slate-700"
                        title={t.history.restore}
                        on:click={() => restore(item)}
                    >
                        <ArrowUpRight class="w-4 h-4" />
                    </button>
                    <button
                        class="p-1.5 text-slate-400 hover:text-yellow-400 rounded-md hover:bg-slate-700"
                        on:click={() => toggleStar(item)}
                    >
                        <Star class="w-4 h-4 {item.starred ? 'fill-yellow-400 text-yellow-400' : ''}" />
                    </button>
                    <button
                        class="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-700"
                        title={t.history.delete}
                        on:click={() => item.id && deleteItem(item.id)}
                    >
                        <Trash2 class="w-4 h-4" />
                    </button>
                </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
