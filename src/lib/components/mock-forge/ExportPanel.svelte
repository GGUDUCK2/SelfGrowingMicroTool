<script lang="ts">
  import { Download, FileJson, FileCode, FileSpreadsheet, Database } from '@lucide/svelte';
  import type { GeneratorOptions } from '$lib/utils/mock-forge/types';

  export let options: GeneratorOptions;
  export let dictionary: Record<string, any>;
  export let onExport: (format: GeneratorOptions['format']) => void;
</script>

<div class="space-y-4">
  <div class="grid grid-cols-2 gap-4">
    <div class="space-y-1">
      <label for="rows-select" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{dictionary.rows}</label>
      <select id="rows-select" bind:value={options.rows} class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[44px]">
        <option value={10}>10</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
        <option value={500}>500</option>
        <option value={1000}>1,000</option>
        <option value={5000}>5,000</option>
      </select>
    </div>

    <div class="space-y-1">
      <label for="locale-select" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{dictionary.locale}</label>
      <select id="locale-select" bind:value={options.locale} class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[44px]">
        <option value="en">English (US)</option>
        <option value="ko">한국어 (Korean)</option>
      </select>
    </div>
  </div>

  <div class="space-y-2 pt-2">
    <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{dictionary.export}</h4>
    <div class="grid grid-cols-2 gap-2">
      <button
        on:click={() => onExport('json')}
        class="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-sm font-medium min-h-[44px] min-w-[44px]"
      >
        <FileJson size={18} />
        {dictionary.formats.json}
      </button>
      <button
        on:click={() => onExport('csv')}
        class="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-all text-sm font-medium min-h-[44px] min-w-[44px]"
      >
        <FileSpreadsheet size={18} />
        {dictionary.formats.csv}
      </button>
      <button
        on:click={() => onExport('sql')}
        class="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm font-medium min-h-[44px] min-w-[44px]"
      >
        <Database size={18} />
        {dictionary.formats.sql}
      </button>
      <button
        on:click={() => onExport('xml')}
        class="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all text-sm font-medium min-h-[44px] min-w-[44px]"
      >
        <FileCode size={18} />
        {dictionary.formats.xml}
      </button>
    </div>
  </div>
</div>
