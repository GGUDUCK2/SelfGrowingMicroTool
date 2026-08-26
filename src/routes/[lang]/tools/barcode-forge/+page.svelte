<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import Head from '$lib/components/Head.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import { smartSaveToHistory } from '$lib/db/workspace';

  import type { BarcodeState } from '$lib/components/barcode-forge/types';
  import { defaultState } from '$lib/components/barcode-forge/types';
  import BarcodePreview from '$lib/components/barcode-forge/BarcodePreview.svelte';
  import BarcodeConfig from '$lib/components/barcode-forge/BarcodeConfig.svelte';
  import BarcodeHistory from '$lib/components/barcode-forge/BarcodeHistory.svelte';

  $: lang = $page.params.lang as 'en' | 'ko';
  $: dict = (dictionaries as any)[lang];
  $: t = dict?.tools?.barcodeForge || {};
  $: d = dict || {};

  const TOOL_ID = 'barcode-forge';
  let state: BarcodeState = JSON.parse(JSON.stringify(defaultState));
  let isMounted = false;
  let saveTimeout: ReturnType<typeof setTimeout>;

  onMount(() => {
    isMounted = true;
    return () => {
       clearTimeout(saveTimeout);
    };
  });

  // Debounced auto-save to history
  $: if (isMounted && state.type === 'single' && state.value.trim() !== '') {
       clearTimeout(saveTimeout);
       saveTimeout = setTimeout(() => {
           smartSaveToHistory(
               TOOL_ID,
               JSON.parse(JSON.stringify(state)),
               { preview: state.value } // Minimal result object for history display
           );
       }, 2000); // 2-second debounce
  }

  function loadState(loadedState: BarcodeState) {
      state = JSON.parse(JSON.stringify(loadedState));
  }

  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": t.title || "Barcode Forge",
    "description": t.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "isAccessibleForFree": true,
    "url": $page.url.origin + "/" + lang + "/tools/barcode-forge",
    "featureList": [
      "Linear Barcode Generation",
      "EAN, UPC, Code 128 Support",
      "Bulk Barcode ZIP Export",
      "SVG and High-Res PNG Export"
    ]
  };

  $: faqItems = [
      { q: t.q1 || "Is my barcode data sent to your servers?", a: t.a1 || "No. Barcode generation occurs entirely in your browser. No data is stored on our servers." },
      { q: t.q2 || "What is the difference between Code 128 and EAN?", a: t.a2 || "Code 128 is a high-density alphanumeric barcode. EAN is numeric-only, typically used for retail products worldwide." },
      { q: t.q3 || "Can I generate barcodes for my store inventory?", a: t.a3 || "Yes. You can use the Bulk Mode to paste a list of SKUs and download them all as a ZIP file instantly." }
  ];

  </script>

<svelte:head>
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</scr` + `ipt>`}
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/barcode-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/barcode-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/barcode-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/barcode-forge"} />

</svelte:head>

<Head
  title={t.title || "Barcode Forge - Universal Tag Generator"}
  description={t.description || "The definitive tool to generate linear barcodes. Supports EAN, UPC, Code 128, ITF, and more."}
  url={$page.url.origin + "/" + lang + "/tools/barcode-forge"}
  keywords="barcode, generator, ean, upc, code128, bulk barcode, svg export"
/>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4">
        <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t.title || "Barcode Forge"}
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400 max-w-7xl mx-auto">
            {t.description || "The definitive tool to generate linear barcodes. Supports EAN, UPC, Code 128, ITF, and more."}
        </p>
    </div>

    <!-- Main Workspace Area -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <!-- Left Column: Controls & History -->
        <div class="lg:col-span-8 flex flex-col gap-6">
             <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                 <BarcodeConfig bind:state dictionary={dict} />
             </div>

             <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                 <BarcodeHistory dictionary={dict} onLoad={loadState} />
             </div>
        </div>

        <!-- Right Column: Preview & Output -->
        <div class="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-8 self-start">
             <BarcodePreview bind:state dictionary={dict} />

             <!-- Technical Specs Box -->
             <div class="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm">
                 <h4 class="font-semibold text-slate-900 dark:text-slate-200 mb-3">Engine Specifications</h4>
                 <ul class="space-y-2 text-slate-600 dark:text-slate-400">
                     <li class="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
                         <span>Core Library</span>
                         <span class="font-mono text-xs">jsbarcode v3</span>
                     </li>
                     <li class="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
                         <span>Render Target</span>
                         <span class="font-mono text-xs">SVG / Canvas</span>
                     </li>
                     <li class="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
                         <span>Data Processing</span>
                         <span class="font-mono text-xs">Client-Side (WASM)</span>
                     </li>
                     <li class="flex justify-between pb-1">
                         <span>Export Formats</span>
                         <span class="font-mono text-xs">.png, .svg, .zip</span>
                     </li>
                 </ul>
             </div>
        </div>
    </div>

    <AdPlaceholder />

    <GuideSection {...t.guide} />

    <FAQSection title={t.faqTitle || 'Frequently Asked Questions'} items={faqItems} />

    <RelatedTools lang={lang} currentSlug="barcode-forge" currentCategory="dev" />
</div>
