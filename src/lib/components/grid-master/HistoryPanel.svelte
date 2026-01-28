<script lang="ts">
  import { workspace, type ToolHistoryItem, toggleStar, deleteHistoryItem } from '$lib/db/workspace';
  import { gridStore } from '$lib/utils/grid-master/store';
  import { liveQuery } from 'dexie';
  import { browser } from '$app/environment';
  import { Clock, RotateCcw, Star, Trash2 } from 'lucide-svelte';
  import TemplatePreview from './TemplatePreview.svelte';
  import type { GridState, GridMasterDictionary } from '$lib/utils/grid-master/types';

  export let dict: GridMasterDictionary;

  let history: ToolHistoryItem<GridState>[] = [];

  if (browser) {
      liveQuery(() => workspace.history
        .where('toolId').equals('grid-master')
        .reverse()
        .limit(20)
        .toArray()
      ).subscribe(val => history = val as ToolHistoryItem<GridState>[]);
  }

  function restore(state: GridState | undefined) {
      if (!state) return;
      if (confirm(dict.restoreConfirm || 'Restore this session version? Current work will be replaced.')) {
          gridStore.load(state);
      }
  }

  function formatTime(ms: number) {
      return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
</script>

<div class="space-y-4">
  <h3 class="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
      <Clock size={14} />
      {dict.history || 'Session History'}
  </h3>

  <div class="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
     {#if history.length === 0}
         <div class="text-sm text-slate-500 italic p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center">
             {dict.noHistory || 'No recent history'}
         </div>
     {/if}

     {#each history as item (item.id)}
         <div class="group relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all p-3 shadow-sm">
             <div class="flex justify-between items-center mb-2">
                 <div class="flex items-center gap-2">
                     <span class="text-xs font-mono text-slate-500 dark:text-slate-400">{formatTime(item.timestamp)}</span>
                     {#if item.starred}
                        <span class="text-yellow-400"><Star size={12} fill="currentColor" /></span>
                     {/if}
                 </div>

                 <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                       class="p-1.5 {item.starred ? 'text-yellow-400 hover:text-yellow-500' : 'text-slate-400 hover:text-yellow-400'} hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                       on:click={() => item.id && toggleStar(item.id)}
                       title={dict.star || 'Star'}
                       aria-label={dict.star || 'Star'}
                     >
                         <Star size={14} fill={item.starred ? "currentColor" : "none"} />
                     </button>
                     <button
                       class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                       on:click={() => item.id && deleteHistoryItem(item.id)}
                       title={dict.delete || 'Delete'}
                       aria-label={dict.delete || 'Delete'}
                     >
                         <Trash2 size={14} />
                     </button>
                     <div class="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                     <button
                       class="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                       on:click={() => restore(item.input)}
                       title={dict.restore || 'Restore'}
                       aria-label={dict.restore || 'Restore'}
                     >
                         <RotateCcw size={14} />
                     </button>
                 </div>
             </div>

             <!-- Preview -->
             <div class="h-20 bg-slate-100 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700 overflow-hidden">
                 <TemplatePreview state={item.input} />
             </div>
         </div>
     {/each}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #334155;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
</style>
