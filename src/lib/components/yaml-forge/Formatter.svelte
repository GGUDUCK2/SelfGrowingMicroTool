<script lang="ts">
  import yaml from 'js-yaml';
  import { saveToHistory, type YamlForgeHistoryItem } from '$lib/db/yaml-forge';
  import { Copy, Download, Trash2, Check, AlertCircle, Play } from '@lucide/svelte';
  import { fade } from 'svelte/transition';

  export let dict: Record<string, unknown>;
  export let refreshHistory: () => void;
  export let restoredData: YamlForgeHistoryItem | null = null;

  let input = '';
  let output = '';
  let errorMsg = '';
  let indent = 2;
  let isCopied = false;

  $: if (restoredData && restoredData.mode === 'format') {
    input = restoredData.input;
    output = restoredData.output;
    errorMsg = '';
    restoredData = null; // Clear
  }

  const format = () => {
    errorMsg = '';
    if (!input.trim()) {
      output = '';
      return;
    }

    try {
      const obj = yaml.load(input);
      output = yaml.dump(obj, { indent });

      saveToHistory({
        input,
        output,
        mode: 'format'
      }).then(() => {
        refreshHistory();
      });

    } catch (err: Error) {
      errorMsg = err.message || dict.converter.errorInvalidInput;
      output = '';
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      isCopied = true;
      setTimeout(() => isCopied = false, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const downloadFile = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearInput = () => {
    input = '';
    output = '';
    errorMsg = '';
  };
</script>

<div class="flex flex-col gap-6 w-full h-full">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-white">
        {dict.formatter.title}
      </h2>
      <select
        bind:value={indent}
        on:change={() => { if(input) format(); }}
        class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none min-h-[44px]"
      >
        <option value={2}>{dict.formatter.indent2}</option>
        <option value={4}>{dict.formatter.indent4}</option>
      </select>
    </div>

    <button
      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors min-h-[44px] flex items-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      on:click={format}
      disabled={!input.trim()}
    >
      <Play size={16} />
      {dict.formatter.format}
    </button>
  </div>

  <div class="flex flex-col md:flex-row gap-4 h-[500px]">
    <!-- Input -->
    <div class="flex-1 flex flex-col gap-2 relative">
      <textarea
        bind:value={input}
        placeholder={dict.formatter.inputPlaceholder}
        class="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
        spellcheck="false"
        on:keydown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            format();
          }
        }}
      ></textarea>
      {#if input}
        <button
          class="absolute top-2 right-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm"
          on:click={clearInput}
          title={dict.converter.clear}
          aria-label={dict.converter.clear}
        >
          <Trash2 size={16} />
        </button>
      {/if}
      {#if errorMsg}
        <div class="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm flex items-start gap-2 shadow-lg" transition:fade>
          <AlertCircle size={16} class="mt-0.5 shrink-0" />
          <span class="break-words font-mono text-xs">{errorMsg}</span>
        </div>
      {/if}
    </div>

    <!-- Output -->
    <div class="flex-1 flex flex-col gap-2 relative">
      <textarea
        value={output}
        readonly
        placeholder={dict.converter.outputPlaceholder}
        class="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-800 dark:text-slate-200 outline-none resize-none"
        spellcheck="false"
      ></textarea>

      <div class="absolute top-2 right-2 flex gap-2">
        <button
          class="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-colors bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          on:click={copyToClipboard}
          title={dict.converter.copy}
          aria-label={dict.converter.copy}
          disabled={!output}
        >
          {#if isCopied}
            <Check size={16} class="text-emerald-500" />
          {:else}
            <Copy size={16} />
          {/if}
        </button>
        <button
          class="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg transition-colors bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          on:click={downloadFile}
          title={dict.converter.download}
          aria-label={dict.converter.download}
          disabled={!output}
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  </div>
</div>
