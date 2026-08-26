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
  $: dict = (getDictionary(lang) as any)?.tools?.csvForge || (getDictionary('en') as any).tools.csvForge;

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
    { q: (dict as any)?.q1, a: (dict as any)?.a1 },
    { q: (dict as any)?.q2, a: (dict as any)?.a2 },
    { q: (dict as any)?.q3, a: (dict as any)?.a3 }
  ];

  $: schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": $page.url.origin + "/" + lang + "/tools/csp-forge",
    "isAccessibleForFree": true,
    "name": (dict as any)?.title,
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "Security Utility",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. HTML5.",
    "description": (dict as any)?.description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  </script>

<Head
  title={(dict as any)?.title}
  description={(dict as any)?.description}
/>

<svelte:head>
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/csp-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/csp-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/csp-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/csp-forge"} />
  <!-- eslint-disable svelte/no-at-html-tags -->
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</scr` + `ipt>`}



</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <!-- Header -->
  <div class="text-center space-y-4">
    <div class="inline-flex items-center justify-center p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-3xl mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600 dark:text-indigo-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </div>
    <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      {(dict as any)?.title}
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-400 max-w-7xl mx-auto">
      {(dict as any)?.description}
    </p>
  </div>

  <div class="grid lg:grid-cols-12 gap-8">
    <div class="lg:col-span-8 space-y-6">

      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
         <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">{(dict as any)?.directives}</h2>
            <div class="flex flex-wrap gap-2">
               <span class="text-sm text-slate-500 self-center mr-2">{(dict as any)?.presets}:</span>
               <button on:click={() => applyPreset('basic')} class="px-3 py-1.5 min-h-[44px] text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors min-w-[44px]">{(dict as any)?.presetBasic}</button>
               <button on:click={() => applyPreset('strict')} class="px-3 py-1.5 min-h-[44px] text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors min-w-[44px]">{(dict as any)?.presetStrict}</button>
               <button on:click={() => applyPreset('none')} class="px-3 py-1.5 min-h-[44px] text-sm font-medium bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors min-w-[44px]">{(dict as any)?.presetNone}</button>
            </div>
         </div>

         <DirectiveEditor
           bind:directives

           on:change={handleDirectivesChange}
         />
      </div>

      <div>
         <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">{(dict as any)?.preview}</h2>
         <PolicyPreview {policy} dictionary={{cspForge: dict || {}}} />
      </div>

    </div>

    <div class="lg:col-span-4 h-[600px] lg:h-auto sticky top-24">
       <HistorySidebar dictionary={{cspForge: dict || {}}} on:restore={handleRestore} />
    </div>
  </div>

  <GuideSection
    title={(dict as any)?.guideTitle}
    intro={(dict as any)?.guideIntro}
    featuresTitle={(dict as any)?.guideFeaturesTitle}
    f1={(dict as any)?.guideF1}
    f2={(dict as any)?.guideF2}
    f3={(dict as any)?.guideF3}
    tipsTitle={(dict as any)?.guideTipsTitle}
    tip1={(dict as any)?.guideTip1}
    tip2={(dict as any)?.guideTip2}
    tip3={(dict as any)?.guideTip3}
  />

  <AdPlaceholder />
  <FAQSection
    title={(dict as any)?.faqTitle}
    items={faqItems}
  />
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="csp-forge" currentCategory="dev" />
</div>
