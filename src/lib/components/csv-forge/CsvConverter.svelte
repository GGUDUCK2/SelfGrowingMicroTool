<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { convertToJson, convertToHtmlTable, convertToSqlInsert } from '$lib/utils/csv-forge/parser';
  import { Copy, Check, FileJson, Table, Database } from '@lucide/svelte';

  export let data: any[][] = [];
  export let dict: any;

  let format: 'json' | 'sql' | 'html' = 'json';
  let tableName = 'users';
  let output = '';
  let copied = false;

  $: if (data || format || tableName) {
    updateOutput();
  }

  function updateOutput() {
    if (!data || data.length === 0) {
      output = '';
      return;
    }
    try {
      if (format === 'json') {
        output = convertToJson(data);
      } else if (format === 'html') {
        output = convertToHtmlTable(data);
      } else if (format === 'sql') {
        output = convertToSqlInsert(data, tableName);
      }
    } catch (e) {
      output = 'Error during conversion';
    }
  }

  async function copyToClipboard() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
    <div class="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
      <button
        class="flex items-center space-x-2 px-4 py-2 min-h-[44px] min-w-[44px] touch-manipulation rounded-md text-sm font-medium transition-all {format === 'json' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
        on:click={() => (format = 'json')}
      >
        <FileJson size={16} />
        <span>{dict.converter.json}</span>
      </button>
      <button
        class="flex items-center space-x-2 px-4 py-2 min-h-[44px] min-w-[44px] touch-manipulation rounded-md text-sm font-medium transition-all {format === 'sql' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
        on:click={() => (format = 'sql')}
      >
        <Database size={16} />
        <span>{dict.converter.sql}</span>
      </button>
      <button
        class="flex items-center space-x-2 px-4 py-2 min-h-[44px] min-w-[44px] touch-manipulation rounded-md text-sm font-medium transition-all {format === 'html' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
        on:click={() => (format = 'html')}
      >
        <Table size={16} />
        <span>{dict.converter.html}</span>
      </button>
    </div>

    {#if format === 'sql'}
      <div class="flex items-center space-x-2 w-full sm:w-auto">
        <label for="tableName" class="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
          {dict.converter.tableName}:
        </label>
        <input
          id="tableName"
          type="text"
          bind:value={tableName}
          class="flex-1 sm:w-48 px-3 py-2 bg-slate-50 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
          placeholder="users"
        />
      </div>
    {/if}
  </div>

  <div class="relative group">
    <div class="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        on:click={copyToClipboard}
        class="flex items-center space-x-2 p-2 min-h-[44px] min-w-[44px] justify-center bg-slate-900/80 hover:bg-slate-900 dark:bg-white/90 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg backdrop-blur-sm transition-all shadow-sm"
        aria-label={dict.converter.copyOutput}
        title={dict.converter.copyOutput}
      >
        {#if copied}
          <Check size={14} class="text-emerald-400 dark:text-emerald-600" />
          <span class="text-xs font-medium">{dict.copySuccess}</span>
        {:else}
          <Copy size={14} />
          <span class="text-xs font-medium">{dict.converter.copyOutput}</span>
        {/if}
      </button>
    </div>

    <pre class="w-full h-[500px] p-6 bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-300 font-mono text-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-auto whitespace-pre leading-relaxed shadow-inner"><code class="block">{output}</code></pre>
  </div>
</div>
