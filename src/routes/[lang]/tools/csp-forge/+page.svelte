<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import Head from '$lib/components/Head.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { cspForgeWorkspace } from '$lib/db/csp-forge';

  import DirectiveEditor from '$lib/components/csp-forge/DirectiveEditor.svelte';
  import PolicyPreview from '$lib/components/csp-forge/PolicyPreview.svelte';
  import HistorySidebar from '$lib/components/csp-forge/HistorySidebar.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang)?.tools?.cspForge || getDictionary('en').tools.cspForge;

  let directives: Record<string, string[]> = {};
  let saveTimer: ReturnType<typeof setTimeout>;

  $: policy = Object.entries(directives)
    .filter(([_, sources]) => sources.length > 0)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');

  function handleDirectivesChange(e: CustomEvent) {
     directives = e.detail;
     debouncedSave();
  }

  function handleRestore(e: CustomEvent) {
     const item = e.detail;
     if (item && item.directives) {
         directives = { ...item.directives };
     }
  }

  function applyPreset(type: 'basic' | 'strict' | 'none') {
     if (type === 'none') {
         directives = {};
     } else if (type === 'basic') {
         directives = {
             'default-src': ["'self'"],
             'img-src': ["'self'", "data:"],
             'font-src': ["'self'", "data:"],
             'style-src': ["'self'", "'unsafe-inline'"]
         };
     } else if (type === 'strict') {
         directives = {
             'default-src': ["'none'"],
             'script-src': ["'self'"],
             'connect-src': ["'self'"],
             'img-src': ["'self'"],
             'style-src': ["'self'"],
             'base-uri': ["'self'"],
             'form-action': ["'self'"]
         };
     }
     directives = { ...directives };
     debouncedSave();
  }

  function debouncedSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(savePolicy, 1500);
  }

  async function savePolicy() {
    if (!policy) return;
    await cspForgeWorkspace.save({
        policy,
        directives: JSON.parse(JSON.stringify(directives))
    });
  }

  onDestroy(() => {
    clearTimeout(saveTimer);
  });

  $: faqItems = [
    { q: dict?.q1, a: dict?.a1 },
    { q: dict?.q2, a: dict?.a2 },
    { q: dict?.q3, a: dict?.a3 }
  ];

  $: schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/csp-forge",
    "isAccessibleForFree": true,
    "name": dict?.title,
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "Security Utility",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. HTML5.",
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
        "item": `https://micro-tools.app/${lang}/tools/csp-forge`
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
  <!-- eslint-disable svelte/no-at-html-tags -->
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(schema) + '</script>'}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(breadcrumbSchema) + '</script>'}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(faqSchema) + '</script>'}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <!-- Header -->
  <div class="text-center space-y-4">
    <div class="inline-flex items-center justify-center p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-3xl mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600 dark:text-indigo-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </div>
    <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      {dict?.title}
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
      {dict?.description}
    </p>
  </div>

  <div class="grid lg:grid-cols-12 gap-8">
    <div class="lg:col-span-8 space-y-6">

      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
         <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">{dict?.directives}</h2>
            <div class="flex flex-wrap gap-2">
               <span class="text-sm text-slate-500 self-center mr-2">{dict?.presets}:</span>
               <button on:click={() => applyPreset('basic')} class="px-3 py-1.5 min-h-[44px] text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors">{dict?.presetBasic}</button>
               <button on:click={() => applyPreset('strict')} class="px-3 py-1.5 min-h-[44px] text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors">{dict?.presetStrict}</button>
               <button on:click={() => applyPreset('none')} class="px-3 py-1.5 min-h-[44px] text-sm font-medium bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors">{dict?.presetNone}</button>
            </div>
         </div>

         <DirectiveEditor
           bind:directives

           on:change={handleDirectivesChange}
         />
      </div>

      <div>
         <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">{dict?.preview}</h2>
         <PolicyPreview {policy} dictionary={{cspForge: dict || {}}} />
      </div>

    </div>

    <div class="lg:col-span-4 h-[600px] lg:h-auto sticky top-24">
       <HistorySidebar dictionary={{cspForge: dict || {}}} on:restore={handleRestore} />
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

  <AdPlaceholder />
  <FAQSection
    title={dict?.faqTitle}
    items={faqItems}
  />
</div>

<div class="mt-12 mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <RelatedTools {lang} currentSlug="csp-forge" currentCategory="dev" />
</div>
