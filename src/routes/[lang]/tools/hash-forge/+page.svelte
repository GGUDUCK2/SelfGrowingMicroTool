<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import TextHasher from '$lib/components/hash-forge/TextHasher.svelte';
  import FileHasher from '$lib/components/hash-forge/FileHasher.svelte';
  import HmacGenerator from '$lib/components/hash-forge/HmacGenerator.svelte';
  import HistorySidebar from '$lib/components/hash-forge/HistorySidebar.svelte';
  import { Shield, FileText, KeyRound, Clock, Hash } from 'lucide-svelte';
  import { onMount, onDestroy } from 'svelte';

  $: lang = $page.params.lang || 'en';
  // Use fallback if somehow dict gets undefined, but normally it shouldn't
  $: dict = getDictionary(lang)?.tools?.hashForge || getDictionary('en').tools.hashForge;

  type Tab = 'text' | 'file' | 'hmac' | 'history';
  let activeTab: Tab = 'text';

  // State to force history sidebar reload
  let historyKey = 0;
  function refreshHistory() {
    historyKey += 1;
  }

  function selectTab(tab: Tab) {
    activeTab = tab;
  }

  $: faqItems = [
    { q: dict?.faqQ1, a: dict?.faqA1 },
    { q: dict?.faqQ2, a: dict?.faqA2 },
    { q: dict?.faqQ3, a: dict?.faqA3 }
  ];

  $: schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "isAccessibleForFree": true,
    "name": dict?.title,
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "Cryptography Tool",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. HTML5. Web Crypto API.",
    "description": dict?.description,
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
        "item": `https://micro-tools.app/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": `https://micro-tools.app/${lang}/tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": dict?.title,
        "item": `https://micro-tools.app/${lang}/tools/hash-forge`
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
  title={dict?.title}
  description={dict?.description}
/>


<svelte:head>
      {@html '<script type="application/ld+json">' + JSON.stringify(schema) + '</script>'}
      {@html '<script type="application/ld+json">' + JSON.stringify(breadcrumbSchema) + '</script>'}
      {@html '<script type="application/ld+json">' + JSON.stringify(faqSchema) + '</script>'}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <!-- Header -->
  <div class="text-center space-y-4">
    <div class="inline-flex items-center justify-center p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-3xl mb-4">
      <Hash size={48} class="text-indigo-600 dark:text-indigo-400" />
    </div>
    <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      {dict?.title}
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
      {dict?.description}
    </p>
  </div>

  <!-- Main App -->
  <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px] flex flex-col md:flex-row">

    <!-- Left Navigation Sidebar (Desktop) / Top Tabs (Mobile) -->
    <div class="w-full md:w-64 bg-slate-50 dark:bg-slate-800/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 md:flex md:flex-col gap-2 shrink-0 flex overflow-x-auto overflow-y-hidden">
      <button
        class="flex items-center gap-3 px-4 py-3 min-h-[44px] min-w-[44px] rounded-xl text-sm font-medium transition-all shrink-0 {activeTab === 'text' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'}"
        on:click={() => selectTab('text')}
        aria-label={dict?.tabs?.text}
      >
        <FileText size={18} />
        {dict?.tabs?.text}
      </button>
      <button
        class="flex items-center gap-3 px-4 py-3 min-h-[44px] min-w-[44px] rounded-xl text-sm font-medium transition-all shrink-0 {activeTab === 'file' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'}"
        on:click={() => selectTab('file')}
        aria-label={dict?.tabs?.file}
      >
        <Shield size={18} />
        {dict?.tabs?.file}
      </button>
      <button
        class="flex items-center gap-3 px-4 py-3 min-h-[44px] min-w-[44px] rounded-xl text-sm font-medium transition-all shrink-0 {activeTab === 'hmac' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'}"
        on:click={() => selectTab('hmac')}
        aria-label={dict?.tabs?.hmac}
      >
        <KeyRound size={18} />
        {dict?.tabs?.hmac}
      </button>

      <div class="md:mt-auto">
        <button
          class="flex items-center gap-3 px-4 py-3 min-h-[44px] min-w-[44px] rounded-xl text-sm font-medium transition-all w-full shrink-0 {activeTab === 'history' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'}"
          on:click={() => selectTab('history')}
          aria-label={dict?.tabs?.history}
        >
          <Clock size={18} />
          {dict?.tabs?.history}
        </button>
      </div>
    </div>

    <!-- Active Area -->
    <div class="flex-1 p-6 md:p-8 flex flex-col min-h-0 relative bg-white dark:bg-slate-900 w-full overflow-y-auto">
      {#if activeTab === 'text'}
        <div in:fade={{ duration: 200 }} class="max-w-3xl mx-auto w-full">
          <TextHasher {dict} onNewHistory={refreshHistory} />
        </div>
      {:else if activeTab === 'file'}
        <div in:fade={{ duration: 200 }} class="max-w-3xl mx-auto w-full">
          <FileHasher {dict} onNewHistory={refreshHistory} />
        </div>
      {:else if activeTab === 'hmac'}
        <div in:fade={{ duration: 200 }} class="max-w-3xl mx-auto w-full">
          <HmacGenerator {dict} onNewHistory={refreshHistory} />
        </div>
      {:else if activeTab === 'history'}
        <div in:fade={{ duration: 200 }} class="h-full">
          {#key historyKey}
            <HistorySidebar
              onSelect={(item) => {
                if (item.type === 'text') selectTab('text');
                else if (item.type === 'file') selectTab('file');
                else if (item.type === 'hmac') selectTab('hmac');
              }}
            />
          {/key}
        </div>
      {/if}
    </div>
  </div>

  <GuideSection
    title={dict?.guideTitle}
    intro={dict?.guideIntro}
    featuresTitle={dict?.guideFeaturesTitle}
    f1={dict?.guideF1}
    f2={dict?.guideF2}
    f3={dict?.guideF3}
    tipsTitle={dict?.guideTipsTitle}
    tip1={dict?.guideTip1}
    tip2={dict?.guideTip2}
    tip3={dict?.guideTip3}
  />

  <FAQSection
    title={dict?.faqTitle}
    items={faqItems}
  />
</div>
