<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { db } from '$lib/db';
  import { browser } from '$app/environment';
  import DataEditor from '$lib/components/structura/DataEditor.svelte';
  import Toolbar from '$lib/components/structura/Toolbar.svelte';
  import SettingsPanel from '$lib/components/structura/SettingsPanel.svelte';
  import { convertData, detectFormat, type Format } from '$lib/utils/structura/converter';
  import { ArrowRight, Settings } from 'lucide-svelte';
  import { page } from '$app/stores';

  export let data;

  $: t = data.dict.tools.structura;

  // State
  let input = '';
  let output = '';
  let inputFormat: Format = 'json';
  let outputFormat: Format = 'yaml';
  let error = '';
  let showSettings = false;
  let indent = 2;
  let csvDelimiter = ',';
  let isConverting = false;

  // History
  let history: any[] = [];
  $: if (browser) {
    loadHistory();
  }

  async function loadHistory() {
    if (!browser) return;
    history = await db.structuraHistory.orderBy('createdAt').reverse().limit(10).toArray();
  }

  // React to input changes for auto-detection (simplified)
  let inputDebounceTimer: any;
  $: if (input && input.length < 5000) {
    clearTimeout(inputDebounceTimer);
    inputDebounceTimer = setTimeout(() => {
      const detected = detectFormat(input);
      if (detected !== inputFormat) {
        // "Smart Default" logic could go here
      }
    }, 500);
  }

  function runConversion() {
    isConverting = true;
    error = '';

    setTimeout(async () => {
      const result = convertData(input, inputFormat, outputFormat, { indent, csvDelimiter });
      if (result.error) {
        error = result.error;
        output = '';
      } else {
        output = result.data;
        if (input.trim().length > 0 && output.trim().length > 0) {
          await db.structuraHistory.add({
            inputFormat,
            outputFormat,
            inputPreview: input.substring(0, 100),
            createdAt: new Date(),
            starred: 0
          });
          loadHistory();
        }
      }
      isConverting = false;
    }, 50);
  }

  function handleCopy(text: string) {
    if (browser) {
      navigator.clipboard.writeText(text);
    }
  }

  function handleDownload(text: string, format: string) {
    if (!browser) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    input = '';
    output = '';
    error = '';
  }

  onMount(() => {
    // URL state loading if implemented
  });

  const formats: { value: Format; label: string }[] = [
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'xml', label: 'XML' },
    { value: 'csv', label: 'CSV' },
  ];
</script>

<svelte:head>
  <title>{t.title} | Web Factory</title>
  <meta name="description" content={t.description} />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
  <!-- Header -->
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 tracking-tight">
      Structura
    </h1>
    <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
      {t.description}
    </p>
  </div>

  <!-- Toolbar -->
  <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <div class="flex items-center gap-4 w-full md:w-auto">
      <div class="relative w-full md:w-48">
        <select
          bind:value={inputFormat}
          class="w-full pl-3 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
        >
          {#each formats as f}
            <option value={f.value}>{f.label}</option>
          {/each}
        </select>
      </div>

      <ArrowRight class="hidden md:block text-gray-400" size={20} />

      <div class="relative w-full md:w-48">
        <select
          bind:value={outputFormat}
          class="w-full pl-3 pr-10 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
        >
          {#each formats as f}
            <option value={f.value}>{f.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        on:click={runConversion}
      >
        <span>{t.convert}</span>
        {#if isConverting}
          <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        {/if}
      </button>

      <button
        class="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        on:click={() => showSettings = !showSettings}
        aria-label={t.settings}
      >
        <Settings size={20} />
      </button>
    </div>
  </div>

  {#if showSettings}
    <div transition:fade>
      <SettingsPanel
        bind:indent
        bind:csvDelimiter
        labels={{
          title: t.settings,
          indent: t.indent,
          delimiter: t.delimiter,
          options: t.options
        }}
      />
    </div>
  {/if}

  <!-- Editor Area -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
    <!-- Input -->
    <div class="flex flex-col gap-2 h-full">
      <div class="flex justify-between items-center px-1">
        <span class="text-sm font-medium text-gray-500 uppercase tracking-wider">{t.input}</span>
        <Toolbar
          showDownload={false}
          on:copy={() => handleCopy(input)}
          on:clear={handleClear}
          labels={{ copy: t.copy, download: t.download, clear: t.clear }}
        />
      </div>
      <div class="flex-1 min-h-0 shadow-lg rounded-lg overflow-hidden">
        <DataEditor bind:value={input} language={inputFormat} placeholder={t.inputPlaceholder} />
      </div>
    </div>

    <!-- Output -->
    <div class="flex flex-col gap-2 h-full">
      <div class="flex justify-between items-center px-1">
        <span class="text-sm font-medium text-gray-500 uppercase tracking-wider">{t.output}</span>
        <Toolbar
          showClear={false}
          on:copy={() => handleCopy(output)}
          on:download={() => handleDownload(output, outputFormat)}
          labels={{ copy: t.copy, download: t.download, clear: t.clear }}
        />
      </div>
      <div class="flex-1 min-h-0 shadow-lg rounded-lg overflow-hidden relative">
        <DataEditor bind:value={output} language={outputFormat} readonly={true} placeholder={t.outputPlaceholder} />

        {#if error}
          <div class="absolute inset-x-0 bottom-0 p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/50 backdrop-blur-sm" transition:fly={{ y: 20 }}>
            <div class="flex items-start gap-2 text-red-600 dark:text-red-400">
              <span class="font-bold text-sm">{t.error}:</span>
              <span class="text-sm font-mono">{error}</span>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- History -->
  {#if history.length > 0}
    <div class="mt-12 space-y-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{t.history}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each history as item}
          <button
            class="text-left p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group"
            on:click={() => {
              // Restore functionality could be added here
            }}
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2 text-xs font-mono text-gray-500">
                <span class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{item.inputFormat}</span>
                <ArrowRight size={12} />
                <span class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">{item.outputFormat}</span>
              </div>
              <span class="text-xs text-gray-400">{new Date(item.createdAt).toLocaleTimeString()}</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 font-mono truncate">
              {item.inputPreview}
            </p>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Documentation -->
  <article class="prose dark:prose-invert max-w-none mt-20 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
    <h2>{t.guide.title}</h2>
    <p>
      {t.guide.intro}
    </p>

    <h3>{t.guide.featuresTitle}</h3>
    <ul>
      <li><span class="markdown-body">{@html t.guide.f1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
      <li><span class="markdown-body">{@html t.guide.f2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
      <li><span class="markdown-body">{@html t.guide.f3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
      <li><span class="markdown-body">{@html t.guide.f4.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
    </ul>

    <h3>{t.guide.tipsTitle}</h3>
    <ul>
      <li><span class="markdown-body">{@html t.guide.tip1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
      <li><span class="markdown-body">{@html t.guide.tip2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
      <li><span class="markdown-body">{@html t.guide.tip3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
    </ul>

    <h3>{t.faqTitle}</h3>
    <div class="space-y-4">
      <div>
        <h4 class="font-bold">{t.q1}</h4>
        <p>{t.a1}</p>
      </div>
      <div>
        <h4 class="font-bold">{t.q2}</h4>
        <p>{t.a2}</p>
      </div>
      <div>
        <h4 class="font-bold">{t.q3}</h4>
        <p>{t.a3}</p>
      </div>
    </div>
  </article>
</div>
