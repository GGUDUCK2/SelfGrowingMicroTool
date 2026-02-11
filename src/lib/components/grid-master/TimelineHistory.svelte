<script lang="ts">
  import { gridStore } from '$lib/utils/grid-master/store';
  import { slide } from 'svelte/transition';
  import { Clock, ChevronRight } from 'lucide-svelte';
  import type { GridMasterDictionary } from '$lib/utils/grid-master/types';

  export let dict: GridMasterDictionary;
  export let close: () => void;

  const { history, currentIndex } = gridStore;

  // Auto-scroll when index changes
  $: if ($currentIndex >= 0 && typeof document !== 'undefined') {
      const container = document.querySelector('.timeline-container');
      const active = document.querySelector('.active-step') as HTMLElement;
      if (container && active) {
           container.scrollLeft = active.offsetLeft - container.clientWidth / 2 + active.clientWidth / 2;
      }
  }
</script>

<div class="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] h-48 flex flex-col" transition:slide={{ axis: 'y' }}>
  <!-- Header -->
  <div class="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <div class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Clock size={16} class="text-indigo-500" />
          <span>{dict.timeMachine || 'Time Machine'}</span>
          <span class="text-xs font-normal opacity-50 ml-2">{$currentIndex + 1} / {$history.length}</span>
      </div>
      <button on:click={close} class="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" aria-label="Close Timeline">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </button>
  </div>

  <!-- Timeline -->
  <div class="timeline-container flex-1 overflow-x-auto p-4 flex gap-4 items-center custom-scrollbar scroll-smooth">
      {#each $history as state, i (i)}
          <button
              class="relative shrink-0 w-24 h-24 rounded-lg border-2 transition-all duration-200 group flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-800
              {i === $currentIndex ? 'active-step border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg scale-105 z-10' :
               i > $currentIndex ? 'border-slate-200 dark:border-slate-700 opacity-50 grayscale hover:grayscale-0' :
               'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}"
              on:click={() => gridStore.jumpTo(i)}
              aria-label={`Jump to state ${i}`}
          >
              <!-- Mini Grid Preview -->
              <div class="flex-1 w-full grid p-1 gap-0.5 pointer-events-none"
                   style="grid-template-rows: {state.rows.map(() => '1fr').join(' ')}; grid-template-columns: {state.cols.map(() => '1fr').join(' ')}">
                  {#each state.areas as area (area.id)}
                      <div class="bg-current opacity-20 rounded-[1px]" style="color: {area.color}; grid-area: {area.rowStart} / {area.colStart} / {area.rowEnd} / {area.colEnd}"></div>
                  {/each}
              </div>

              <!-- Label -->
              <div class="h-6 flex items-center justify-center bg-white dark:bg-slate-900 text-[10px] font-mono border-t border-inherit w-full">
                  {#if i === 0}
                      Start
                  {:else}
                      Step {i}
                  {/if}
              </div>

              {#if i === $currentIndex}
                  <div class="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border border-white dark:border-slate-900"></div>
              {/if}
          </button>

          {#if i < $history.length - 1}
              <div class="shrink-0 text-slate-300 dark:text-slate-700">
                  <ChevronRight size={16} />
              </div>
          {/if}
      {/each}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #334155;
  }
</style>
