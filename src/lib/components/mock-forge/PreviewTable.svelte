<script lang="ts">
  export let data: any[] = [];
  export let loading = false;

  $: headers = data.length > 0 ? Object.keys(data[0]) : [];
</script>

<div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex flex-col h-full">
  {#if loading}
    <div class="p-12 flex items-center justify-center text-slate-400">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  {:else if data.length === 0}
    <div class="p-12 text-center text-slate-400">
      No data generated yet.
    </div>
  {:else}
    <div class="overflow-auto flex-1">
      <table class="w-full text-left text-sm whitespace-nowrap">
        <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0 z-10">
          <tr>
            <th class="px-4 py-3 font-semibold border-b border-slate-200 dark:border-slate-700 w-12 text-center">#</th>
            {#each headers as header}
              <th class="px-4 py-3 font-semibold border-b border-slate-200 dark:border-slate-700">{header}</th>
            {/each}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          {#each data as row, i}
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="px-4 py-2 text-slate-400 text-center text-xs">{i + 1}</td>
              {#each headers as header}
                <td class="px-4 py-2 text-slate-700 dark:text-slate-300 max-w-[300px] truncate" title={String(row[header])}>
                  {String(row[header])}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-4 py-2 text-xs text-slate-500 flex justify-between">
      <span>Showing {data.length} rows</span>
      <span>Preview Mode</span>
    </div>
  {/if}
</div>
