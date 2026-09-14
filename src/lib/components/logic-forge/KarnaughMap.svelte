<script lang="ts">
  import type { KarnaughMapData } from '$lib/types/logic-forge';

  export let data: KarnaughMapData | null = null;
</script>

{#if data}
  <div class="overflow-x-auto p-4 flex flex-col items-center">
    <div class="inline-block relative">
      <!-- Diagonal Split Label -->
      <div class="absolute -top-8 -left-8 w-16 h-16 border-b border-r border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex items-center justify-center z-10 rounded-tl-lg">
         <span class="absolute bottom-1 left-2 text-xs font-bold text-slate-500 dark:text-slate-400">{data.variables.slice(0, Math.floor(data.variables.length / 2)).join('')}</span>
         <span class="absolute top-1 right-2 text-xs font-bold text-slate-500 dark:text-slate-400">{data.variables.slice(Math.floor(data.variables.length / 2)).join('')}</span>
         <div class="absolute inset-0 border-b border-slate-300 dark:border-slate-600 transform rotate-45 origin-bottom-left w-[141%]"></div>
      </div>

      <table class="border-collapse">
        <thead>
          <tr>
            <th class="w-12 h-12"></th> <!-- Corner placeholder -->
            {#each data.colLabels as label}
              <th class="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 min-w-[3rem] text-center font-mono text-sm text-slate-600 dark:text-slate-400">
                {label}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each data.rowLabels as rowLabel, rIdx}
            <tr>
              <th class="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 w-12 text-center font-mono text-sm text-slate-600 dark:text-slate-400">
                {rowLabel}
              </th>
              {#each data.grid[rIdx] as cell, cIdx}
                <td class="border border-slate-200 dark:border-slate-700 text-center p-0 relative w-12 h-12">
                  <div class="w-full h-full flex items-center justify-center font-bold text-lg {cell ? 'bg-indigo-50 text-indigo-700' : 'bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-600'} transition-colors hover:bg-indigo-100">
                    {cell ? '1' : '0'}
                  </div>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="mt-4 text-xs text-slate-500 dark:text-slate-400">
       * Gray Code ordering is used for adjacent cells.
    </div>
  </div>
{:else}
  <div class="text-center py-10 text-slate-400 dark:text-slate-500">
    No K-Map data available.
  </div>
{/if}
