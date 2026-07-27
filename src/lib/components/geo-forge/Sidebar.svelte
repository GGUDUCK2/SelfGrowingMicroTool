<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Layers, Plus, Eye, EyeOff, Trash2, Box, Maximize, History, Star, RotateCcw, Clipboard } from '@lucide/svelte';
  import StatsPanel from './StatsPanel.svelte';
  import type { Layer } from '$lib/utils/geo-forge/types';
  import { detectAndParse } from '$lib/utils/geo-forge/parser';
  import { liveQuery } from 'dexie';
  import { workspaceDB, toggleStar, type ToolHistoryItem as HistoryItem } from '$lib/db/workspace';

  export let layers: Layer[] = [];
  export let activeLayerId: string | null = null;
  export let activeLayer: Layer | undefined = undefined;
  export let editorFormat: 'wkt' | 'geojson' | 'csv' = 'wkt';
  export let dict: any = {};

  const dispatch = createEventDispatcher();

  let activeTab: 'layers' | 'history' = 'layers';

  let history = liveQuery(() => workspaceDB.history.where('toolId').equals('geo-forge').reverse().toArray());

  function handleAddLayer() {
      dispatch('addLayer');
  }

  async function handleSmartPaste() {
      try {
          const text = await navigator.clipboard.readText();
          if (!text) return;

          const result = detectAndParse(text);
          if (result && result.data) {
               dispatch('addLayer', {
                   name: 'Pasted Layer',
                   data: result.data,
                   format: result.format
               });
          }
      } catch (e) {
          alert((dict as any)?.pasteError || 'Failed to paste: ' + e);
      }
  }

  function handleRestore(item: HistoryItem) {
      try {
          const payload = JSON.parse(item.details);
          if (payload && payload.data) {
             dispatch('addLayer', payload);
          }
      } catch (e) {
          console.error("Failed to restore", e);
      }
  }
</script>

<div class="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
  <!-- Tabs -->
   <div class="flex border-b border-slate-200 dark:border-slate-700 shrink-0">
       <button
         class="flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors {activeTab === 'layers' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
         on:click={() => activeTab = 'layers'}
       >
         <Layers class="w-4 h-4"/> {(dict as any)?.layer?.add || 'Layers'}
       </button>
       <button
         class="flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors {activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
         on:click={() => activeTab = 'history'}
       >
         <History class="w-4 h-4"/> {(dict as any)?.history || 'History'}
       </button>
   </div>

  {#if activeTab === 'layers'}
      <!-- Layers Panel -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-700">
          <div class="flex justify-between items-center mb-3">
              <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Layers class="w-4 h-4" /> {(dict as any)?.layer?.list || 'Layer List'}
              </h3>
              <div class="flex gap-1">
                  <button
                    class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                    on:click={handleSmartPaste}
                    aria-label={(dict as any)?.smartPaste || "Smart Paste Layer"}
                    title={(dict as any)?.smartPaste || "Smart Paste Layer"}
                  >
                      <Clipboard class="w-4 h-4" />
                  </button>
                  <button
                    class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                    on:click={handleAddLayer}
                    aria-label="Add new layer"
                  >
                      <Plus class="w-4 h-4" />
                  </button>
              </div>
          </div>

          <div class="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {#each layers as layer (layer.id)}
                  <div
                     class="flex items-center gap-2 p-2 rounded-lg text-sm group border {activeLayerId === layer.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'}"
                     role="button"
                     tabindex="0"
                     on:click={() => dispatch('setActiveLayer', layer.id)}
                     on:keydown={(e) => e.key === 'Enter' && dispatch('setActiveLayer', layer.id)}
                  >
                      <button class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" on:click|stopPropagation={() => dispatch('toggleLayer', layer.id)} aria-label="Toggle layer visibility">
                          {#if layer.visible}
                              <Eye class="w-3 h-3" />
                          {:else}
                              <EyeOff class="w-3 h-3" />
                          {/if}
                      </button>

                      <div class="w-3 h-3 rounded-full shrink-0" style="background-color: {layer.color}"></div>

                      <span class="truncate flex-1 font-medium text-slate-700 dark:text-slate-200">{layer.name}</span>

                      <button class="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" on:click|stopPropagation={() => dispatch('removeLayer', layer.id)} aria-label="Delete layer">
                          <Trash2 class="w-3 h-3" />
                      </button>
                  </div>
              {/each}
          </div>
      </div>

      <!-- Tools Panel -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2">
           <button class="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all gap-1" on:click={() => dispatch('convexHull')} title="Create Convex Hull from active layer" aria-label="Create Convex Hull">
               <Box class="w-5 h-5" />
               <span class="text-xs font-medium">{(dict as any)?.convexHull || 'Convex Hull'}</span>
           </button>
           <button class="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all gap-1" on:click={() => dispatch('bbox')} title="Get Bounding Box" aria-label="Get Bounding Box">
               <Maximize class="w-5 h-5" />
               <span class="text-xs font-medium">{(dict as any)?.bounds || 'Bounds'}</span>
           </button>
      </div>

      <!-- Stats -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 class="font-bold text-slate-800 dark:text-white mb-2">Active Stats</h3>
          <StatsPanel geo={activeLayer?.data || null} {dict} columns={1} />
      </div>

      <!-- Converter -->
      <div class="p-4 flex-1">
          <h3 class="font-bold text-slate-800 dark:text-white mb-4">Converter</h3>
          <div class="grid grid-cols-1 gap-2">
              <button class="w-full py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-left text-sm font-medium transition-colors {editorFormat === 'wkt' ? 'ring-2 ring-indigo-500' : ''}" on:click={() => dispatch('convert', 'wkt')}>
                  To WKT
              </button>
              <button class="w-full py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-left text-sm font-medium transition-colors {editorFormat === 'geojson' ? 'ring-2 ring-indigo-500' : ''}" on:click={() => dispatch('convert', 'geojson')}>
                  To GeoJSON
              </button>
              <button class="w-full py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-left text-sm font-medium transition-colors {editorFormat === 'csv' ? 'ring-2 ring-indigo-500' : ''}" on:click={() => dispatch('convert', 'csv')}>
                  To CSV
              </button>
          </div>
      </div>
  {:else}
      <!-- History Content -->
      <div class="flex-1 overflow-y-auto p-4">
          {#if $history}
             {#each $history as item}
                 <div class="mb-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                     <div class="flex justify-between items-start mb-2">
                         <span class="font-medium text-sm text-slate-700 dark:text-slate-200">{item.action}</span>
                         <span class="text-xs text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                     </div>
                     <div class="flex gap-2 justify-between items-center mt-2">
                         <div class="text-xs text-slate-500 truncate max-w-[150px]">
                            {item.details && item.details.length > 50 ? 'Complex Data' : 'Saved State'}
                         </div>
                         <div class="flex gap-1">
                             <button class="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-yellow-500 transition-colors" on:click={() => toggleStar(item.id!)} aria-label="Star">
                                 <Star class="w-3.5 h-3.5 {item.starred ? 'fill-yellow-500 text-yellow-500' : ''}" />
                             </button>
                             <button class="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-indigo-500 transition-colors" on:click={() => handleRestore(item)} aria-label="Restore" title="Restore as new layer">
                                 <RotateCcw class="w-3.5 h-3.5" />
                             </button>
                         </div>
                     </div>
                 </div>
             {/each}
             {#if $history.length === 0}
                 <div class="text-center text-slate-400 text-sm py-8">
                     {(dict as any)?.historyEmpty || 'No history yet.'}
                 </div>
             {/if}
          {/if}
      </div>
  {/if}
</div>
