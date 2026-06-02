<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { parseInput, formatOutput, type TableData, type OutputFormat } from '$lib/utils/table-forge/engine';
  import { db, type TableForgeHistory } from '$lib/db';
  import Toolbar from '$lib/components/table-forge/Toolbar.svelte';
  import GridEditor from '$lib/components/table-forge/GridEditor.svelte';
  import CodePreview from '$lib/components/table-forge/CodePreview.svelte';
  import HistoryDrawer from '$lib/components/table-forge/HistoryDrawer.svelte';
  import InputModal from '$lib/components/table-forge/InputModal.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { FileText, History as HistoryIcon, Wand2 } from '@lucide/svelte';
  import { fade, slide } from 'svelte/transition';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang).tools.tableForge;

  let data: TableData = [['id', 'name', 'role'], ['1', 'Alice', 'Admin'], ['2', 'Bob', 'User']];
  let outputFormat: OutputFormat = 'markdown';
  let isCompact = false;
  let isPretty = true;
  let generatedCode = '';
  let showHistory = false;
  let showInput = false;
  let toastMessage = '';
  let showToast = false;

  $: {
      generatedCode = formatOutput(data, outputFormat, { compact: isCompact, pretty: isPretty });
  }

  function handleImport(e: CustomEvent<string>) {
      const input = e.detail;
      const result = parseInput(input);
      if (result && result.length > 0) {
          data = result;
          showToastMessage('Imported successfully');
      } else {
          showToastMessage('Failed to parse input');
      }
  }

  function handleSave() {
      db.tableForgeHistory.add({
          data: data,
          format: outputFormat,
          createdAt: new Date(),
          starred: 0
      });
      showToastMessage('Saved to history');
  }

  function handleRestore(e: CustomEvent<TableForgeHistory>) {
      data = e.detail.data;
      outputFormat = e.detail.format as OutputFormat || 'markdown';
      showHistory = false;
      showToastMessage('Restored from history');
  }

  function handleTranspose() {
      if (!data || data.length === 0) return;
      data = data[0].map((_, colIndex) => data.map(row => row[colIndex]));
  }

  function copyCode() {
      navigator.clipboard.writeText(generatedCode);
      showToastMessage('Copied to clipboard');
  }

  function downloadFile() {
      const extMap: Record<string, string> = {
          'markdown': 'md',
          'csv': 'csv',
          'json': 'json',
          'html': 'html',
          'sql': 'sql',
          'latex': 'tex',
          'ascii': 'txt'
      };
      const ext = extMap[outputFormat] || 'txt';
      const blob = new Blob([generatedCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `table-forge.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
  }

  function showToastMessage(msg: string) {
      toastMessage = msg;
      showToast = true;
      setTimeout(() => showToast = false, 3000);
  }

  $: jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/table-forge",
        "isAccessibleForFree": true,
      "name": dict.title,
      "description": dict.description,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "CSV to Markdown",
        "JSON to Table",
        "SQL Insert Generator",
        "LaTeX Table Formatter",
        "ASCII Table Generator"
      ]
    };

  $: jsonLd2 = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": dict?.q1,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict?.a1
        }
      },
      {
        "@type": "Question",
        "name": dict?.q2,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict?.a2
        }
      },
      {
        "@type": "Question",
        "name": dict?.q3,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict?.a3
        }
      }
    ]
  };
</script>
<Head
  title={dict.title}
  description={dict.description}
/>


<svelte:head>
      <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}

  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd2) + '</scr' + 'ipt>'}

</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white">
    <!-- Header -->
    <div class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <FileText size={20} />
            </div>
            <h1 class="text-lg font-bold hidden sm:block">{dict.title}</h1>
        </div>

        <div class="flex items-center gap-2">
            <button
                class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors min-h-[44px] min-w-[44px]"
                on:click={() => showInput = true}
            >
                <Wand2 size={16} />
                <span class="hidden sm:inline">{dict.smartPaste}</span>
            </button>
            <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button
                class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative min-h-[44px] min-w-[44px] flex items-center justify-center"
                on:click={() => showHistory = !showHistory}
                title={dict.history}
            >
                <HistoryIcon size={20} />
            </button>
        </div>
    </div>

    <div class="flex-1 flex flex-col h-[calc(100vh-64px)]">
        <div class="shrink-0">
            <Toolbar
                {dict}
                bind:outputFormat
                bind:isCompact
                bind:isPretty
                on:copy={copyCode}
                on:download={downloadFile}
                on:save={handleSave}
                on:transpose={handleTranspose}
            />
        </div>

        <div class="flex-1 flex overflow-hidden relative flex-col md:flex-row">
            <!-- Grid Editor -->
            <div class="flex-1 min-h-[300px] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                <div class="p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                    {dict.editor}
                    <span class="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 rounded text-slate-600 dark:text-slate-300">Editable</span>
                </div>
                <div class="flex-1 overflow-hidden relative">
                    <GridEditor bind:data />
                </div>
            </div>

            <!-- Preview -->
            <div class="flex-1 min-h-[300px] flex flex-col overflow-hidden bg-[#2d2d2d]">
                <div class="p-2 bg-[#252525] border-b border-[#333] text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                    {dict.preview}
                    <span class="text-[10px] bg-[#333] px-1.5 rounded text-slate-400">{outputFormat}</span>
                </div>
                <div class="flex-1 overflow-hidden relative">
                    <CodePreview code={generatedCode} language={outputFormat} />
                </div>
            </div>

            <!-- History Drawer -->
            {#if showHistory}
               <!-- svelte-ignore a11y-click-events-have-key-events -->
               <!-- svelte-ignore a11y-no-static-element-interactions -->
               <div class="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm" on:click={() => showHistory = false} transition:fade></div>
               <HistoryDrawer {dict} on:restore={handleRestore} on:close={() => showHistory = false} />
            {/if}
        </div>
    </div>

    <!-- SEO Content -->
    <section class="bg-white dark:bg-slate-900 py-16 lg:py-24 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-4xl mx-auto px-6 space-y-16">
            <article class="prose dark:prose-invert max-w-none">
               <h2 class="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                   {dict.guide.title}
               </h2>
               <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
                   {dict.guide.intro}
               </p>

               <div class="grid md:grid-cols-2 gap-8 not-prose">
                    <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <h3 class="text-xl font-bold mb-4 text-slate-800 dark:text-white">
                             {dict.guide.featuresTitle}
                        </h3>
                        <ul class="space-y-3">
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <span class="text-indigo-500 mt-0.5">●</span>
                                 <span>{@html dict.guide.f1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
                             </li>
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <span class="text-indigo-500 mt-0.5">●</span>
                                 <span>{@html dict.guide.f2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
                             </li>
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <span class="text-indigo-500 mt-0.5">●</span>
                                 <span>{@html dict.guide.f3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
                             </li>
                        </ul>
                    </div>

                    <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <h3 class="text-xl font-bold mb-4 text-slate-800 dark:text-white">
                             {dict.guide.tipsTitle}
                        </h3>
                         <ul class="space-y-3">
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <span class="text-amber-500 mt-0.5">💡</span>
                                 <span>{@html dict.guide.tip1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
                             </li>
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <span class="text-amber-500 mt-0.5">💡</span>
                                 <span>{@html dict.guide.tip2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
                             </li>
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <span class="text-amber-500 mt-0.5">💡</span>
                                 <span>{@html dict.guide.tip3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
                             </li>
                        </ul>
                    </div>
               </div>
           </article>

           <GuideSection {...dict?.guide} />
  <AdPlaceholder />
  <FAQSection
               title={dict.faqTitle}
               items={[
                   { question: dict?.q1, answer: dict?.a1 },
                   { question: dict?.q2, answer: dict?.a2 },
                   { question: dict?.q3, answer: dict?.a3 }
               ]}
           />
        </div>
    </section>
</div>

<InputModal open={showInput} on:import={handleImport} />

<!-- Toast -->
{#if showToast}
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3" transition:slide={{ axis: 'y', duration: 300 }}>
        <span class="font-medium text-sm">{toastMessage}</span>
    </div>
{/if}

  <div class="mt-12 mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <RelatedTools {lang} currentSlug="table-forge" currentCategory="dev" />
  </div>
