<script lang="ts">
  import { FileText, AlignLeft, AlertCircle } from '@lucide/svelte';

  export let data: any[][] = [];
  export let dict: any;

  let rowCount = 0;
  let colCount = 0;
  let emptyCells = 0;
  let columnStats: { name: string; emptyCount: number; type: string }[] = [];

  $: if (data) {
    analyzeData();
  }

  function analyzeData() {
    if (!data || data.length === 0) {
      rowCount = 0;
      colCount = 0;
      emptyCells = 0;
      columnStats = [];
      return;
    }

    rowCount = data.length - 1; // Exclude header
    colCount = data[0].length;
    emptyCells = 0;
    columnStats = [];

    const headers = data[0];
    const rows = data.slice(1);

    headers.forEach((header, colIndex) => {
      let emptyCount = 0;
      let hasNumbers = false;
      let hasStrings = false;

      rows.forEach(row => {
        const cell = row[colIndex];
        if (cell === '' || cell === null || cell === undefined) {
          emptyCount++;
          emptyCells++;
        } else {
          if (!isNaN(Number(cell))) {
            hasNumbers = true;
          } else {
            hasStrings = true;
          }
        }
      });

      let type = 'Mixed';
      if (hasNumbers && !hasStrings) type = 'Numeric';
      if (!hasNumbers && hasStrings) type = 'String';
      if (!hasNumbers && !hasStrings && emptyCount === rows.length) type = 'Empty';

      columnStats.push({
        name: header || `Column ${colIndex + 1}`,
        emptyCount,
        type
      });
    });
  }
</script>

<div class="space-y-8">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800/50 flex flex-col items-center justify-center text-center">
      <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
        <AlignLeft size={24} />
      </div>
      <div class="text-3xl font-bold text-slate-900 dark:text-white mb-1">{rowCount}</div>
      <div class="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{dict.analyzer.rowCount}</div>
    </div>

    <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center justify-center text-center">
      <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
        <FileText size={24} />
      </div>
      <div class="text-3xl font-bold text-slate-900 dark:text-white mb-1">{colCount}</div>
      <div class="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{dict.analyzer.columnCount}</div>
    </div>

    <div class="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-6 border border-rose-100 dark:border-rose-800/50 flex flex-col items-center justify-center text-center">
      <div class="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
        <AlertCircle size={24} />
      </div>
      <div class="text-3xl font-bold text-slate-900 dark:text-white mb-1">{emptyCells}</div>
      <div class="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{dict.analyzer.emptyCells}</div>
    </div>
  </div>

  {#if columnStats.length > 0}
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          {dict.analyzer.columnStats}
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 uppercase">
            <tr>
              <th class="px-6 py-3 font-semibold">Column Name</th>
              <th class="px-6 py-3 font-semibold">Inferred Type</th>
              <th class="px-6 py-3 font-semibold">Empty Values</th>
              <th class="px-6 py-3 font-semibold">Completeness</th>
            </tr>
          </thead>
          <tbody>
            {#each columnStats as stat}
              <tr class="bg-white border-b dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">
                  {stat.name}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {stat.type}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-400">
                  <span class={stat.emptyCount > 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
                    {stat.emptyCount}
                  </span>
                </td>
                <td class="px-6 py-4 w-48">
                  <div class="flex items-center gap-3">
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        class="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style="width: {((rowCount - stat.emptyCount) / rowCount) * 100}%"
                      ></div>
                    </div>
                    <span class="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {Math.round(((rowCount - stat.emptyCount) / rowCount) * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {:else}
    <div class="py-12 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
      Load CSV data to see analysis
    </div>
  {/if}
</div>
