<script lang="ts">
  import type { TableData } from '$lib/utils/table-forge/engine';
  import { Plus, Trash2 } from 'lucide-svelte';

  export let data: TableData = [['']];

  // Ensure data is never empty
  $: if (!data || data.length === 0) data = [['']];

  function addRow() {
      const cols = data[0]?.length || 1;
      data = [...data, Array(cols).fill('')];
  }

  function addCol() {
      data = data.map(row => [...row, '']);
  }

  function removeRow(index: number) {
      if (data.length <= 1) return;
      data = data.filter((_, i) => i !== index);
  }

  function removeCol(index: number) {
      if (data[0].length <= 1) return;
      data = data.map(row => row.filter((_, i) => i !== index));
  }
</script>

<div class="h-full w-full overflow-auto bg-slate-50 dark:bg-slate-900/50 p-4 relative">
  <div class="inline-block min-w-full align-top">
    <div class="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm inline-block min-w-[300px]">
      <table class="border-collapse table-fixed">
        <thead>
            <tr>
                <th class="p-1 w-10 bg-slate-100 dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-700 sticky left-0 z-20"></th>
                {#each data[0] as _, colIndex}
                    <th class="p-1 bg-slate-100 dark:bg-slate-900 border-b border-r border-slate-200 dark:border-slate-700 w-[150px] relative group">
                        <div class="flex justify-between items-center px-2">
                            <span class="text-xs text-slate-500 font-mono font-bold">{String.fromCharCode(65 + (colIndex % 26))}</span>
                            <button class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center" on:click={() => removeCol(colIndex)} title="Remove Column">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </th>
                {/each}
                <th class="p-1 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 w-10 sticky right-0 z-20">
                    <button class="w-full h-full min-h-[44px] flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors rounded" on:click={addCol} title="Add Column">
                        <Plus size={16} />
                    </button>
                </th>
            </tr>
        </thead>
        <tbody>
            {#each data as row, rowIndex}
                <tr class="group">
                    <td class="p-1 bg-slate-100 dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-700 text-center sticky left-0 z-10 w-10">
                        <div class="flex flex-col items-center justify-center h-full min-h-[44px]">
                            <span class="text-xs text-slate-400 mb-1">{rowIndex + 1}</span>
                            <button class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5 rounded transition-opacity min-h-[30px] min-w-[30px] flex items-center justify-center" on:click={() => removeRow(rowIndex)} title="Remove Row">
                                <Trash2 size={10} />
                            </button>
                        </div>
                    </td>
                    {#each row as _, colIndex}
                        <td class="border-r border-b border-slate-200 dark:border-slate-700 p-0 relative">
                            <input
                                type="text"
                                bind:value={data[rowIndex][colIndex]}
                                class="w-full h-full px-3 py-2 bg-transparent border-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset text-sm text-slate-800 dark:text-slate-200 min-w-[150px] outline-none"
                            />
                        </td>
                    {/each}
                    <td class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700"></td>
                </tr>
            {/each}
            <tr>
                <td class="p-1 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 sticky left-0 z-10">
                     <button class="w-full min-h-[44px] flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors rounded" on:click={addRow} title="Add Row">
                        <Plus size={16} />
                    </button>
                </td>
                <td colspan={data[0].length + 1} class="bg-slate-50 dark:bg-slate-900/50"></td>
            </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
