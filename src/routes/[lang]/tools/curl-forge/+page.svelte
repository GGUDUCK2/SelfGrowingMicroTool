<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import CurlBuilder from '$lib/components/curl-forge/CurlBuilder.svelte';
  import HistoryPanel from '$lib/components/curl-forge/HistoryPanel.svelte';
  import { saveToHistory, type ToolHistoryItem } from '$lib/db/workspace';
  import type { RequestData } from '$lib/utils/curl-forge/parser';


  $: lang = $page.params.lang || 'en';
  $: dict = (getDictionary(lang) as any)?.tools?.curlForge || getDictionary('en').tools.curlForge;

  $: title = (dict as any)?.title || "Curl Forge";
  $: description = (dict as any)?.description || "cURL command builder and exporter.";


  import { onMount, onDestroy } from 'svelte';

  let builderComponent: CurlBuilder;

  function handleKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (builderComponent && typeof builderComponent.handleSend === 'function') {
            builderComponent.handleSend();
        }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (builderComponent && typeof builderComponent.copyActiveCode === 'function') {
            builderComponent.copyActiveCode();
        }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        requestData = { method: 'GET', url: '', headers: {}, body: '' };
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
  });
  onDestroy(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeyDown);
    }
  });

  let requestData = {
    method: 'GET',
    url: '',
    headers: {} as Record<string, string>,
    body: ''
  };

  async function handleSave(newData: RequestData) {
    requestData = { ...newData };
    if (newData.url) {
        // Save to the global workspace
        await saveToHistory('curl-forge', newData, null);
    }
  }

  function handleLoadHistory(item: ToolHistoryItem) {
    if (item.input) {
        const i = item.input as RequestData;
        requestData = {
            method: i.method,
            url: i.url,
            headers: { ...i.headers },
            body: i.body || ''
        };
    }
  }

  $: schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/curl-forge",
        "name": title,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web",
        "description": description,
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Visual Request Builder",
          "cURL Command Parser with Smart Paste",
          "Code Export (Fetch, Python, Axios, Playwright, Cypress)",
          "Local IndexedDB Workspace",
          "Smart Dynamic Variables",
          "Response Actions (Copy/Download JSON)",
          "Auto TypeScript Interface Generation"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${$page.url.origin}/${lang}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": title,
            "item": `${$page.url.origin}/${lang}/tools/curl-forge`
          }
        ]
      }
    ]
  };
</script>

<Head
  {title}
  {description}
/>

<svelte:head>


  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/curl-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/curl-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/curl-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/curl-forge"} />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(schemaObj)}</scr` + `ipt>`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <div class="mb-8">

    <a aria-label="Back to home" href={`/${lang || 'en'}`} data-sveltekit-preload-data="hover" class="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors min-h-[44px] min-w-[44px]">
      <span class="mr-2">&larr;</span> {getDictionary(lang).common?.back || 'Back to Home'}
    </a>
    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
      {title}
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
      {description}
    </p>
  </div>

  <div class="space-y-8">
    <CurlBuilder {dict} bind:data={requestData} onSave={handleSave} bind:this={builderComponent} />
    <HistoryPanel {dict} onLoad={handleLoadHistory} />
  </div>

  <div class="mt-16 space-y-12 border-t border-slate-200 dark:border-slate-800 pt-16">
    <GuideSection {...(dict as any)?.guide} />
    <AdPlaceholder />
  <FAQSection title={(dict as any)?.faqTitle || 'FAQ'} items={(dict as any)?.faq || []} />
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="curl-forge" currentCategory="dev" />
  </div>
</div>
