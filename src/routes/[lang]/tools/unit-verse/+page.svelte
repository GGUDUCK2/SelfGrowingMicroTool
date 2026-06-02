<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import CategorySelector from '$lib/components/unit-verse/CategorySelector.svelte';
  import Converter from '$lib/components/unit-verse/Converter.svelte';
  import ReferenceTable from '$lib/components/unit-verse/ReferenceTable.svelte';
  import History from '$lib/components/unit-verse/History.svelte';
  import Guide from '$lib/components/unit-verse/Guide.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { MoveLeft } from '@lucide/svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict.tools.unitVerse;

  $: faqItems = [
    { q: t.q1, a: t.a1 },
    { q: t.q2, a: t.a2 }
  ];

  let selectedCategory = 'length';

  // Handle restore from history
  let inputValue: number | null = 1;
  let fromUnitId: string = '';
  let toUnitId: string = '';

  function handleRestore(event: CustomEvent<any>) {
      const record = event.detail;

      // Update state
      selectedCategory = record.categoryId;
      inputValue = record.fromValue;
      fromUnitId = record.fromUnitId;
      toUnitId = record.toUnitId;

      // Update URL silently
      const params = new URLSearchParams(window.location.search);
      params.set('cat', record.categoryId);
      params.set('val', record.fromValue.toString());
      params.set('from', record.fromUnitId);
      params.set('to', record.toUnitId);
      window.history.replaceState({}, '', `?${params.toString()}`);
  }

  $: schemaObj1 = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/unit-verse",
        "isAccessibleForFree": true,
      "name": "Unit Verse",
      "url": `https://selfgrowingmicrotool.com/${lang}/tools/unit-verse`,
      "applicationCategory": "UtilityApplication",
      "applicationSubCategory": "Unit Converter",
      "operatingSystem": "Web, iOS, Android, Linux, Windows, macOS",
      "browserRequirements": "Requires JavaScript. Works best in modern browsers.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": t.description,
      "featureList": t.featureList,
      "screenshot": "https://selfgrowingmicrotool.com/og/unit-verse.png"
    };
  $: schemaObj2 = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `https://selfgrowingmicrotool.com/${lang}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Tools",
          "item": `https://selfgrowingmicrotool.com/${lang}/tools`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Unit Verse",
          "item": `https://selfgrowingmicrotool.com/${lang}/tools/unit-verse`
        }
      ]
    };
</script>
<Head
  title={`${t.title} | ${dict.home.title}`}
  description={t.description}
  keywords={t.keywords}
/>


<svelte:head>
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(schemaObj1) + '</scr' + 'ipt>'}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(schemaObj2) + '</scr' + 'ipt>'}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": dict?.q1 || "", "acceptedAnswer": { "@type": "Answer", "text": dict?.a1 || "" } }, { "@type": "Question", "name": dict?.q2 || "", "acceptedAnswer": { "@type": "Answer", "text": dict?.a2 || "" } }, { "@type": "Question", "name": dict?.q3 || "", "acceptedAnswer": { "@type": "Answer", "text": dict?.a3 || "" } } ] }) + '</scr' + 'ipt>'}
</svelte:head>

<div class="min-h-screen bg-slate-900 text-slate-100 pb-20">
  <!-- Header -->
  <header class="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <a href="/{lang}" class="p-2 hover:bg-slate-700 rounded-full transition-colors group min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={dict.common.back}>
          <MoveLeft size={20} class="text-slate-400 group-hover:text-white" />
        </a>
        <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
          {t.title}
        </h1>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Left Column: Converter (2/3 width) -->
      <div class="lg:col-span-2 space-y-6">
        <CategorySelector
            {selectedCategory}
            {t}
            on:select={(e) => selectedCategory = e.detail}
        />

        <Converter
            {selectedCategory}
            bind:inputValue
            bind:fromUnitId
            bind:toUnitId
            {t}
        />

        <ReferenceTable
            {selectedCategory}
            {inputValue}
            {fromUnitId}
            {t}
        />

        <!-- Documentation / Guide -->
        <Guide t={t.guide}>
           <div class="mt-8">
             <GuideSection {...t?.guide} />
  <AdPlaceholder />
  <FAQSection title={t.faqTitle} items={faqItems} />
           </div>
        </Guide>
      </div>

      <!-- Right Column: History & Stats (1/3 width) -->
      <div class="lg:col-span-1 space-y-6">
          <History {t} on:restore={handleRestore} />

          <!-- Promo / Cross-link -->
          <div class="bg-gradient-to-br from-indigo-900/50 to-violet-900/50 border border-indigo-500/30 rounded-2xl p-6">
              <h3 class="font-semibold text-white mb-2">{t.promoTitle}</h3>
              <p class="text-sm text-indigo-200 mb-4">
                  {t.promoText}
              </p>
              <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
              <a href="/{lang}/tools/compound-interest-calculator" class="block w-full text-center py-2 min-h-[44px] min-w-[44px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium">
                  {t.promoAction}
              </a>
          </div>
      </div>

    </div>

  <div class="mt-12 mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <RelatedTools {lang} currentSlug="unit-verse" currentCategory="dev" />
  </div>
</main>

</div>
