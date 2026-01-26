<script lang="ts">
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import CategorySelector from '$lib/components/unit-verse/CategorySelector.svelte';
  import Converter from '$lib/components/unit-verse/Converter.svelte';
  import ReferenceTable from '$lib/components/unit-verse/ReferenceTable.svelte';
  import History from '$lib/components/unit-verse/History.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { MoveLeft } from 'lucide-svelte';

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

  function handleRestore(event: CustomEvent) {
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
</script>

<svelte:head>
  <title>{t.title} | {dict.home.title}</title>
  <meta name="description" content={t.description} />
  <meta name="keywords" content={t.keywords} />
  <link rel="canonical" href="https://selfgrowingmicrotool.com/{lang}/tools/unit-verse" />
  <meta property="og:title" content={t.title} />
  <meta property="og:description" content={t.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://selfgrowingmicrotool.com/{lang}/tools/unit-verse" />
  <meta property="og:image" content="https://selfgrowingmicrotool.com/og/unit-verse.png" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="min-h-screen bg-slate-900 text-slate-100 pb-20">
  <!-- Header -->
  <header class="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <a href="/{lang}" class="p-2 hover:bg-slate-700 rounded-full transition-colors group" aria-label={dict.common.back}>
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
        <div class="bg-slate-800 rounded-2xl p-8 border border-slate-700 mt-12 prose prose-invert max-w-none">
           <h2 class="text-2xl font-bold text-white mb-4">{t.guide.title}</h2>
           <p class="text-slate-300 mb-6">{t.guide.intro}</p>

           <div class="grid md:grid-cols-3 gap-6 mb-8">
             <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
               <h3 class="text-indigo-400 font-semibold mb-2">{t.guide.featuresTitle}</h3>
               <ul class="text-sm text-slate-400 space-y-2 list-disc pl-4">
                 <li>{@html t.guide.f1.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>')}</li>
                 <li>{@html t.guide.f2.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>')}</li>
                 <li>{@html t.guide.f3.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>')}</li>
               </ul>
             </div>

             <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
               <h3 class="text-emerald-400 font-semibold mb-2">{t.guide.tipsTitle}</h3>
               <ul class="text-sm text-slate-400 space-y-2 list-disc pl-4">
                  <li>{@html t.guide.tip1.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>')}</li>
                  <li>{@html t.guide.tip2.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>')}</li>
                  <li>{@html t.guide.tip3.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>')}</li>
               </ul>
             </div>

             <FAQSection title={t.faqTitle} items={faqItems} />
           </div>
        </div>
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
              <a href="/{lang}/tools/compound-interest-calculator" class="block w-full text-center py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm font-medium">
                  {t.promoAction}
              </a>
          </div>
      </div>

    </div>
  </main>

  <!-- JSON-LD for SEO -->
  {@html `<script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Unit Verse",
      "url": `https://selfgrowingmicrotool.com/${lang}/tools/unit-verse`,
      "applicationCategory": "UtilityApplication",
      "applicationSubCategory": "Unit Converter",
      "operatingSystem": ["Web", "iOS", "Android", "Linux", "Windows", "macOS"],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": t.description,
      "featureList": t.featureList,
      "screenshot": "https://selfgrowingmicrotool.com/og/unit-verse.png"
    })}
  </script>`}
</div>
