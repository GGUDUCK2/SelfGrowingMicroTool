<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Plus, Trash2, Download } from 'lucide-svelte';

  export let data: any[][] = [];
  export let dict: any;

  const dispatch = createEventDispatcher();

  function addRow() {
    const newRow = new Array(data[0]?.length || 1).fill('');
    data = [...data, newRow];
    dispatch('change', data);
  }

  function addColumn() {
    data = data.map(row => [...row, '']);
    dispatch('change', data);
  }

  function removeRow(index: number) {
    data = data.filter((_, i) => i !== index);
    dispatch('change', data);
  }

  function removeColumn(index: number) {
    data = data.map(row => row.filter((_, i) => i !== index));
    dispatch('change', data);
  }

  function updateCell(rowIndex: number, colIndex: number, event: Event) {
    const input = event.target as HTMLInputElement;
    data[rowIndex][colIndex] = input.value;
    dispatch('change', data);
  }

  function handleDownload() {
    dispatch('download');
  }
</script>

<div class="space-y-4">
  <div class="flex flex-wrap gap-2 justify-between items-center mb-4">
    <div class="flex gap-2">
      <button
        class="flex items-center space-x-2 px-3 py-2 min-h-[44px] bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        on:click={addRow}
      >
        <Plus size={16} />
        <span class="text-sm font-medium">{dict.editor.addRow}</span>
      </button>
      <button
        class="flex items-center space-x-2 px-3 py-2 min-h-[44px] bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        on:click={addColumn}
      >
        <Plus size={16} />
        <span class="text-sm font-medium">{dict.editor.addColumn}</span>
      </button>
    </div>
    <div class="flex gap-2">
      <button
        class="flex items-center space-x-2 px-3 py-2 min-h-[44px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        on:click={() => dispatch('clear')}
      >
        <Trash2 size={16} />
        <span class="text-sm font-medium">{dict.editor.clear}</span>
      </button>
      <button
        class="flex items-center space-x-2 px-4 py-2 min-h-[44px] bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        on:click={handleDownload}
      >
        <Download size={16} />
        <span class="text-sm font-medium">{dict.editor.download}</span>
      </button>
    </div>
  </div>

  <div class="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
    {#if data.length > 0}
      <table class="w-full text-sm text-left whitespace-nowrap">
        <thead class="text-xs text-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            <th class="px-4 py-3 font-medium bg-slate-100 dark:bg-slate-900 w-10"></th>
            {#each data[0] as _, colIndex}
              <th class="px-4 py-3 font-medium border-l border-slate-200 dark:border-slate-700 relative group">
                {colIndex + 1}
                <button
                  class="absolute top-1/2 right-1 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
                  on:click={() => removeColumn(colIndex)}
                  title="Remove Column"
                  aria-label="Remove Column"
                >
                  <Trash2 size={14} />
                </button>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each data as row, rowIndex}
            <tr class="bg-white border-b dark:bg-slate-900 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 group/row">
              <td class="px-4 py-3 bg-slate-50 dark:bg-slate-800 text-center relative font-medium w-10">
                <span class="group-hover/row:opacity-0 transition-opacity">{rowIndex + 1}</span>
                <button
                  class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/row:opacity-100 text-red-500 hover:text-red-700 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
                  on:click={() => removeRow(rowIndex)}
                  title="Remove Row"
                  aria-label="Remove Row"
                >
                  <Trash2 size={14} />
                </button>
              </td>
              {#each row as cell, colIndex}
                <td class="border-l border-slate-200 dark:border-slate-700 p-0 relative">
                  <input
                    type="text"
                    value={cell}
                    class="w-full min-h-[44px] px-4 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                    on:blur={(e) => updateCell(rowIndex, colIndex, e)}
                    aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
                  />
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="py-12 text-center text-slate-500 dark:text-slate-400">
        Empty CSV Data
      </div>
    {/if}
  </div>
</div>
