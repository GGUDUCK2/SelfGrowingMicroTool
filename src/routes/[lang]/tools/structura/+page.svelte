<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import { getDictionary } from "$lib/dictionaries";
  $: lang = $page.params.lang || 'en';
  import { page } from '$app/stores';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { browser } from '$app/environment';
  import DataEditor from '$lib/components/structura/DataEditor.svelte';
  import Toolbar from '$lib/components/structura/Toolbar.svelte';
  import SettingsPanel from '$lib/components/structura/SettingsPanel.svelte';
  import TreeVisualizer from '$lib/components/structura/visualizer/TreeVisualizer.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { convertData, detectFormat, type Format } from '$lib/utils/structura/converter';
  import { generateCode, type CodeGenLanguage } from '$lib/utils/structura/codegen';
  import { structuraExamples } from '$lib/utils/structura/examples';
  import { ArrowRight, Settings, Code, History, Zap, Star, Trash2, Network } from '@lucide/svelte';
  import { structuraWorkspace } from '$lib/db/workspace';
  import type { StructuraHistory } from '$lib/db';
  import { liveQuery, type Subscription } from 'dexie';


  $: t = (getDictionary($page.params.lang || "en") as any)?.tools.structura;

  $: faqItems = [
    { q: t?.q1, a: t?.a1 },
    { q: t?.q2, a: t?.a2 },
    { q: t?.q3, a: t?.a3 }
  ];

  // Tabs
  type Tab = 'convert' | 'codegen' | 'visualizer' | 'history';
  let activeTab: Tab = 'convert';

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

  // Code Gen State
  let codeGenLang: CodeGenLanguage = 'typescript';
  let rootName = 'Root';
  let generatedCode = '';

  // Visualizer State
  let visualizerData: any = null;

  // History
  let history: StructuraHistory[] = [];
  let historySubscription: Subscription;

  if (browser) {
    historySubscription = liveQuery(() => structuraWorkspace.loadHistory(20)).subscribe(val => {
      history = val;
    });
  }

  // React to input changes for auto-detection
  let inputDebounceTimer: ReturnType<typeof setTimeout>;
  $: if (input && input.length < 10000) {
    clearTimeout(inputDebounceTimer);
    inputDebounceTimer = setTimeout(() => {
      const detected = detectFormat(input);
      if (detected !== inputFormat && input.trim().length > 0) {
        inputFormat = detected;
      }

      // Auto-update code gen if active
      if (activeTab === 'codegen') {
        runCodeGen();
      }

      // Auto-update visualizer if active
      if (activeTab === 'visualizer') {
        runVisualizer();
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
          await structuraWorkspace.save({
            inputFormat,
            outputFormat,
            inputPreview: input.substring(0, 150),
          });
        }
      }
      isConverting = false;
    }, 50);
  }

  function runCodeGen() {
    if (!input.trim()) return;

    // First need to parse input to object
    const result = convertData(input, inputFormat, 'json', { indent: 2 });
    if (result.error) {
        error = result.error;
        return;
    }

    try {
        const jsonObj = JSON.parse(result.data);
        generatedCode = generateCode(jsonObj, codeGenLang, { name: rootName });
        error = '';
    } catch (e) {
        error = String(e);
    }
  }

  function runVisualizer() {
    if (!input.trim()) {
        visualizerData = null;
        return;
    }
    const result = convertData(input, inputFormat, 'json', { indent: 2 });
    if (result.error) {
        // Don't show error in visualizer, just clear or keep old
        return;
    }
    try {
        visualizerData = JSON.parse(result.data);
    } catch (e) {
        // ignore
    }
  }

  function loadExample(ex: typeof structuraExamples[0]) {
      input = ex.data;
      inputFormat = ex.format as Format;
      // Trigger conversion automatically
      setTimeout(runConversion, 100);
  }

  async function restoreHistory(item: StructuraHistory) {
      input = item.inputPreview;
      inputFormat = item.inputFormat as Format;
      outputFormat = item.outputFormat as Format;
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
    generatedCode = '';
    visualizerData = null;
  }

  // Keyboard Shortcuts
  function handleKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (activeTab === 'convert') runConversion();
          if (activeTab === 'codegen') runCodeGen();
          if (activeTab === 'visualizer') runVisualizer();
      }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    if (historySubscription) {
        historySubscription.unsubscribe();
    }
    if (browser) {
        window.removeEventListener('keydown', handleKeydown);
    }
  });

  const formats: { value: Format; label: string }[] = [
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'xml', label: 'XML' },
    { value: 'csv', label: 'CSV' },
  ];

  $: schemaObj1 = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/structura",
        "isAccessibleForFree": true,
      "name": "Structura",
      "applicationCategory": "DeveloperApplication",
      "applicationSubCategory": "Developer Tool",
      "operatingSystem": ["Web", "iOS", "Android", "Linux", "Windows", "macOS"],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": t.description,
      "featureList": ["JSON Converter", "YAML Converter", "XML Converter", "CSV Converter", "Code Generator", "Tree Visualizer"],
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a
          }
        }))
      }
    };
