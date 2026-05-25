<script lang="ts">
  import type { VariableAxis } from '$lib/utils/type-forge/types';
  import { RotateCcw } from '@lucide/svelte';

  export let axes: VariableAxis[];
  export let dict: any;

  function reset(axis: VariableAxis) {
      axis.current = axis.default;
      axes = [...axes];
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
  <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-6">{dict.variable.title}</h3>

  {#if axes.length > 0}
      <div class="space-y-6">
          {#each axes as axis}
              <div class="space-y-2">
                  <div class="flex justify-between items-center text-sm">
                      <span class="font-medium text-slate-700 dark:text-slate-300">{axis.name} <span class="text-xs text-slate-400 font-mono">'{axis.tag}'</span></span>
                      <div class="flex items-center gap-2">
                          <input
                              type="number"
                              bind:value={axis.current}
                              min={axis.min}
                              max={axis.max}
                              class="w-16 text-right text-xs border-b border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none dark:text-white"
                          >
                          <button on:click={() => reset(axis)} class="text-slate-400 hover:text-indigo-600" title="Reset">
                              <RotateCcw size={12} />
                          </button>
                      </div>
                  </div>
                  <input
                      type="range"
                      min={axis.min}
                      max={axis.max}
                      step={(axis.max - axis.min) / 100}
                      bind:value={axis.current}
                      class="w-full accent-indigo-600"
                  >
                  <div class="flex justify-between text-[10px] text-slate-400">
                      <span>{axis.min}</span>
                      <span>{axis.max}</span>
                  </div>
              </div>
          {/each}
      </div>
  {:else}
      <div class="text-center py-8 text-slate-500 text-sm">
          {dict.variable.noAxes}
      </div>
  {/if}
</div>
