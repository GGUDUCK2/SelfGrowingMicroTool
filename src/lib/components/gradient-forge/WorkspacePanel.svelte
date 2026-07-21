<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { db } from '$lib/db';
  import Button from '$lib/components/Button.svelte';
  import { fade, slide } from 'svelte/transition';

  export let t: any;
  export let currentGradient: any;

  const dispatch = createEventDispatcher();
  let history: any[] = [];
  let isSaving = false;

  onMount(async () => {
    await loadHistory();
  });

  async function loadHistory() {
    try {
      history = await db.gradientForgeHistory
        .orderBy('createdAt')
        .reverse()
        .limit(20)
        .toArray();
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }

  async function saveToHistory() {
    if (!currentGradient) return;
    isSaving = true;
    try {
      const entry = {
        name: `Gradient ${new Date().toLocaleTimeString()}`,
        gradientType: currentGradient.type,
        direction: currentGradient.type === 'linear' || currentGradient.type === 'conic' ? currentGradient.angle.toString() : currentGradient.position,
        stops: currentGradient.stops,
        css: currentGradient.css,
        createdAt: new Date()
      };
      await db.gradientForgeHistory.add(entry);
      await loadHistory();
    } catch (e) {
      console.error('Failed to save to history', e);
    } finally {
      isSaving = false;
    }
  }

  async function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
      await db.gradientForgeHistory.clear();
      await loadHistory();
    }
  }

  async function toggleStar(id: number, current: number | undefined) {
    await db.gradientForgeHistory.update(id, { starred: current ? 0 : 1 });
    await loadHistory();
  }

  function loadItem(item: any) {
    dispatch('load', {
      type: item.gradientType,
      angle: item.gradientType === 'linear' || item.gradientType === 'conic' ? parseInt(item.direction) || 90 : 90,
      position: item.gradientType === 'radial' ? item.direction : 'center',
      stops: item.stops
    });
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
    <h3 class="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"></path><circle cx="12" cy="12" r="10"></circle></svg>
      {t.history}
    </h3>
    <div class="flex gap-2">
      <Button
        variant="primary"
        class="!py-1.5 !px-3 text-sm min-h-[36px]"
        on:click={saveToHistory}
        disabled={isSaving}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        {t.save}
      </Button>
      {#if history.length > 0}
        <button
          class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
          on:click={clearHistory}
          title={t.clearHistory}
          aria-label={t.clearHistory}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>
      {/if}
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-4 space-y-3">
    {#if history.length === 0}
      <div class="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-3 py-12" in:fade>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        <p class="text-sm">{t.noHistory}</p>
      </div>
    {:else}
      {#each history as item (item.id)}
        <div
          class="group relative flex items-center gap-3 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer"
          on:click={() => loadItem(item)}
          on:keydown={(e) => e.key === 'Enter' && loadItem(item)}
          role="button"
          tabindex="0"
          in:slide
        >
          <!-- Preview Bubble -->
          <div
            class="w-12 h-12 rounded-lg shadow-inner border border-slate-200 dark:border-slate-600 flex-shrink-0"
            style="background: {item.css}"
          ></div>

          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-slate-900 dark:text-white truncate pr-6">{item.name}</h4>
            <p class="text-xs text-slate-500 truncate flex gap-2">
              <span class="capitalize">{item.gradientType}</span>
              <span>•</span>
              <span>{item.stops.length} stops</span>
            </p>
          </div>

          <button
            class="absolute top-2 right-2 p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
            class:!opacity-100={item.starred}
            on:click|stopPropagation={() => toggleStar(item.id, item.starred)}
            aria-label="Toggle Star"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 {item.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </button>
        </div>
      {/each}
    {/if}
  </div>
</div>
