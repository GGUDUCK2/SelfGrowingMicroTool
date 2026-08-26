<script lang="ts">
  import { gridMasterWorkspace } from '$lib/db/grid-master';
  import { gridStore } from '$lib/utils/grid-master/store';
  import { Trash2, Star, FolderOpen } from '@lucide/svelte';
  import { liveQuery } from 'dexie';
  import { browser } from '$app/environment';
  import type { GridMasterDictionary } from '$lib/utils/grid-master/types';
  import type { GridMasterProject } from '$lib/db';

  export let dict: GridMasterDictionary;

  let projects: GridMasterProject[] = [];

  if (browser) {
      const projectsObservable = liveQuery(() => gridMasterWorkspace.loadAll());
      projectsObservable.subscribe(val => projects = val);
  }

  async function loadProject(p: GridMasterProject) {
      // Create a clean state object excluding DB fields

      const { id, createdAt, updatedAt, starred, ...state } = p;
      gridStore.load(state);
  }

  async function deleteProject(id: number) {
      if (confirm('Delete project?')) {
          await gridMasterWorkspace.delete(id);
      }
  }

  async function toggleStar(id: number) {
      await gridMasterWorkspace.toggleStar(id);
  }
</script>

<div class="space-y-4">
  <h3 class="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
      <FolderOpen size={14} />
      {dict.history}
  </h3>

  <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
     {#if projects.length === 0}
         <div class="text-sm text-slate-500 italic p-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center">
             {dict.noHistory}
         </div>
     {/if}

     {#each projects as p (p.id)}
         <div class="relative p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group shadow-sm hover:shadow-md">
             <!-- Main Load Action (Overlay Button) -->
             <button
                class="absolute inset-0 w-full h-full cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg z-0"
                on:click={() => loadProject(p)}
                aria-label={`Load project ${p.name}`}
             ></button>

             <!-- Content (Pointer events none to let clicks pass to button, or just visual) -->
             <div class="relative z-0 pointer-events-none">
                 <div class="flex justify-between items-start mb-2">
                     <h4 class="font-bold text-sm text-slate-800 dark:text-slate-200 truncate pr-6" title={p.name}>{p.name}</h4>
                 </div>

                 <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                     <span class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">{p.rows.length}x{p.cols.length}</span>
                     <span class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{p.areas.length} Areas</span>
                     <span class="ml-auto text-[10px] opacity-70">{new Date(p.updatedAt).toLocaleDateString()}</span>
                 </div>
             </div>

             <!-- Actions (Star/Delete) - Absolute positioned on top with pointer-events-auto -->
             <div class="flex items-center gap-1 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 p-1 rounded-md shadow-sm z-10 border border-slate-100 dark:border-slate-700 pointer-events-auto">
                 <button
                   class="p-1 text-slate-400 hover:text-yellow-500 transition-colors relative z-20"
                   on:click|stopPropagation={() => toggleStar(p.id)}
                   aria-label="Star Project"
                 >
                    <Star size={14} fill={p.starred ? "currentColor" : "none"} class={p.starred ? "text-yellow-500" : ""} />
                 </button>
                 <button
                   class="p-1 text-slate-400 hover:text-red-500 transition-colors relative z-20"
                   on:click|stopPropagation={() => deleteProject(p.id)}
                   aria-label="Delete Project"
                 >
                    <Trash2 size={14} />
                 </button>
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
