<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { gridStore } from '$lib/utils/grid-master/store';
  import { analyzeGrid } from '$lib/utils/grid-master/doctor';
  import { X, AlertTriangle, AlertCircle, Info, CheckCircle, Activity } from 'lucide-svelte';
  import type { GridMasterDictionary } from '$lib/utils/grid-master/types';

  export let dict: GridMasterDictionary;

  const dispatch = createEventDispatcher();

  $: diagnosis = analyzeGrid($gridStore);

  function close() {
      dispatch('close');
  }
</script>

<div class="fixed top-24 right-4 z-40 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden" transition:slide={{ axis: 'x', duration: 300 }}>
    <!-- Header -->
    <div class="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
        <div class="flex items-center gap-2">
            <Activity size={18} class="text-indigo-500" />
            <h3 class="font-bold">{dict.doctor?.title || 'Grid Doctor'}</h3>
        </div>
        <button on:click={close} class="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" aria-label="Close Doctor">
            <X size={16} />
        </button>
    </div>

    <!-- Score -->
    <div class="p-6 flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div class="relative w-24 h-24 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" stroke-width="8" fill="transparent" class="text-slate-100 dark:text-slate-800" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" stroke-width="8" fill="transparent"
                        class="{diagnosis.score > 80 ? 'text-green-500' : (diagnosis.score > 50 ? 'text-amber-500' : 'text-red-500')} transition-all duration-1000 ease-out"
                        stroke-dasharray="{2 * Math.PI * 40}"
                        stroke-dashoffset="{2 * Math.PI * 40 * (1 - diagnosis.score / 100)}" />
            </svg>
            <span class="absolute text-2xl font-black text-slate-700 dark:text-white">{diagnosis.score}</span>
        </div>
        <div class="text-sm font-medium mt-2 opacity-60">{dict.doctor?.healthScore || 'Health Score'}</div>
    </div>

    <!-- Issues List -->
    <div class="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-3 bg-slate-50/50 dark:bg-black/20 custom-scrollbar">
        {#if diagnosis.issues.length === 0}
            <div class="text-center py-8 text-slate-500">
                <CheckCircle size={32} class="mx-auto mb-2 text-green-500" />
                <p>{dict.doctor?.allGood || 'All systems operational.'}</p>
            </div>
        {/if}

        {#each diagnosis.issues as issue (issue.id)}
            <div class="p-3 rounded-lg border text-sm flex gap-3 shadow-sm
                {issue.type === 'error' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-200' :
                (issue.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-200' :
                'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 text-blue-800 dark:text-blue-200')}"
            >
                <div class="shrink-0 mt-0.5">
                    {#if issue.type === 'error'}
                        <AlertCircle size={16} />
                    {:else if issue.type === 'warning'}
                        <AlertTriangle size={16} />
                    {:else}
                        <Info size={16} />
                    {/if}
                </div>
                <div>
                    <div class="font-bold mb-0.5">{issue.message}</div>
                    {#if issue.details}
                        <div class="text-xs opacity-80 leading-relaxed">{issue.details}</div>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
</style>
