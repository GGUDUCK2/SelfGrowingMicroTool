<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { workspace } from '$lib/db/workspace';

  import EditorPane from '$lib/components/svg-forge/EditorPane.svelte';
  import PreviewPane from '$lib/components/svg-forge/PreviewPane.svelte';
  import ConfigPanel from '$lib/components/svg-forge/ConfigPanel.svelte';
  import HistoryPanel from '$lib/components/svg-forge/HistoryPanel.svelte';

  import { optimizeSvg, defaultSvgoConfig, type SvgoConfig } from '$lib/utils/svg-forge/optimizer';

  // --- Props & Localization ---

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict.tools.svgForge;

  // --- State ---
  let rawSvg = '';
  let optimizedSvg = '';
  let optimizationError: string | undefined = undefined;
  let config: SvgoConfig = JSON.parse(JSON.stringify(defaultSvgoConfig)); // Deep copy

  let originalSize = 0;
  let optimizedSize = 0;

  let historyPanelRef: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  // --- Logic ---
  $: {
    if (rawSvg.trim()) {
      originalSize = new TextEncoder().encode(rawSvg).length;
      const result = optimizeSvg(rawSvg, config);
      if (result.error) {
        optimizationError = result.error;
        optimizedSvg = '';
        optimizedSize = 0;
      } else {
        optimizationError = undefined;
        optimizedSvg = result.data;
        optimizedSize = new TextEncoder().encode(optimizedSvg).length;
      }
    } else {
      optimizedSvg = '';
      optimizationError = undefined;
      originalSize = 0;
      optimizedSize = 0;
    }
  }

  let toast: string | null = null;
  let toastTimeout: ReturnType<typeof setTimeout>;

  function showToast(msg: string) {
      if (toastTimeout) clearTimeout(toastTimeout);
      toast = msg;
      toastTimeout = setTimeout(() => toast = null, 2000);
  }

  // Handle Save
  async function handleSave() {
    if (!rawSvg || !optimizedSvg) return;
    await workspace.history.add({
      toolId: 'svgForge',
      input: rawSvg,
      result: optimizedSvg,
      details: JSON.stringify(config), // save config state
      timestamp: Date.now(),
      starred: false
    });
    showToast(t?.history?.saved || 'Saved');
    if (historyPanelRef) historyPanelRef.refresh();
  }

  // Handle Restore
  function handleRestore(input: string, result: string, savedConfig: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    rawSvg = input;
    if (savedConfig) {
      config = savedConfig;
    }
  }

  // Handle Keyboard Shortcuts
  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (rawSvg && !optimizationError) {
          handleSave();
        }
      }
      // Ctrl/Cmd + K to Clear Input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        rawSvg = '';
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  // --- SEO & Schema ---
  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/svg-forge",
    "name": t?.title || "SVG Forge",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": t?.description || "A professional-grade SVG optimization and visualization tool.",
    "isAccessibleForFree": true,
    "featureList": [
      "In-browser SVG Optimization",
      "SVGO Integration",
      "Real-time Preview",
      "Size comparison analytics",
      "Offline support via Dexie.js"
    ]
  };

  $: faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t?.faq?.q1,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.faq?.a1
        }
      },
      {
        "@type": "Question",
        "name": t?.faq?.q2,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.faq?.a2
        }
      },
      {
        "@type": "Question",
        "name": t?.faq?.q3,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.faq?.a3
        }
      }
    ]
  };
</script>

<Head
  title={t?.title || "SVG Forge"}
  description={t?.description}
  url={"https://selfgrowingmicrotool.com/" + lang + "/tools/svg-forge"}
  image="https://selfgrowingmicrotool.com/og/default.png"
/>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags, @typescript-eslint/no-unused-expressions -->
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</scr` + `ipt>`}
  <!-- eslint-disable-next-line svelte/no-at-html-tags, @typescript-eslint/no-unused-expressions -->
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(faqLd)}</scr` + `ipt>`}
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
  <!-- Toast -->
  {#if toast}
    <div class="fixed bottom-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg font-medium animate-bounce">
        {toast}
    </div>
  {/if}

  <!-- Header -->
  <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
    <div class="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div class="p-2.5 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            {t?.title}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl text-sm lg:text-base">
            {t?.description}
          </p>
        </div>
        <div class="flex gap-2">
           <button
             onclick={handleSave}
             disabled={!rawSvg || !!optimizationError}
             class="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center gap-2"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
             {t?.history?.saveBtn}
           </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Workspace -->
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- Left Column: Config & History -->
      <div class="lg:col-span-3 flex flex-col gap-6">
        <div class="h-[400px]">
           <ConfigPanel bind:config {t} />
        </div>
        <div class="h-[400px]">
           <HistoryPanel bind:this={historyPanelRef} {t} onRestore={handleRestore} />
        </div>
      </div>

      <!-- Right Column: Editor & Preview -->
      <div class="lg:col-span-9 flex flex-col gap-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow min-h-[600px]">
          <EditorPane bind:rawSvg {t} />
          <PreviewPane
            {optimizedSvg}
            error={optimizationError}
            {originalSize}
            {optimizedSize}
            {t}
            onToast={showToast}
          />
        </div>
      </div>

    </div>
  </div>

  <!-- Guide & FAQ -->
  <div class="max-w-4xl mx-auto px-4 py-16">
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <h2 class="text-2xl font-bold mb-6">{t?.guide?.title}</h2>
      <p class="text-lg text-slate-600 dark:text-slate-400 mb-8">{t?.guide?.intro}</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
            {t?.guide?.featuresTitle}
          </h3>
          <ul class="space-y-3">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <li class="flex gap-2"><span class="text-indigo-500">•</span> {@html t?.guide?.f1}</li>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <li class="flex gap-2"><span class="text-indigo-500">•</span> {@html t?.guide?.f2}</li>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <li class="flex gap-2"><span class="text-indigo-500">•</span> {@html t?.guide?.f3}</li>
          </ul>
        </div>

        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            {t?.guide?.tipsTitle}
          </h3>
          <ul class="space-y-3">
            <li class="flex gap-2"><span class="text-yellow-500">•</span> {t?.guide?.tip1}</li>
            <li class="flex gap-2"><span class="text-yellow-500">•</span> {t?.guide?.tip2}</li>
            <li class="flex gap-2"><span class="text-yellow-500">•</span> {t?.guide?.tip3}</li>
          </ul>
        </div>
      </div>

      <GuideSection {...t?.guide} />
  <AdPlaceholder />
  <FAQSection title={t?.faq?.title} items={[
        { q: t?.faq?.q1, a: t?.faq?.a1 },
        { q: t?.faq?.q2, a: t?.faq?.a2 },
        { q: t?.faq?.q3, a: t?.faq?.a3 }
      ]} />
    </div>
  </div>
</div>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="svg-forge" currentCategory="design" />
  </div>
