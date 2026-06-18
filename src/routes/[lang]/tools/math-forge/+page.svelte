<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { db } from '$lib/db';
  import { browser } from '$app/environment';

  import Calculator from '$lib/components/math-forge/Calculator.svelte';
  import Grapher from '$lib/components/math-forge/Grapher.svelte';
  import Matrix from '$lib/components/math-forge/Matrix.svelte';
  import Statistics from '$lib/components/math-forge/Statistics.svelte';
  import HistoryPanel from '$lib/components/math-forge/HistoryPanel.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { Calculator as CalcIcon, LineChart, Grid3X3, BarChart, History, ChevronLeft } from '@lucide/svelte';

  $: lang = $page.params.lang || 'en';
  // Use fallback if dictionary is missing to avoid crash
  $: dict = getDictionary(lang)?.tools?.mathForge || getDictionary('en').tools.mathForge;
  $: common = getDictionary(lang)?.common || getDictionary('en').common;

  $: clean = (text: string) => text.replace(/\*\*/g, '');
  $: featureList = [
    clean(dict.guide.f1),
    clean(dict.guide.f2),
    clean(dict.guide.f3)
  ];
  $: canonicalUrl = `https://selfgrowingmicrotool.com/${lang}/tools/math-forge`;

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `https://selfgrowingmicrotool.com/${lang}` },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": `https://selfgrowingmicrotool.com/${lang}#tools` },
      { "@type": "ListItem", "position": 3, "name": dict.title, "item": `https://selfgrowingmicrotool.com/${lang}/tools/math-forge` }
    ]
  };

  $: faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": dict?.q1,
        "acceptedAnswer": { "@type": "Answer", "text": dict?.a1 }
      },
      {
        "@type": "Question",
        "name": dict?.q2,
        "acceptedAnswer": { "@type": "Answer", "text": dict?.a2 }
      },
      {
        "@type": "Question",
        "name": dict?.q3,
        "acceptedAnswer": { "@type": "Answer", "text": dict?.a3 }
      }
    ]
  };

  let activeTab: 'calculator' | 'grapher' | 'matrix' | 'statistics' = 'calculator';
  let showHistory = false;

  // Shared state for calculator
  let calculatorInput = '';

  async function handleHistory(e: CustomEvent) {
      const { input, result } = e.detail;
      if (browser) {
          try {
            await db.mathForgeHistory.add({
                type: activeTab,
                expression: input,
                result: result,
                createdAt: new Date(),
                starred: 0
            });
          } catch(e) {
              console.error('Failed to save history', e);
          }
      }
  }

  function loadFromHistory(expr: string) {
      activeTab = 'calculator';
      // We need to pass this down.
      // Svelte stores or context would be better, but we can use a query selector or re-mount.
      // Actually, passing it as a prop is best but Calculator is already mounted.
      // Let's use a hack for now or just reload the component?
      // Better: Use a store in engine or just specific to this page?
      // Simple way: dispatch event to window or use specific prop.
      // I'll try to find the input and update it.
      setTimeout(() => {
          const inputs = document.querySelectorAll('input[type="text"]');
          // Calculator input is likely the first one in that component.
          // Since activeTab sets Calculator visible, it should be there.
          if (inputs.length > 0) {
              const el = inputs[0] as HTMLInputElement;
              el.value = expr;
              el.dispatchEvent(new Event('input'));
              // Also simulate Enter to calculate? Maybe not.
          }
      }, 50);
  }
</script>
<Head
  title={dict.title}
  description={dict.description}
/>


<svelte:head>

  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</scr` + `ipt>`}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</scr` + `ipt>`}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/math-forge",
        "isAccessibleForFree": true,
      "name": dict?.title || "",
      "description": dict?.description || "",
      "applicationCategory": "EducationalApplication",
      "applicationSubCategory": "Calculator Application",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": ${JSON.stringify(featureList)}
    }
  </script>`}
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20">
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <a href="/{lang}" class="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" aria-label={common.back}>
          <ChevronLeft size={20} />
        </a>
        <div class="flex items-center space-x-2">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
             <CalcIcon size={20} />
          </div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 hidden sm:block">
            {dict.title}
          </h1>
        </div>
      </div>

      <button on:click={() => showHistory = !showHistory} class="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400" aria-label="History">
          <History size={20} />
      </button>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-9 space-y-8">
              <!-- Tabs -->
              <div class="flex p-1 space-x-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto" role="tablist">
                  <button
                    role="tab"
                    aria-selected={activeTab === 'calculator'}
                    aria-controls="calculator-panel"
                    class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all {activeTab === 'calculator' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                    on:click={() => activeTab = 'calculator'}>
                      <CalcIcon size={16} /> {dict.tabs.calculator}
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'grapher'}
                    aria-controls="grapher-panel"
                    class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all {activeTab === 'grapher' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                    on:click={() => activeTab = 'grapher'}>
                      <LineChart size={16} /> {dict.tabs.grapher}
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'matrix'}
                    aria-controls="matrix-panel"
                    class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all {activeTab === 'matrix' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                    on:click={() => activeTab = 'matrix'}>
                      <Grid3X3 size={16} /> {dict.tabs.matrix}
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'statistics'}
                    aria-controls="statistics-panel"
                    class="flex-1 min-w-[100px] min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all {activeTab === 'statistics' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                    on:click={() => activeTab = 'statistics'}>
                      <BarChart size={16} /> {dict.tabs.statistics}
                  </button>
              </div>

              <!-- Content -->
              <div class="min-h-[500px]">
                  {#if activeTab === 'calculator'}
                      <Calculator {dict} on:history={handleHistory} />
                  {:else if activeTab === 'grapher'}
                      <Grapher {dict} />
                  {:else if activeTab === 'matrix'}
                      <Matrix {dict} />
                  {:else if activeTab === 'statistics'}
                      <Statistics {dict} />
                  {/if}
              </div>

              <!-- Guide & FAQ -->
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
  <FAQSection
                      title={dict.faqTitle}
                      items={[
                          { q: (dict as any)?.q1 || '', a: (dict as any)?.a1 || '' },
                          { q: (dict as any)?.q2 || '', a: (dict as any)?.a2 || '' },
                          { q: (dict as any)?.q3 || '', a: (dict as any)?.a3 || '' }
                      ]}
                  />
              </div>
          </div>

          <!-- Sidebar (Mobile Overlay) -->
          {#if showHistory}
              <button
                class="fixed inset-0 z-40 bg-black/50 lg:hidden w-full h-full cursor-default min-h-[44px] min-w-[44px]"
                on:click={() => showHistory = false}
                aria-label="Close History"
              ></button>
              <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
              <aside class="fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 lg:hidden min-h-[44px] min-w-[44px]" class:translate-x-0={showHistory} class:translate-x-full={!showHistory} aria-modal="true" role="dialog" aria-label="History">
                  <HistoryPanel {dict} onSelect={(expr) => { loadFromHistory(expr); showHistory = false; }} />
              </aside>
          {/if}

          <!-- Sidebar (Desktop) -->
          <aside class="hidden lg:block lg:col-span-3 min-h-[44px] min-w-[44px]">
              <div class="sticky top-24 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[calc(100vh-8rem)] overflow-hidden">
                  <HistoryPanel {dict} onSelect={loadFromHistory} />
              </div>
          </aside>
      </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="math-forge" currentCategory="dev" />
  </div>
</main>
</div>
