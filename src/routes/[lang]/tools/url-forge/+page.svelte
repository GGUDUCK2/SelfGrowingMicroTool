<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { fade, fly } from 'svelte/transition';

  import UrlParser from '$lib/components/url-forge/UrlParser.svelte';
  import QueryEditor from '$lib/components/url-forge/QueryEditor.svelte';
  import UtmBuilder from '$lib/components/url-forge/UtmBuilder.svelte';
  import EncoderDecoder from '$lib/components/url-forge/EncoderDecoder.svelte';
  import HistorySidebar from '$lib/components/url-forge/HistorySidebar.svelte';

  import { saveToHistory } from '$lib/db/workspace';

  $: lang = $page.params.lang as 'en' | 'ko';
  $: dict = (dictionaries as any)[lang].tools.urlForge;

  let currentUrl = "";
  let showHistory = false;

  $: faqItems = dict ? [
    { q: (dict as any)?.q1, a: (dict as any)?.a1 },
    { q: (dict as any)?.q2, a: (dict as any)?.a2 },
    { q: (dict as any)?.q3, a: (dict as any)?.a3 }
  ] : [];

  $: jsonLd = dict ? {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/url-forge",
        "name": "URL Forge",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web, iOS, Android, macOS, Windows, Linux",
        "applicationSubCategory": "URL Utility",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": (dict as any)?.description,
        "featureList": [
            "URL Parsing",
            "Query Parameter Editor",
            "UTM Builder",
            "URL Encode Decode",
            "Local History"
        ],
        "isAccessibleForFree": true,
        "author": {
            "@type": "Organization",
            "name": "MicroFactory"
        }
      }
    ]
  } : null;

  const canonicalUrl = `${$page.url.origin}/${$page.params.lang}/tools/url-forge`;

  function handleUrlChange(event: CustomEvent<{ url: string }>) {
    currentUrl = event.detail.url;
  }

  function handleUrlSubmit(event: CustomEvent<{ url: string }>) {
    currentUrl = event.detail.url;
    if (currentUrl.trim() !== '') {
        saveToHistory('url-forge', { rawUrl: currentUrl }, { url: currentUrl });
    }
  }

  function handleRestore(event: CustomEvent<{ data: Record<string, unknown> }>) {
    const detailData = event.detail.data as any;
    if (detailData.input && detailData.input.rawUrl) {
      currentUrl = (event.detail.data.input as any).rawUrl;
    }
    showHistory = false;
  }

  // Keyboard shortcuts
  function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          if (currentUrl.trim() !== '') {
              saveToHistory('url-forge', { rawUrl: currentUrl }, { url: currentUrl });
              // Simple toast feedback logic can be omitted for brevity or added here
          }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
          e.preventDefault();
          showHistory = !showHistory;
      }
  }
</script>
<Head
  title={(dict as any)?.title}
  description={(dict as any)?.description}
  url={canonicalUrl}
  keywords="url parser, query string editor, utm builder, url encode, url decode"
/>


<svelte:window on:keydown={handleGlobalKeydown} />


<svelte:head>

  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/url-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/url-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/url-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/url-forge"} />
  {#if jsonLd}
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</scr` + `ipt>`}
  {/if}
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <!-- Header & Tools -->
  <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
     <h1 class="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
         </svg>
         {dict.title}
     </h1>
     <div class="flex gap-2">
         <button on:click={() => showHistory = !showHistory}
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors flex items-center gap-2 touch-manipulation min-h-[44px] min-w-[44px]"
            aria-label="Toggle History"
         >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="hidden sm:inline">{dict.history}</span>
         </button>
     </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Main Left Column -->
    <div class="lg:col-span-8 space-y-6">
        <UrlParser {dict} bind:url={currentUrl} on:submit={handleUrlSubmit} />
        <QueryEditor {dict} bind:url={currentUrl} on:change={handleUrlChange} />
        <EncoderDecoder {dict} bind:url={currentUrl} />
    </div>

    <!-- Sidebar Right Column -->
    <div class="lg:col-span-4 space-y-6">
        <UtmBuilder {dict} bind:url={currentUrl} on:change={handleUrlChange} />
    </div>
  </div>

  <!-- Documentation Section -->
  <section class="mt-20">
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
    <div class="mt-12 max-w-7xl mx-auto">
        <AdPlaceholder />
  <FAQSection title={dict.faqTitle} items={faqItems} />
    </div>
  </section>

  <!-- History Sidebar -->
  {#if showHistory}
    <button transition:fade={{ duration: 200 }}
      class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 w-full h-full cursor-default min-h-[44px] min-w-[44px]"
      on:click={() => showHistory = false}
      on:keydown={(e) => e.key === 'Escape' && (showHistory = false)}
      aria-label="Close History Overlay"
    ></button>
    <div transition:fly={{ x: 300, duration: 300 }} class="z-50 fixed right-0 top-0 bottom-0 shadow-2xl">
        <HistorySidebar {dict} on:close={() => showHistory = false} on:restore={handleRestore} />
    </div>
  {/if}
</div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="url-forge" currentCategory="dev" />
  </div>

</div>
