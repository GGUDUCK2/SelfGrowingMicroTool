<script lang="ts">
  import { xml2json, json2xml } from 'xml-js';
  import { saveToHistory, type XmlForgeHistoryItem } from '$lib/db/xml-forge';
  import { Copy, Download, Trash2, ArrowRightLeft, Check, AlertCircle } from '@lucide/svelte';
  import { fade } from 'svelte/transition';

  export let dict: any;
  export let refreshHistory: () => void;
  export let restoredData: XmlForgeHistoryItem | null = null;

  let input = '';
  let output = '';
  let errorMsg = '';
  let mode: 'xml-to-json' | 'json-to-xml' = 'xml-to-json';
  let isCopied = false;

  $: if (restoredData && restoredData.mode.includes('to')) {
    input = restoredData.input;
    output = restoredData.output;
    mode = restoredData.mode as "xml-to-json" | "json-to-xml";
    errorMsg = '';
    restoredData = null; // Clear after applying
  }

  const convert = () => {
    errorMsg = '';
    if (!input.trim()) {
      output = '';
      return;
    }

    try {
      if (mode === 'xml-to-json') {
        output = xml2json(input, { compact: true, spaces: 2 });
      } else {
        const obj = JSON.parse(input);
        output = json2xml(input, { compact: true, spaces: 2 });
      }

      saveToHistory({
        input,
        output,
        mode
      }).then(() => {
        refreshHistory();
      });

    } catch (err: any) {
      errorMsg = err.message || dict.converter.errorInvalidInput;
      output = '';
    }
  };

  const toggleMode = () => {
    mode = mode === 'xml-to-json' ? 'json-to-xml' : 'xml-to-json';
    if (!errorMsg && output) {
      input = output;
      convert();
    } else {
      input = '';
      output = '';
      errorMsg = '';
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
    const ext = mode === 'xml-to-json' ? 'json' : 'xml';
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${ext}`;
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
    <div class="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
      <button
        class="px-4 py-2 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-colors {mode === 'xml-to-json' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
        on:click={() => { mode = 'xml-to-json'; convert(); }}
      >
        {dict.converter.modeXmlToJson}
      </button>
      <button
        class="px-4 py-2 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-colors {mode === 'json-to-xml' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
        on:click={() => { mode = 'json-to-xml'; convert(); }}
      >
        {dict.converter.modeJsonToXml}
      </button>
    </div>

    <button
      class="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
      on:click={toggleMode}
      aria-label="Toggle Mode"
    >
      <ArrowRightLeft size={20} />
    </button>
  </div>

  <div class="flex flex-col md:flex-row gap-4 h-[500px]">
    <div class="flex-1 flex flex-col gap-2 relative">
      <textarea
        bind:value={input}
        on:input={convert}
        placeholder={dict.converter.inputPlaceholder}
        class="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
        spellcheck="false"
      ></textarea>
      {#if input}
        <button
          class="absolute top-2 right-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
