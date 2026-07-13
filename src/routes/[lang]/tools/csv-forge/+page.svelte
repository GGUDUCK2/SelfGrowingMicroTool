<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import { db } from '$lib/db';
  import type { CsvForgeHistory } from '$lib/db';
  import { parseCsv, unparseCsv } from '$lib/utils/csv-forge/parser';

  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import CsvEditor from '$lib/components/csv-forge/CsvEditor.svelte';
  import CsvConverter from '$lib/components/csv-forge/CsvConverter.svelte';
  import CsvAnalyzer from '$lib/components/csv-forge/CsvAnalyzer.svelte';
  import HistoryPanel from '$lib/components/csv-forge/HistoryPanel.svelte';

  import { Check, FileSpreadsheet, Edit3, ArrowRightLeft, BarChart2 } from '@lucide/svelte';
  import Head from '$lib/components/Head.svelte';

  $: lang = $page.params.lang as 'en' | 'ko';
  $: dict = (dictionaries as any)[lang].tools.csvForge;
  $: common = dictionaries[lang].common;

  let rawCsv = '';
  let activeTab: 'editor' | 'converter' | 'analyzer' = 'editor';
  let data: any[][] = [];
  let filename = 'Untitled.csv';
  let currentId: number | undefined;

  let showToast = false;
  let toastMessage = '';

  $: {
    if (rawCsv) {
      const result = parseCsv(rawCsv);
      if (result.errors.length === 0) {
        data = result.data;
      }
    }
  }

  function handleDataChange(event: CustomEvent<any[][]>) {
    data = event.detail;
    rawCsv = unparseCsv(data);
    saveToHistory();
  }

  function handleClear() {
    currentId = undefined;
    data = [];
    rawCsv = '';
  }

  function handleDownload() {
    if (data.length === 0) return;
    const csvContent = unparseCsv(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToastMsg(dict.downloadSuccess);
  }

  async function saveToHistory() {
    if (!data || data.length === 0) return;
    try {

      // Update existing if we have a current session id, else create new
      // For simplicity, we just add for now, but since we changed on:input to on:blur it won't flood as much.
      // Better yet, let's keep track of currentId
      if (currentId) {
        await db.csvForgeHistory.update(currentId, {
          content: rawCsv,
          rowCount: data.length > 0 ? data.length - 1 : 0,
          columnCount: data.length > 0 ? data[0].length : 0,
          updatedAt: new Date()
        });
      } else {
        currentId = await db.csvForgeHistory.add({
        filename,
        content: rawCsv,
        rowCount: data.length > 0 ? data.length - 1 : 0,
        columnCount: data.length > 0 ? data[0].length : 0,
        createdAt: new Date(),
        starred: 0
      });
      }
    } catch (error) {
      console.error('Failed to save history', error);
    }
  }

  function handleRestore(event: CustomEvent<CsvForgeHistory>) {
    const item = event.detail;
    rawCsv = item.content;
    filename = item.filename;
    currentId = item.id;
    showToastMsg('Restored from history');
  }

  function showToastMsg(msg: string) {
    toastMessage = msg;
    showToast = true;
    setTimeout(() => (showToast = false), 2000);
  }

  $: faqItems = [
    {
      q: lang === 'en' ? "Is my data sent to any server?" : "내 데이터가 서버로 전송되나요?",
      a: lang === 'en' ? "No. All CSV parsing, conversion, and analysis happens entirely in your local browser. Your data never leaves your device." : "아니요. 모든 CSV 파싱, 변환 및 분석은 로컬 브라우저에서 완전히 이루어집니다. 데이터는 기기 외부로 전송되지 않습니다."
    },
    {
      q: lang === 'en' ? "What delimiters are supported?" : "어떤 구분 기호가 지원되나요?",
      a: lang === 'en' ? "CSV Forge automatically detects the most common delimiters, including commas, tabs, and semicolons." : "CSV 포지는 쉼표, 탭, 세미콜론 등 가장 일반적인 구분 기호를 자동으로 감지합니다."
    },
    {
      q: lang === 'en' ? "Can I convert CSV to SQL?" : "CSV를 SQL로 변환할 수 있나요?",
      a: lang === 'en' ? "Yes, the Converter tab allows you to instantly generate SQL INSERT statements from your CSV data." : "네, 변환기 탭을 사용하면 CSV 데이터에서 즉시 SQL INSERT 문을 생성할 수 있습니다."
    }
  ];




  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": dictionaries[lang].home.title,
        "item": `https://selfgrowingmicrotool.com/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": dict?.title || '',
        "item": `https://selfgrowingmicrotool.com/${lang}/tools/csv-forge`
      }
    ]
  };

  $: softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/csv-forge",
        "isAccessibleForFree": true,
    "name": dict?.title || '',
    "description": dict?.description || '',
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "CSV Utility",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
</script>

