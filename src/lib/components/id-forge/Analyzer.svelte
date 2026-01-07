<script lang="ts">
  import { analyzeId, type IdAnalysis } from '$lib/utils/id-forge/id-forge';

  let input = '';
  let result: IdAnalysis | null = null;

  function analyze() {
    if (!input) {
        result = null;
        return;
    }
    result = analyzeId(input);
  }
</script>

<div class="space-y-6">
  <div class="relative">
    <input
      type="text"
      bind:value={input}
      on:input={analyze}
      placeholder="Paste UUID, ULID, or any ID here..."
      class="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-mono text-center shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
    />
    <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
    </div>
  </div>

  {#if result}
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 class="text-sm font-semibold text-slate-500 uppercase mb-1">Type</h3>
                <div class="flex items-center space-x-2">
                    {#if result.isValid}
                        <span class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-bold">{result.type}</span>
                        {#if result.version}
                            <span class="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full text-sm font-bold">v{result.version}</span>
                        {/if}
                    {:else}
                        <span class="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-bold">Invalid / Unknown</span>
                    {/if}
                </div>
            </div>

            {#if result.timestamp}
                <div>
                    <h3 class="text-sm font-semibold text-slate-500 uppercase mb-1">Embedded Timestamp</h3>
                    <p class="text-lg font-medium text-slate-900 dark:text-slate-100">{result.timestamp.toLocaleString()}</p>
                    <p class="text-xs text-slate-500">{result.timestamp.toISOString()}</p>
                </div>
            {/if}

            <div class="md:col-span-2">
                <h3 class="text-sm font-semibold text-slate-500 uppercase mb-1">Details</h3>
                <p class="text-slate-700 dark:text-slate-300">{result.details}</p>
            </div>
        </div>
    </div>
  {/if}
</div>
