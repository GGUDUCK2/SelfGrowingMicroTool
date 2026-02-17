<script lang="ts">
  import { getContrast } from './color-utils';
  import type { ColorData, ColorMasterDictionary } from '$lib/types/color-master';

  export let colors: ColorData[];
  export let t: ColorMasterDictionary;

  function getRating(ratio: number) {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'AA+'; // Large text
    return 'Fail';
  }

  function getRatingColor(rating: string) {
    switch (rating) {
      case 'AAA': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'AA': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'AA+': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
  <div class="flex flex-wrap items-center justify-between mb-4 gap-4">
    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{t.contrastGrid.title || 'Contrast Grid'}</h3>
    <div class="flex flex-wrap gap-2 text-[10px] font-bold">
      <span class="px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">AAA</span>
      <span class="px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">AA</span>
      <span class="px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">AA+</span>
      <span class="px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Fail</span>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="w-full text-center border-collapse">
      <thead>
        <tr>
          <th class="sticky left-0 z-20 p-2 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"></th>
          {#each colors as color}
            <th class="p-2 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-w-[60px]">
              <div class="w-6 h-6 rounded-full mx-auto border border-slate-200 dark:border-slate-600" style="background-color: {color.hex}"></div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each colors as rowColor}
          <tr>
            <th class="sticky left-0 z-10 p-2 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <div class="w-6 h-6 rounded-full mx-auto border border-slate-200 dark:border-slate-600" style="background-color: {rowColor.hex}"></div>
            </th>
            {#each colors as colColor}
              {@const ratio = getContrast(rowColor.hex, colColor.hex)}
              {@const rating = getRating(ratio)}
              <td class="p-2 border border-slate-100 dark:border-slate-700">
                <div class="flex flex-col items-center">
                  <span class="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">{ratio.toFixed(1)}</span>
                  {#if rowColor.hex !== colColor.hex}
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full font-bold {getRatingColor(rating)}">{rating}</span>
                  {/if}
                </div>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
