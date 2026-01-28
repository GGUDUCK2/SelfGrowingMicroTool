<script lang="ts">
  import type { QueryResult } from '$lib/utils/sql-forge/engine';
  import { Download } from 'lucide-svelte';

  export let result: QueryResult | null = null;
  export let t: any;

  function exportCsv() {
      if (!result || !result.data.length) return;
      const headers = result.columns.join(',');
      const rows = result.data.map(row => result!.columns.map(col => {
          const val = row[col];
          if (typeof val === 'string' && (val.includes(',') || val.includes('\n'))) {
              return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
      }).join(',')).join('\n');

      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'query_result.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }
</script>

<div class="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    {#if !result}
        <div class="h-full flex flex-col items-center justify-center text-gray-400 p-8">
            <p>{t.output}</p>
        </div>
    {:else if result.error}
        <div class="h-full p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 font-mono text-sm overflow-auto">
            <strong>{t.error}:</strong>
            <pre class="mt-2 whitespace-pre-wrap">{result.error}</pre>
        </div>
    {:else if result.data.length === 0}
        <div class="h-full flex flex-col items-center justify-center text-gray-400 p-8">
            <p>{t.success} ({result.time.toFixed(2)}ms)</p>
            <p class="text-sm">0 {t.rows}</p>
        </div>
    {:else}
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div class="text-xs text-gray-500">
                {result.data.length} {t.rows} • {result.time.toFixed(2)}ms
            </div>
            <button class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 transition-colors" title={t.export} on:click={exportCsv}>
                <Download size={16} />
            </button>
        </div>
        <div class="flex-1 overflow-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
                    <tr>
                        {#each result.columns as col}
                            <th class="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">{col}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    {#each result.data as row}
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            {#each result.columns as col}
                                <td class="px-4 py-2 text-gray-700 dark:text-gray-300 max-w-xs truncate" title={String(row[col])}>
                                    {typeof row[col] === 'object' ? JSON.stringify(row[col]) : row[col]}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
