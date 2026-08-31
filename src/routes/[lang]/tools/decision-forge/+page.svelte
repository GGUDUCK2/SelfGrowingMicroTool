<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import { page } from '$app/stores';
  import Head from '$lib/components/Head.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { matrixStore } from '$lib/utils/decision-forge/store';
  import { exportToCsv, exportToJson } from '$lib/utils/decision-forge/export';
  import MatrixEditor from '$lib/components/decision-forge/MatrixEditor.svelte';
  import ResultsChart from '$lib/components/decision-forge/ResultsChart.svelte';
  import HistoryPanel from '$lib/components/decision-forge/HistoryPanel.svelte';
  import { Download, FileJson, FileSpreadsheet, Sidebar, X, RotateCcw } from '@lucide/svelte';
  import { fade, slide } from 'svelte/transition';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  // Fallback if dictionary not yet updated
  $: t = (dict.tools as any).decisionForge || {
      title: "Decision Forge",
      description: "Weighted Decision Matrix",
      export: "Export",
      reset: "Reset",
      downloadCsv: "Download CSV",
      downloadJson: "Download JSON"
  };

  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": $page.url.origin + "/" + lang + "/tools/decision-forge",
        "isAccessibleForFree": true,
    "name": t.title,
    "description": t.description,
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Weighted Decision Matrix",
      "Real-time Ranking",
      "CSV/JSON Export",
      "Local History"
    ]
  };

    let showSidebar = false;

  function toggleSidebar() {
    showSidebar = !showSidebar;
  }



  $: howToSchema = {
    "@context": "https://schema.org",

    "@type": "HowTo",
    "name": "How to use Decision Forge",
    "description": "Step-by-step guide to using the Decision Forge tool.",
    "step": [
        {
            "@type": "HowToStep",
            "name": "Configure Tool",
            "text": "Adjust the settings or input your data according to your requirements."
        },
        {
            "@type": "HowToStep",
            "name": "Process Data",
            "text": "Review the live preview or click the generate/process button."
        },
        {
            "@type": "HowToStep",
            "name": "Export Result",
            "text": "Copy or download the final output."
        }
    ]

  };

</script>

<Head
  title="{t.title} - MicroFactory"
  description={t.description}
  url="{$page.url.origin}/{lang}/tools/decision-forge"
  image="{$page.url.origin}/og/decision-forge.png"
/>

<svelte:head>
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/decision-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/decision-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/decision-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/decision-forge"} />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</scr` + `ipt>`}



  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(howToSchema).replace(/</g, '\\u003c')}</scr` + `ipt>`}
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
  <!-- Header -->
  <header class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button on:click={toggleSidebar}
          class="lg:hidden p-2 text-gray-500 hover:text-indigo-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={showSidebar ? 'Close Sidebar' : 'Open Sidebar'}
        >
          {#if showSidebar}
            <X size={24} />
          {:else}
            <Sidebar size={24} />
          {/if}
        </button>
        <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            </div>
            <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">{t.title}</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{t.description}</p>
            </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="hidden sm:flex items-center gap-2 mr-2">
            <input
                type="text"
                bind:value={$matrixStore.name}
                class="bg-gray-100 dark:bg-gray-700 border-none rounded-lg px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 w-48 lg:w-64 min-h-[44px]"
                placeholder="Project Name..."
            />
        </div>

        <div class="relative group">
            <button class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium min-h-[44px] min-w-[44px]">
                <Download size={18} />
                <span class="hidden sm:inline">{t.export}</span>
            </button>
            <!-- Dropdown -->
            <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                <button on:click={() => exportToCsv($matrixStore)}
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 min-h-[44px] min-w-[44px]"
                >
                    <FileSpreadsheet size={16} class="text-green-600" />
                    <span>{t.downloadCsv}</span>
                </button>
                <button on:click={() => exportToJson($matrixStore)}
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 min-h-[44px] min-w-[44px]"
                >
                    <FileJson size={16} class="text-yellow-600" />
                    <span>{t.downloadJson}</span>
                </button>
            </div>
        </div>

        <button on:click={() => matrixStore.reset()}
            class="p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={t.reset}
        >
            <RotateCcw size={20} />
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <div class="flex flex-col lg:flex-row gap-8">

      <!-- Sidebar (Desktop: Sticky, Mobile: Slide-over) -->
      <aside
        class="
            fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-auto lg:shadow-none lg:bg-transparent dark:lg:bg-transparent lg:w-1/4 lg:block
            {showSidebar ? 'translate-x-0' : '-translate-x-full'}
         min-h-[44px] min-w-[44px]"
      >
        <div class="h-full lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24">
            <HistoryPanel />
        </div>
      </aside>

      <!-- Overlay for mobile sidebar -->
      {#if showSidebar}
        <button class="fixed inset-0 bg-black/50 z-30 lg:hidden w-full h-full border-0 cursor-default min-h-[44px] min-w-[44px]"
            transition:fade
            on:click={toggleSidebar}
            on:keydown={(e) => e.key === 'Escape' && toggleSidebar()}
            aria-label="Close Sidebar"
        ></button>
      {/if}

      <!-- Main Content -->
      <div class="flex-1 w-full lg:w-3/4 space-y-8">

        <!-- Editor Section -->
        <section class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center lg:hidden">
                 <input
                    type="text"
                    bind:value={$matrixStore.name}
                    class="bg-transparent border-none text-lg font-bold text-gray-900 dark:text-white focus:ring-0 w-full min-h-[44px]"
                    placeholder="Project Name..."
                />
            </div>
            <MatrixEditor />
        </section>

        <!-- Results Section -->
        <section>
            <ResultsChart />
        </section>

        <!-- Documentation -->
        <GuideSection {...t.guide} />

        <!-- FAQ -->
        <AdPlaceholder />
  <FAQSection title={t.faqTitle} items={[
          { q: t.q1, a: t.a1 },
          { q: t.q2, a: t.a2 },
          { q: t.q3, a: t.a3 }
        ]} />
      </div>
    </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="decision-forge" currentCategory="dev" />
  </div>
</main>
</div>
