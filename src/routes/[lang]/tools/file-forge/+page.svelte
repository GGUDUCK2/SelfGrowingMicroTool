<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { fade } from 'svelte/transition';
  import { FileBox } from '@lucide/svelte';
  import DropZone from '$lib/components/file-forge/DropZone.svelte';
  import SmartExamples from '$lib/components/file-forge/SmartExamples.svelte';
  import FileDashboard from '$lib/components/file-forge/FileDashboard.svelte';
  import HistoryPanel from '$lib/components/file-forge/HistoryPanel.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import type { AnalysisData } from '$lib/utils/file-forge/report';

  $: lang = $page.params.lang || 'en';
  $: dict = ((getDictionary(lang) as any)?.tools?.fileForge || {}) as any;
  $: common = getDictionary(lang).common;

  let currentFile: File | null = null;
  let restoredData: AnalysisData | null = null;

  function handleFile(event: CustomEvent<File>) {
    currentFile = event.detail;
    restoredData = null;
  }

  function handleRestore(event: CustomEvent<AnalysisData>) {
    restoredData = event.detail;
    currentFile = null;
  }

  function handleRestoreFile(event: CustomEvent<File>) {
    currentFile = event.detail;
    restoredData = null;
  }

  function handleReset() {
    currentFile = null;
    restoredData = null;
  }

    $: softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/file-forge",
        "isAccessibleForFree": true,
    "name": dict.title,
    "description": dict.description,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": "File Hashing, Hex Viewer, Entropy Analysis, Magic Number Detection, Base64 Encoding, Image Conversion & Resizing, Metadata Inspection, Steganography, Risk Scoring, Entropy Visualization, Zip Analysis"
  };

  $: faqItems = [
    { q: (dict as any)?.q1, a: (dict as any)?.a1 },
    { q: (dict as any)?.q2, a: (dict as any)?.a2 },
    { q: (dict as any)?.q3, a: (dict as any)?.a3 }
  ];



  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      handleReset();
    }
    if (e.key === 'Escape') {
      handleReset();
    }
  }
</script>
<Head
  title={dict.title}
  description={dict.description}
  keywords="file hash, hex viewer, entropy analysis, magic number, md5, sha256, base64 converter, image converter, resize image, metadata viewer, file analysis, privacy first, steganography, zip analysis, risk assessment, pdf metadata, entropy map, metadata stripper, hex editor, exif remover, magic lens, file compare, smart history"
/>


<svelte:window on:keydown={handleKeydown} />

<svelte:head>


    <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/file-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/file-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/file-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/file-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/file-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/file-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/file-forge"} />

  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(softwareSchema).replace(/</g, '\\u003c')}</scr` + `ipt>`}


</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20">
  <!-- Header -->
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -ml-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <div class="flex items-center space-x-2">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
             <FileBox size={20} />
          </div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {dict.title}
          </h1>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Main Area -->
      <div class="lg:col-span-8 space-y-8">
        {#if !currentFile && !restoredData}
          <div in:fade={{ duration: 200 }} class="space-y-6">
            <DropZone {dict} on:file={handleFile} />
            <SmartExamples on:file={handleFile} {dict} />
          </div>
        {:else}
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-700 dark:text-slate-200">
              {#if restoredData}
                {dict.restoredMode || 'History View'}
              {:else}
                Active File
              {/if}
            </h2>
            <button on:click={handleReset}
              class="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline min-h-[44px] min-w-[44px]"
            >
              Analyze Another
            </button>
          </div>
          <div in:fade={{ duration: 200 }}>
            <FileDashboard file={currentFile} {dict} {restoredData} />
          </div>
        {/if}

        <div class="mt-12">
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

           <div class="mt-8">
             <AdPlaceholder />
  <FAQSection title={dict.faqTitle} items={faqItems} />
           </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="lg:col-span-4 space-y-6">
        <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
           <HistoryPanel {dict} on:restore={handleRestore} on:restoreFile={handleRestoreFile} />
        </div>
      </div>
    </div>
    <div class="mt-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="file-forge" currentCategory="util" />
  </div>
</main>
</div>
