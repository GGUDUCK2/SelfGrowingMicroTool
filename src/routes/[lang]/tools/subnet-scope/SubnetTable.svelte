<script lang="ts">
  import type { SubnetResult } from '$lib/utils/subnet-scope/calculator';
  import { slide, fade } from 'svelte/transition';
  import { browser } from '$app/environment';
  import type { dictionaries } from '$lib/dictionaries';

  export let subnets: SubnetResult[] = [];
  export let dict: any;
  export let commonDict: any;

  let toast: string | null = null;
  let toastTimeout: any;

  function showToast(msg: string) {
      if (toastTimeout) clearTimeout(toastTimeout);
      toast = msg;
      toastTimeout = setTimeout(() => toast = null, 2000);
  }

  function copy(text: string) {
      navigator.clipboard.writeText(text);
      showToast(dict.copied || 'Copied!');
  }

  function downloadCSV() {
      if (!subnets.length) return;
      const csv = ['Network,Range', ...subnets.map(s => `${s.network},"${s.range}"`)].join('\n');
      downloadFile(csv, 'subnets.csv', 'text/csv');
  }

  function downloadJSON() {
      if (!subnets.length) return;
      const json = JSON.stringify(subnets, null, 2);
      downloadFile(json, 'subnets.json', 'application/json');
  }

  function downloadFile(content: string, filename: string, type: string) {
      if (!browser) return;
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast(dict.downloaded || 'Downloaded!');
  }
</script>

{#if toast}
<div class="fixed bottom-6 right-6 z-50 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-lg text-sm font-medium animate-bounce" in:fade>
    {toast}
</div>
{/if}

{#if subnets.length > 0}
  <div class="space-y-4" transition:slide>
    <div class="flex justify-end gap-2">
        <button on:click={downloadCSV} aria-label="Export CSV" class="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            {dict.exportCSV || 'Export CSV'}
        </button>
        <button on:click={downloadJSON} aria-label="Export JSON" class="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            {dict.exportJSON || 'Export JSON'}
        </button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium">
          <tr>
            <th class="px-4 py-3">#</th>
            <th class="px-4 py-3">{dict.network}</th>
            <th class="px-4 py-3">{dict.range}</th>
            <th class="px-4 py-3 text-right">{commonDict.actions || 'Actions'}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
          {#each subnets as subnet, i}
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="px-4 py-3 text-slate-500">{i + 1}</td>
              <td class="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">{subnet.network}</td>
              <td class="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{subnet.range}</td>
              <td class="px-4 py-3 text-right">
                <button
                  class="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                  on:click={() => copy(subnet.network)}
                >
                  Copy
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{:else}
  <div class="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
    No subnets generated. Check the mask size.
  </div>
{/if}
