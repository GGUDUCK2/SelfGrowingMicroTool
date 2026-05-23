<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import Converter from '$lib/components/yaml-forge/Converter.svelte';
  import Validator from '$lib/components/yaml-forge/Validator.svelte';
  import Formatter from '$lib/components/yaml-forge/Formatter.svelte';
  import HistorySidebar from '$lib/components/yaml-forge/HistorySidebar.svelte';
  import { FileJson, Code, CheckSquare, Clock, Code2 } from 'lucide-svelte';

  import type { YamlForgeHistoryItem } from '$lib/db/yaml-forge';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang)?.tools?.yamlForge || getDictionary('en').tools.yamlForge;

  type Tab = 'converter' | 'validator' | 'formatter' | 'history';
  let activeTab: Tab = 'converter';

  let restoredData: YamlForgeHistoryItem | null = null;

  let historyKey = 0;
  function refreshHistory() {
    historyKey += 1;
  }

  function selectTab(tab: Tab) {
    activeTab = tab;
  }

  $: faqItems = [
    { q: dict.faqQ1, a: dict.faqA1 },
    { q: dict.faqQ2, a: dict.faqA2 },
    { q: dict.faqQ3, a: dict.faqA3 }
  ];

  $: schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/yaml-forge",
    "isAccessibleForFree": true,
    "name": dict.title,
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "Developer Tool",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. HTML5.",
    "description": dict.description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://selfgrowingmicrotool.com/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": `https://selfgrowingmicrotool.com/${lang}/tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": dict.title,
        "item": `https://selfgrowingmicrotool.com/${lang}/tools/yaml-forge`
      }
    ]
  };

  $: faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };
</script>

<Head
  title={dict.title}
  description={dict.description}
/>

<svelte:head>
  <!-- eslint-disable svelte/no-at-html-tags -->
  {@html '<!-- ' + JSON.stringify(schema) + ' -->'}
  <script type="application/ld+json">{@html JSON.stringify(schema)}</script>
  {@html '<!-- ' + JSON.stringify(breadcrumbSchema) + ' -->'}
  <script type="application/ld+json">{@html JSON.stringify(breadcrumbSchema)}</script>
  {@html '<!-- ' + JSON.stringify(faqSchema) + ' -->'}
  <script type="application/ld+json">{@html JSON.stringify(faqSchema)}</script>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <!-- Header -->
  <div class="text-center space-y-4">
    <div class="inline-flex items-center justify-center p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-3xl mb-4">
      <Code2 size={48} class="text-indigo-600 dark:text-indigo-400" />
    </div>
    <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      {dict.title}
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
      {dict.description}
    </p>
  </div>

  <!-- Main App -->
  <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
    <!-- Sidebar / Tabs -->
    <div class="w-full md:w-64 bg-slate-50 dark:bg-slate-800/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 md:flex md:flex-col gap-2 shrink-0 flex overflow-x-auto overflow-y-hidden">
      <button
        class="flex items-center gap-3 px-4 py-3 min-h-[44px] min-w-[44px] rounded-xl text-sm font-medium transition-all shrink-0 {activeTab === 'converter' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'}"
        on:click={() => selectTab('converter')}
        aria-label={dict.tabs.converter}
      >
        <FileJson size={18} />
        {dict.tabs.converter}
      </button>
      <button
        class="flex items-center gap-3 px-4 py-3 min-h-[44px] min-w-[44px] rounded-xl text-sm font-medium transition-all shrink-0 {activeTab === 'formatter' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'}"
        on:click={() => selectTab('formatter')}
        aria-label={dict.tabs.formatter}
      >
        <Code size={18} />
        {dict.tabs.formatter}
      </button>
      <button
        class="flex items-center gap-3 px-4 py-3 min-h-[44px] min-w-[44px] rounded-xl text-sm font-medium transition-all shrink-0 {activeTab === 'validator' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'}"
        on:click={() => selectTab('validator')}
        aria-label={dict.tabs.validator}
      >
        <CheckSquare size={18} />
        {dict.tabs.validator}
      </button>
      <div class="md:mt-auto">
        <button
          class="flex items-center gap-3 px-4 py-3 min-h-[44px] min-w-[44px] rounded-xl text-sm font-medium transition-all w-full shrink-0 {activeTab === 'history' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'}"
          on:click={() => selectTab('history')}
          aria-label={dict.tabs.history}
        >
          <Clock size={18} />
          {dict.tabs.history}
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 p-6 md:p-8 flex flex-col min-h-0 relative bg-white dark:bg-slate-900 w-full overflow-y-auto">
      {#if activeTab === 'converter'}
        <div in:fade={{ duration: 200 }} class="w-full h-full">
          <Converter {dict} {refreshHistory} bind:restoredData />
        </div>
      {:else if activeTab === 'formatter'}
        <div in:fade={{ duration: 200 }} class="w-full h-full">
          <Formatter {dict} {refreshHistory} bind:restoredData />
        </div>
      {:else if activeTab === 'validator'}
        <div in:fade={{ duration: 200 }} class="w-full h-full max-w-4xl mx-auto">
          <Validator {dict} />
        </div>
      {:else if activeTab === 'history'}
        <div in:fade={{ duration: 200 }} class="h-full max-w-4xl mx-auto w-full">
          {#key historyKey}
            <HistorySidebar
              {dict}
              onSelect={(item) => {
                restoredData = item;
                if (item.mode.includes('to')) selectTab('converter');
                else if (item.mode === 'format') selectTab('formatter');
              }}
            />
          {/key}
        </div>
      {/if}
    </div>
  </div>

  <GuideSection
    title={dict.guideTitle}
    intro={dict.guideIntro}
    featuresTitle={dict.guideFeaturesTitle}
    f1={dict.guideF1}
    f2={dict.guideF2}
    f3={dict.guideF3}
    tipsTitle={dict.guideTipsTitle}
    tip1={dict.guideTip1}
    tip2={dict.guideTip2}
    tip3={dict.guideTip3}
  />

  <AdPlaceholder />
  <FAQSection
    title={dict.faqTitle}
    items={faqItems}
  />
</div>

<div class="mt-12 mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <RelatedTools {lang} currentSlug="yaml-forge" currentCategory="dev" />
</div>
