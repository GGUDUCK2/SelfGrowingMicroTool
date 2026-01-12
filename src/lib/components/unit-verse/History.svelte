<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, toggleFavorite, clearHistory, type ConversionRecord } from '$lib/db/unit-verse';
  import { Star, Trash2, RotateCcw, Download } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import Papa from 'papaparse';

  export let t: any;
  const dispatch = createEventDispatcher();

  let history = liveQuery(async () => {
    // Get favorites first, then recent history
    const favorites = await db.history.where('isFavorite').equals(1).reverse().sortBy('timestamp');
    const recent = await db.history.where('isFavorite').equals(0).reverse().limit(20).sortBy('timestamp');
    return [...favorites, ...recent];
  });

  function restore(record: ConversionRecord) {
      dispatch('restore', record);
  }

  function formatValue(val: number) {
      if (Math.abs(val) < 1e-6 && val !== 0) return val.toExponential(4);
      return parseFloat(val.toFixed(6));
  }

  async function exportHistory() {
      if (!$history || $history.length === 0) return;

      const data = $history.map(item => ({
          Category: item.categoryId,
          From_Value: item.fromValue,
          From_Unit: item.fromUnitId,
          To_Value: item.resultValue,
          To_Unit: item.toUnitId,
          Date: new Date(item.timestamp).toISOString(),
          Favorite: item.isFavorite ? 'Yes' : 'No'
      }));

      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `unit_verse_history_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }
</script>

<div class="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden flex flex-col h-full">
  <div class="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
    <h3 class="text-lg font-semibold text-white flex items-center">
      <RotateCcw size={18} class="mr-2 text-indigo-400" />
      {t.history}
    </h3>

    <div class="flex items-center space-x-1">
        {#if $history && $history.length > 0}
            <button
                on:click={exportHistory}
                class="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded transition-colors"
                title={t.export || "Export CSV"}
                aria-label={t.export || "Export CSV"}
            >
                <Download size={14} />
            </button>
        {/if}
        <button
          on:click={clearHistory}
          class="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center px-2 py-1 rounded hover:bg-red-900/20"
          aria-label={t.clear}
        >
          <Trash2 size={12} class="mr-1" />
          {t.clear}
        </button>
    </div>
  </div>

  <div class="overflow-y-auto flex-1 max-h-[400px] p-2 space-y-2 custom-scrollbar">
    {#if $history && $history.length > 0}
      {#each $history as item (item.id)}
        <div
          transition:slide|local={{ duration: 200 }}
          class="bg-slate-900/50 hover:bg-slate-700 border border-slate-700/50 hover:border-indigo-500/50 rounded-lg p-3 transition-all group relative"
        >
          <div class="flex justify-between items-start mb-1">
             <span class="text-xs uppercase font-bold text-slate-500 tracking-wider">
                 {item.categoryId}
             </span>
             <button
                on:click={() => toggleFavorite(item.id!)}
                class="text-slate-600 hover:text-yellow-400 transition-colors"
                aria-label="Toggle Favorite"
             >
                <Star size={14} fill={item.isFavorite ? "currentColor" : "none"} class={item.isFavorite ? "text-yellow-400" : ""} />
             </button>
          </div>

          <button
            class="w-full text-left"
            on:click={() => restore(item)}
            aria-label="Restore conversion"
          >
              <div class="flex items-center space-x-2 text-sm">
                  <span class="text-white font-mono">{formatValue(item.fromValue)} {item.fromUnitId}</span>
                  <span class="text-slate-500">→</span>
                  <span class="text-indigo-300 font-mono font-bold">{formatValue(item.resultValue)} {item.toUnitId}</span>
              </div>
          </button>
        </div>
      {/each}
    {:else}
      <div class="text-center py-10 text-slate-500 text-sm">
        {t.guide.noHistory || "No recent history"}
      </div>
    {/if}
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
    background-color: #475569;
    border-radius: 20px;
  }
</style>
