<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Layers, Plus, Eye, EyeOff, Trash2, Box, Maximize } from 'lucide-svelte';
  import StatsPanel from './StatsPanel.svelte';
  import type { Layer } from '$lib/utils/geo-forge/types';

  export let layers: Layer[] = [];
  export let activeLayerId: string | null = null;
  export let activeLayer: Layer | undefined = undefined;
  export let editorFormat: 'wkt' | 'geojson' | 'csv' = 'wkt';
  export let dict: any = {};

  const dispatch = createEventDispatcher();

  function handleAddLayer() {
      dispatch('addLayer');
  }
</script>

<div class="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
  <!-- Layers Panel -->
  <div class="p-4 border-b border-slate-200 dark:border-slate-700">
      <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Layers class="w-4 h-4" /> {dict?.layer?.add || 'Layers'}
          </h3>
          <button
            class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            on:click={handleAddLayer}
            aria-label="Add new layer"
          >
              <Plus class="w-4 h-4" />
          </button>
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
           <span class="text-xs font-medium">{dict?.convexHull || 'Convex Hull'}</span>
       </button>
       <button class="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all gap-1" on:click={() => dispatch('bbox')} title="Get Bounding Box" aria-label="Get Bounding Box">
           <Maximize class="w-5 h-5" />
           <span class="text-xs font-medium">{dict?.bounds || 'Bounds'}</span>
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
</div>
