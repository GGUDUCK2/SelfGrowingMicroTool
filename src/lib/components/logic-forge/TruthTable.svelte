<script lang="ts">
  import type { TruthTableData } from '$lib/types/logic-forge';
  import { getDictionary } from '$lib/dictionaries';

  export let lang: string = 'en';
  export let data: TruthTableData | null = null;

  $: dict = getDictionary(lang).tools.logicForge;
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
  <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
    <h3 class="font-semibold text-gray-800 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table"><path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
      {dict.truthTable}
    </h3>
    {#if data}
      <span class="text-xs font-mono bg-gray-200 text-gray-600 px-2 py-1 rounded-md">
        {Math.pow(2, data.variables.length)} Rows
      </span>
    {/if}
  </div>

  <div class="flex-1 overflow-auto min-h-[300px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
  {#if data}
    <div class="inline-block min-w-full align-middle">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 sticky top-0 z-10">
          <tr>
            {#each data.variables as v}
              <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">{v}</th>
            {/each}
            <th scope="col" class="px-6 py-3 text-right text-xs font-bold text-indigo-600 uppercase tracking-wider">{dict.result}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each data.rows as row}
            <tr class="hover:bg-indigo-50/30 transition-colors">
              {#each row.values as val}
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono {val ? 'text-gray-900 font-semibold' : 'text-gray-400'}">
                  {val ? '1' : '0'}
                </td>
              {/each}
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium {row.result ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                  {row.result ? 'TRUE' : 'FALSE'}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="h-full flex flex-col items-center justify-center text-gray-400 p-8">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table-2 mb-4 opacity-50"><path d="M9 3H5a2 2 0 0 0-2 2v4h6z"/><path d="M9 21H5a2 2 0 0 1-2-2v-4h6z"/><path d="M21 3h-4v6h6V5a2 2 0 0 0-2-2z"/><path d="M21 21h-4v-6h6v4a2 2 0 0 0-2 2z"/><path d="M9 9h6v6H9z"/></svg>
      <p>Enter an expression to see the truth table</p>
    </div>
  {/if}
  </div>
</div>
