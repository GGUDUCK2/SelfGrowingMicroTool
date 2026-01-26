<script lang="ts">
  import { gridStore } from '$lib/utils/grid-master/store';
  import { Plus, Trash2, LayoutTemplate, Clock, Settings2 } from 'lucide-svelte';
  import type { GridMasterDictionary } from '$lib/utils/grid-master/types';
  import { templates } from '$lib/utils/grid-master/templates';
  import { nanoid } from 'nanoid';
  import TemplatePreview from './TemplatePreview.svelte';
  import HistoryPanel from './HistoryPanel.svelte';

  export let dict: GridMasterDictionary;

  let activeTab: 'build' | 'templates' | 'history' = 'build';

  function loadTemplate(key: string) {
      if (confirm(dict.loadTemplateConfirm || 'Load template? This will replace your current grid.')) {
          const t = JSON.parse(JSON.stringify(templates[key]));
          gridStore.load(t);
      }
  }

  function updateRow(idx: number, val: string) {
      gridStore.updateRow(idx, val);
  }

  function updateCol(idx: number, val: string) {
      gridStore.updateCol(idx, val);
  }

  function updateAreaName(id: string, name: string) {
      gridStore.updateArea(id, { name });
  }

  function addArea() {
      // Add a default area at 1,1
      gridStore.addArea({
          id: nanoid(),
          name: `area-${$gridStore.areas.length + 1}`,
          rowStart: 1,
          rowEnd: 2,
          colStart: 1,
          colEnd: 2,
          color: 'indigo' // Default color
      });
  }

  const colorMap: Record<string, string> = {
    red: '#f87171', orange: '#fb923c', amber: '#fbbf24', yellow: '#facc15',
    lime: '#a3e635', green: '#4ade80', emerald: '#34d399', teal: '#2dd4bf',
    sky: '#38bdf8', blue: '#60a5fa', indigo: '#818cf8', violet: '#a78bfa',
    purple: '#c084fc', fuchsia: '#e879f9', pink: '#f472b6', rose: '#fb7185'
  };
</script>

<div class="space-y-6">
  <!-- Tabs -->
  <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <button
        class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 {activeTab === 'build' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
        on:click={() => activeTab = 'build'}
      >
          <Settings2 size={14} />
          {dict.build || 'Build'}
      </button>
      <button
        class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 {activeTab === 'templates' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
        on:click={() => activeTab = 'templates'}
      >
          <LayoutTemplate size={14} />
          {dict.templates || 'Templates'}
      </button>
      <button
        class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 {activeTab === 'history' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
        on:click={() => activeTab = 'history'}
      >
          <Clock size={14} />
          {dict.history || 'History'}
      </button>
  </div>

  {#if activeTab === 'build'}
      <!-- Tracks Configuration -->
      <div class="space-y-4">
          <h3 class="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dict.rows}</h3>
          <div class="space-y-2">
              {#each $gridStore.rows as row, i (i)}
                 <div class="flex gap-2 items-center">
                     <span class="text-xs text-slate-400 font-mono w-4">{i+1}</span>
                     <input
                       type="text"
                       value={row}
                       on:change={(e) => updateRow(i, e.currentTarget.value)}
                       class="flex-1 min-w-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                       aria-label={`Row ${i + 1} size`}
                     />
                     <button
                       class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                       on:click={() => gridStore.removeRow(i)}
                       aria-label={dict.remove}
                     >
                        <Trash2 size={14} />
                     </button>
                 </div>
              {/each}
              <button
                class="w-full py-2 flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 rounded text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                on:click={() => gridStore.addRow()}
              >
                 <Plus size={14} />
                 {dict.add}
              </button>
          </div>
      </div>

      <div class="space-y-4">
          <h3 class="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dict.cols}</h3>
          <div class="space-y-2">
              {#each $gridStore.cols as col, i (i)}
                 <div class="flex gap-2 items-center">
                     <span class="text-xs text-slate-400 font-mono w-4">{i+1}</span>
                     <input
                       type="text"
                       value={col}
                       on:change={(e) => updateCol(i, e.currentTarget.value)}
                       class="flex-1 min-w-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                       aria-label={`Column ${i + 1} size`}
                     />
                     <button
                       class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                       on:click={() => gridStore.removeCol(i)}
                       aria-label={dict.remove}
                     >
                        <Trash2 size={14} />
                     </button>
                 </div>
              {/each}
              <button
                class="w-full py-2 flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 rounded text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                on:click={() => gridStore.addCol()}
              >
                 <Plus size={14} />
                 {dict.add}
              </button>
          </div>
      </div>

      <div class="space-y-4">
          <h3 class="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dict.gap}</h3>
          <div class="grid grid-cols-2 gap-3">
              <div>
                  <label for="row-gap" class="text-xs text-slate-500 block mb-1">{dict.rowGap}</label>
                  <input
                    id="row-gap"
                    type="text"
                    value={$gridStore.rowGap}
                    on:change={(e) => gridStore.setRowGap(e.currentTarget.value)}
                    class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
              </div>
              <div>
                  <label for="col-gap" class="text-xs text-slate-500 block mb-1">{dict.colGap}</label>
                  <input
                    id="col-gap"
                    type="text"
                    value={$gridStore.colGap}
                    on:change={(e) => gridStore.setColGap(e.currentTarget.value)}
                    class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
              </div>
          </div>
      </div>

      <!-- Areas List -->
      <div class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
              <h3 class="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dict.areas}</h3>
              <button
                 class="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                 on:click={addArea}
                 aria-label={dict.newArea || 'Add Area'}
                 title={dict.newArea || 'Add Area'}
              >
                  <Plus size={14} />
              </button>
          </div>
          <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {#each $gridStore.areas as area (area.id)}
                 <div class="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-800 group">
                     <div class="w-3 h-3 rounded-full shrink-0 shadow-sm" style="background-color: {area.color.startsWith('#') ? area.color : colorMap[area.color] || '#cbd5e1'}"></div>
                     <input
                       type="text"
                       value={area.name}
                       on:change={(e) => updateAreaName(area.id, e.currentTarget.value)}
                       class="flex-1 min-w-0 bg-transparent text-sm border-none p-0 focus:ring-0 text-slate-700 dark:text-slate-200"
                       aria-label="Area name"
                     />
                     <button
                       class="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                       on:click={() => gridStore.removeArea(area.id)}
                       aria-label={dict.remove}
                     >
                        <Trash2 size={14} />
                     </button>
                 </div>
              {/each}
              {#if $gridStore.areas.length === 0}
                  <div class="text-sm text-slate-400 italic text-center py-4">
                      No areas defined. Draw on the grid or click + to add.
                  </div>
              {/if}
          </div>
      </div>

  {:else if activeTab === 'templates'}
      <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
              {#each Object.entries(templates) as [key, state]}
                  <button
                      class="p-2 text-left bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group"
                      on:click={() => loadTemplate(key)}
                  >
                      <div class="aspect-[4/3] bg-slate-50 dark:bg-slate-900 rounded mb-2 overflow-hidden border border-slate-100 dark:border-slate-800">
                          <TemplatePreview {state} />
                      </div>
                      <span class="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {key.replace(/-/g, ' ')}
                      </span>
                  </button>
              {/each}
          </div>
      </div>
  {:else if activeTab === 'history'}
      <HistoryPanel {dict} />
  {/if}
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