</script>
<Head
  title={`${t.title} | Web Factory`}
  description={t.description}
/>


<svelte:head>


  {@html `<script type="application/ld+json">${JSON.stringify(schemaObj1)}</scr` + `ipt>`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <!-- Header -->
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 tracking-tight">
      Structura
    </h1>
    <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
      {t.description}
    </p>
  </div>

  <!-- Main Interface -->
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <!-- Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            class="flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative min-w-[120px] min-h-[44px] min-w-[44px] {activeTab === 'convert' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
            on:click={() => activeTab = 'convert'}
          >
              <Zap size={18} />
              {t.tabs.convert}
              {#if activeTab === 'convert'}
                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" transition:slide={{ axis: 'x' }}></div>
              {/if}
          </button>
          <button
            class="flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative min-w-[120px] min-h-[44px] min-w-[44px] {activeTab === 'codegen' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
            on:click={() => { activeTab = 'codegen'; runCodeGen(); }}
          >
              <Code size={18} />
              {t.tabs.codegen}
              {#if activeTab === 'codegen'}
                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" transition:slide={{ axis: 'x' }}></div>
              {/if}
          </button>
          <button
            class="flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative min-w-[120px] min-h-[44px] min-w-[44px] {activeTab === 'visualizer' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
            on:click={() => { activeTab = 'visualizer'; runVisualizer(); }}
          >
              <Network size={18} />
              {t.tabs.visualizer}
              {#if activeTab === 'visualizer'}
                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" transition:slide={{ axis: 'x' }}></div>
              {/if}
          </button>
          <button
            class="flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative min-w-[120px] min-h-[44px] min-w-[44px] {activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
            on:click={() => activeTab = 'history'}
          >
              <History size={18} />
              {t.tabs.history}
              {#if activeTab === 'history'}
                <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" transition:slide={{ axis: 'x' }}></div>
              {/if}
          </button>
      </div>

      <div class="p-6">
        <!-- Convert Tab -->
        {#if activeTab === 'convert'}
            <div transition:fade={{ duration: 200 }} class="space-y-6">
                <!-- Toolbar -->
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div class="flex items-center gap-4 w-full md:w-auto">
                        <!-- Examples Dropdown -->
                        <div class="relative group">
                            <button class="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-h-[44px] min-w-[44px]">
                                <span class="text-indigo-600 dark:text-indigo-400">★</span>
                                {t.examples.label}
                            </button>
                            <div class="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 hidden group-hover:block z-20">
                                {#each structuraExamples as ex (ex.label)}
                                    <button
                                        class="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors min-h-[44px] min-w-[44px]"
                                        on:click={() => loadExample(ex)}
                                    >
                                        <span class="font-bold text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded mr-2">{ex.format}</span>
                                        {ex.label}
                                    </button>
                                {/each}
                            </div>
                        </div>

                        <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                        <label for="input-format" class="sr-only">Input Format</label>
                        <select
                            id="input-format"
                            bind:value={inputFormat}
                            class="pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                        >
                            {#each formats as f (f.value)}
                                <option value={f.value}>{f.label}</option>
                            {/each}
                        </select>

                        <ArrowRight class="text-gray-400" size={16} />

                        <label for="output-format" class="sr-only">Output Format</label>
                        <select
                            id="output-format"
                            bind:value={outputFormat}
                            class="pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                        >
                            {#each formats as f (f.value)}
                                <option value={f.value}>{f.label}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="flex items-center gap-2">
                        <button
                            class="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px] min-w-[44px]"
                            on:click={runConversion}
                        >
                            <span>{t.convert}</span>
                            {#if isConverting}
                                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {/if}
                        </button>
                        <button
                            class="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            on:click={() => showSettings = !showSettings}
                            aria-label={t.settings}
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                {#if showSettings}
                    <div transition:slide>
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

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                    <div class="flex flex-col gap-2 h-full">
                        <div class="flex justify-between items-center px-1">
                            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.input}</span>
                            <Toolbar
                                showDownload={false}
                                on:copy={() => handleCopy(input)}
                                on:clear={handleClear}
                                labels={{ copy: t.copy, download: t.download, clear: t.clear }}
                            />
                        </div>
                        <div class="flex-1 min-h-0 shadow-inner rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <DataEditor bind:value={input} language={inputFormat} placeholder={t.inputPlaceholder} />
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 h-full">
                        <div class="flex justify-between items-center px-1">
                            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.output}</span>
                            <Toolbar
                                showClear={false}
                                on:copy={() => handleCopy(output)}
                                on:download={() => handleDownload(output, outputFormat)}
                                labels={{ copy: t.copy, download: t.download, clear: t.clear }}
                            />
                        </div>
                        <div class="flex-1 min-h-0 shadow-inner rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                            <DataEditor bind:value={output} language={outputFormat} readonly={true} placeholder={t.outputPlaceholder} />

                            {#if error}
                                <div class="absolute inset-x-0 bottom-0 p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/50 backdrop-blur-sm" transition:fly={{ y: 20 }}>
                                    <div class="flex items-start gap-2 text-red-600 dark:text-red-400">
                                        <span class="font-bold text-sm">{t.error}:</span>
                                        <span class="text-sm font-mono break-all">{error}</span>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>

        <!-- Code Gen Tab -->
        {:else if activeTab === 'codegen'}
            <div transition:fade={{ duration: 200 }} class="space-y-6">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <div class="flex items-center gap-4 w-full">
                        <div class="flex-1">
                            <label for="codegen-lang" class="block text-xs font-medium text-gray-500 mb-1">{t.codegen.language}</label>
                            <select
                                id="codegen-lang"
                                bind:value={codeGenLang}
                                on:change={runCodeGen}
                                class="w-full pl-3 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm min-h-[44px]"
                            >
                                <option value="typescript">{t.codegen.typescript}</option>
                                <option value="zod">{t.codegen.zod}</option>
                                <option value="go">{t.codegen.go}</option>
                                <option value="python">{t.codegen.python}</option>
                                <option value="pydantic">{t.codegen.pydantic}</option>
                                <option value="json_schema">{t.codegen.jsonSchema}</option>
                            </select>
                        </div>
                        <div class="flex-1">
                            <label for="codegen-name" class="block text-xs font-medium text-gray-500 mb-1">{t.codegen.name}</label>
                            <input
                                id="codegen-name"
                                type="text"
                                bind:value={rootName}
                                on:input={runCodeGen}
                                class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm min-h-[44px]"
                            />
                        </div>
                    </div>
                    <div class="self-end">
                        <button
                            class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors min-h-[44px] min-w-[44px]"
                            on:click={runCodeGen}
                        >
                            {t.codegen.generate}
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                     <div class="flex flex-col gap-2 h-full">
                         <div class="flex justify-between items-center px-1">
                             <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.input}</span>
                         </div>
                         <div class="flex-1 min-h-0 shadow-inner rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                             <DataEditor bind:value={input} language={inputFormat} placeholder={t.inputPlaceholder} />
                         </div>
                     </div>
                     <div class="flex flex-col gap-2 h-full">
                        <div class="flex justify-between items-center px-1">
                            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.codegen.title}</span>
                             <Toolbar
                                showDownload={false}
                                showClear={false}
                                on:copy={() => handleCopy(generatedCode)}
                                labels={{ copy: t.copy, download: t.download, clear: t.clear }}
                            />
                        </div>
                         <div class="flex-1 min-h-0 shadow-inner rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                             <DataEditor
                                bind:value={generatedCode}
                                language={codeGenLang === 'go' ? 'go' : codeGenLang === 'python' || codeGenLang === 'pydantic' ? 'python' : 'typescript'}
                                readonly={true}
                            />
                             {#if error}
                                <div class="absolute inset-x-0 bottom-0 p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/50 backdrop-blur-sm">
                                    <div class="text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>
                                </div>
                            {/if}
                         </div>
                     </div>
                </div>
            </div>

        <!-- Visualizer Tab -->
        {:else if activeTab === 'visualizer'}
             <div transition:fade={{ duration: 200 }} class="h-[600px] flex flex-col">
                 <div class="flex-1 min-h-0 flex gap-4">
                     <!-- Input Side (Small) -->
                     <div class="w-1/3 flex flex-col gap-2">
                        <div class="flex justify-between items-center px-1">
                             <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.input}</span>
                        </div>
                        <div class="flex-1 min-h-0 shadow-inner rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                             <DataEditor bind:value={input} language={inputFormat} placeholder={t.inputPlaceholder} />
                         </div>
                     </div>

                     <!-- Visualizer Side -->
                     <div class="w-2/3 flex flex-col gap-2">
                         <div class="flex justify-between items-center px-1">
                             <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.visualizer.title}</span>
                         </div>
                         <div class="flex-1 min-h-0">
                            {#if visualizerData}
                                <TreeVisualizer data={visualizerData} />
                            {:else}
                                <div class="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 p-8 text-center">
                                    <div>
                                        <Network size={48} class="mx-auto mb-4 opacity-20" />
                                        <p>{t.visualizer.empty}</p>
                                    </div>
                                </div>
                            {/if}
                         </div>
                     </div>
                 </div>
             </div>

        <!-- History Tab -->
        {:else if activeTab === 'history'}
             <div transition:fade={{ duration: 200 }}>
                 {#if history && history.length > 0}
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {#each history as item (item.id)}
                            <div class="group relative bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                                <div class="flex justify-between items-start mb-3">
                                    <div class="flex items-center gap-2 text-xs font-mono">
                                        <span class="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm">{item.inputFormat}</span>
                                        <ArrowRight size={12} class="text-gray-400" />
                                        <span class="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded shadow-sm">{item.outputFormat}</span>
                                    </div>
                                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            class="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-gray-400 hover:text-yellow-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                            on:click|stopPropagation={() => structuraWorkspace.toggleStar(item.id || 0)}
                                            aria-label={t.star || "Star"}
                                        >
                                            <Star size={16} fill={item.starred ? "currentColor" : "none"} class={item.starred ? "text-yellow-500" : ""} />
                                        </button>
                                        <button
                                            class="p-1.5 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                            on:click|stopPropagation={() => structuraWorkspace.delete(item.id || 0)}
                                            aria-label={t.delete || "Delete"}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <button class="w-full text-left min-h-[44px] min-w-[44px]" on:click={() => restoreHistory(item)}>
                                    <p class="text-xs text-gray-500 mb-2">{new Date(item.createdAt).toLocaleString()}</p>
                                    <p class="text-sm font-mono text-gray-700 dark:text-gray-300 line-clamp-3 bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                                        {item.inputPreview}
                                    </p>
                                </button>
                            </div>
                        {/each}
                    </div>
                 {:else}
                    <div class="text-center py-20 text-gray-500">
                        <History size={48} class="mx-auto mb-4 opacity-20" />
                        <p>{t.history}</p>
                    </div>
                 {/if}
             </div>
        {/if}
      </div>
  </div>

  <!-- Documentation & Guides -->
  <article class="prose dark:prose-invert max-w-none mt-20 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[44px] min-w-[44px]">
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

    <GuideSection {...t?.guide} />
  <AdPlaceholder />
  <FAQSection title={t.faqTitle} items={faqItems} />
  </article>

  <div class="flex justify-center mt-8 text-sm text-gray-400">
      <div class="flex items-center gap-2">
          <span>{t.shortcuts.help}:</span>
          <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-xs">Ctrl + Enter</kbd>
          <span>to Convert</span>
      </div>
  </div>
</div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="structura" currentCategory="dev" />
  </div>
