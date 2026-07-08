<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import ContrastChecker from '$lib/components/a11y-forge/ContrastChecker.svelte';
  import AriaExplorer from '$lib/components/a11y-forge/AriaExplorer.svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import SearchCode from '@lucide/svelte/icons/search-code';
import Contrast from '@lucide/svelte/icons/contrast';

  $: lang = $page.params.lang as 'en' | 'ko';
  $: dict = (dictionaries as any)[lang];
  $: t = dict?.tools?.a11yForge || {};

  let activeTab: 'contrast' | 'aria' = 'contrast';

  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": t.title || "A11y Forge",
    "description": t.description,
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Any",
    "isAccessibleForFree": true,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "WCAG 2.1 Color Contrast Checker",
      "Color Palette Contrast Matrix Generator",
      "Color Blindness Vision Simulator",
      "Interactive ARIA Role Explorer"
    ],
    "url": "https://selfgrowingmicrotool.com/" + lang + "/tools/a11y-forge"
  };
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</scr` + `ipt>`}
  <link rel="canonical" href={"https://selfgrowingmicrotool.com/" + lang + "/tools/a11y-forge"} />
  <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/a11y-forge" />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/a11y-forge" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/a11y-forge" />
</svelte:head>

<Head
  title={t.title || "A11y Forge - Web Accessibility Toolkit"}
  description={t.description || "Professional web accessibility toolkit. WCAG color contrast checker and ARIA role explorer."}
  url={"https://selfgrowingmicrotool.com/" + lang + "/tools/a11y-forge"}
  keywords={["accessibility", "a11y", "wcag", "contrast", "color blindness", "aria"]}
/>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

  <!-- Header Section -->
  <div class="text-center space-y-4">
    <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
      {t.title || "A11y Forge"}
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
      {t.description || "The definitive accessibility toolkit."}
    </p>
  </div>

  <AdPlaceholder />

  <!-- Main Tool Container -->
  <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

    <!-- Tab Navigation -->
    <div class="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50" role="tablist">
      <button
        class="flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors border-b-2 min-h-[44px] {activeTab === 'contrast' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-white dark:bg-slate-900' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}"
        on:click={() => activeTab = 'contrast'}
        role="tab" aria-selected={activeTab === 'contrast'}
      >
        <Contrast size={18} />
        {t.tabs?.contrast || 'Contrast & Vision'}
      </button>
      <button
        class="flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors border-b-2 min-h-[44px] {activeTab === 'aria' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-white dark:bg-slate-900' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}"
        on:click={() => activeTab = 'aria'}
        role="tab" aria-selected={activeTab === 'aria'}
      >
        <SearchCode size={18} />
        {t.tabs?.aria || 'ARIA Explorer'}
      </button>
    </div>

    <!-- Active Tool Content -->
    <div class="p-4 sm:p-6 lg:p-8">
      {#if activeTab === 'contrast'}
        <ContrastChecker dict={dict} />
      {:else}
        <AriaExplorer dict={dict} />
      {/if}
    </div>
  </div>

  <AdPlaceholder />

  <GuideSection {...t.guide} />

  <FAQSection title={t.faqTitle} items={t.faqs || []} />

  <RelatedTools lang={lang} currentSlug="a11y-forge" currentCategory="design" />

</div>
