<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { FileUp, Save, Copy, Download, ArrowRightLeft, AlignLeft, Grid } from 'lucide-svelte';
  import type { OutputFormat } from '$lib/utils/table-forge/engine';

  export let dict: any;
  export let outputFormat: OutputFormat = 'markdown';
  export let isCompact = false;
  export let isPretty = true;

  const dispatch = createEventDispatcher();

  const formats: OutputFormat[] = ['markdown', 'csv', 'json', 'html', 'sql', 'latex', 'ascii'];
</script>

<div class="flex items-center gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap p-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
  <!-- Format Selector -->
  <div class="flex items-center gap-2 mr-4">
    <label for="format-selector" class="text-sm font-medium text-slate-600 dark:text-slate-400">{dict.format}:</label>
    <select
      id="format-selector"
      bind:value={outputFormat}
      on:change={() => dispatch('change-format', outputFormat)}
      class="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 min-h-[44px]"
    >
      {#each formats as fmt}
        <option value={fmt}>{dict.formats[fmt]}</option>
      {/each}
    </select>
  </div>

  <!-- Options -->
  <div class="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4 mr-4">
    {#if outputFormat === 'markdown' || outputFormat === 'json'}
      <button
        class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 {isCompact ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : ''} min-h-[44px] min-w-[44px] flex items-center justify-center"
        on:click={() => { isCompact = !isCompact; dispatch('option-change'); }}
        title={dict.compact}
      >
        <AlignLeft size={18} />
      </button>
    {/if}

    {#if outputFormat === 'html' || outputFormat === 'json'}
      <button
        class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 {isPretty ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : ''} min-h-[44px] min-w-[44px] flex items-center justify-center"
        on:click={() => { isPretty = !isPretty; dispatch('option-change'); }}
        title={dict.pretty}
      >
        <Grid size={18} />
      </button>
    {/if}

    <button
        class="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
        on:click={() => dispatch('transpose')}
        title={dict.transpose}
    >
        <ArrowRightLeft size={18} />
    </button>
  </div>

  <div class="flex-1"></div>

  <!-- Actions -->
  <div class="flex items-center gap-2">
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors min-h-[44px] min-w-[44px] justify-center"
      on:click={() => dispatch('copy')}
    >
      <Copy size={16} />
      <span class="hidden sm:inline">{dict.copy}</span>
    </button>

    <button
      class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors min-h-[44px] min-w-[44px] justify-center"
      on:click={() => dispatch('download')}
    >
      <Download size={16} />
      <span class="hidden sm:inline">{dict.download}</span>
    </button>

    <button
      class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-sm min-h-[44px] min-w-[44px] justify-center"
      on:click={() => dispatch('save')}
    >
      <Save size={16} />
      <span class="hidden sm:inline">{dict.save}</span>
    </button>
  </div>
</div>