<svelte:head>
  <link rel="canonical" href={"https://selfgrowingmicrotool.com/" + lang + "/tools/csv-forge"} />
  <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/csv-forge" />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/csv-forge" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/csv-forge" />
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</scr` + `ipt>`}
  {@html `<script type="application/ld+json">${JSON.stringify(softwareSchema)}</scr` + `ipt>`}


</svelte:head>

<Head
  title={dict?.title || ''}
  description={dict?.description || ''}
  keywords="csv editor, csv to json, csv to sql, csv analyzer, local csv tool"
/>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20">
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -ml-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <div class="flex items-center space-x-2">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
             <FileSpreadsheet size={20} />
          </div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {dict?.title || ''}
          </h1>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-8 space-y-6">

        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <label for="rawCsv" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {dict.inputLabel}
          </label>
          <textarea
            id="rawCsv"
            bind:value={rawCsv}
            rows="5"
            placeholder={dict.placeholder}
            class="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y"
          ></textarea>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-1.5 flex overflow-x-auto gap-1" role="tablist">
           <button
             role="tab"
             aria-selected={activeTab === 'editor'}
             class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all {activeTab === 'editor' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'editor'}
           >
             <Edit3 size={16} />
             <span>{dict.tabs.editor}</span>
           </button>
           <button
             role="tab"
             aria-selected={activeTab === 'converter'}
             class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all {activeTab === 'converter' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'converter'}
           >
             <ArrowRightLeft size={16} />
             <span>{dict.tabs.converter}</span>
           </button>
           <button
             role="tab"
             aria-selected={activeTab === 'analyzer'}
             class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all {activeTab === 'analyzer' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'}"
             on:click={() => activeTab = 'analyzer'}
           >
             <BarChart2 size={16} />
             <span>{dict.tabs.analyzer}</span>
           </button>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 min-h-[400px]">
           {#if activeTab === 'editor'}
             <CsvEditor {data} {dict} on:change={handleDataChange} on:clear={handleClear} on:download={handleDownload} />
           {:else if activeTab === 'converter'}
             <CsvConverter {data} {dict} />
           {:else if activeTab === 'analyzer'}
             <CsvAnalyzer {data} {dict} />
           {/if}
        </div>

        <div class="mt-12 space-y-8">
           <GuideSection
             title={dict.guide.title}
             intro={dict.guide.intro}
             featuresTitle={dict.guide.featuresTitle}
             f1={dict.guide.f1}
             f2={dict.guide.f2}
             f3={dict.guide.f3}
             tipsTitle={dict.guide.tipsTitle}
             tip1={dict.guide.tip1}
             tip2={dict.guide.tip2}
             tip3={dict.guide.tip3}
           />

           <AdPlaceholder />
  <FAQSection title={dict.faqTitle} items={faqItems} />
        </div>
      </div>

      <div class="lg:col-span-4 space-y-6">
         <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 sticky top-24">
            <HistoryPanel {dict} on:restore={handleRestore} />
         </div>
      </div>
    </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="csv-forge" currentCategory="dev" />
  </div>
</main>

  {#if showToast}
    <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50" transition:fade>
      <div class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 font-medium text-sm">
        <Check size={18} />
        <span>{toastMessage}</span>
      </div>
    </div>
  {/if}
</div>
