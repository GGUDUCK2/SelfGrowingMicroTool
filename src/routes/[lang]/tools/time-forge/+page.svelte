<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import { timeStore } from '$lib/utils/time-forge/store';
  import TimeForge from '$lib/components/time-forge/TimeForge.svelte';
  import Head from '$lib/components/Head.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { POPULAR_CITIES } from '$lib/utils/time-forge/cities';

  // State initialization
  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict.tools.timeForge;

  // Load state from URL if present
  onMount(() => {
    const stateParam = $page.url.searchParams.get('state');
    if (stateParam) {
      try {
        const decoded = JSON.parse(atob(stateParam));
        const selectedCities = decoded.cities.map((id: string) => POPULAR_CITIES.find(c => c.id === id)).filter(Boolean);
        if (selectedCities.length > 0) {
            timeStore.loadState({
                selectedCities,
                homeCityId: decoded.home,
                referenceTime: new Date(decoded.time)
            });
        }
      } catch (e) {
        console.error('Failed to parse state from URL', e);
      }
    }
  });

  $: faqs = [
    {
      q: t.q1,
      a: t.a1
    },
    {
      q: t.q2,
      a: t.a2
    },
    {
      q: t.q3,
      a: t.a3
    }
  ];

  $: schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/time-forge",
        "isAccessibleForFree": true,
    "name": t.title,
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Any",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "description": t.description,
    "featureList": [t.features.visualPlanning.title, t.features.teamWorkspaces.title, t.features.smartSharing.title],
    "screenshot": "https://microfactory.dev/og/time-forge.png",
    "author": {
        "@type": "Organization",
        "name": "MicroFactory"
    }
  };

</script>

<svelte:head>
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(schema)}</scr` + `ipt>`}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": dict?.tools?.timeForge?.q1 || "", "acceptedAnswer": { "@type": "Answer", "text": dict?.tools?.timeForge?.a1 || "" } }, { "@type": "Question", "name": dict?.tools?.timeForge?.q2 || "", "acceptedAnswer": { "@type": "Answer", "text": dict?.tools?.timeForge?.a2 || "" } }, { "@type": "Question", "name": dict?.tools?.timeForge?.q3 || "", "acceptedAnswer": { "@type": "Answer", "text": dict?.tools?.timeForge?.a3 || "" } } ] })}</scr` + `ipt>`}
</svelte:head>

<Head
  title="{t.title} - {t.description}"
  description={t.description}
  image="https://microfactory.dev/og/time-forge.png"
/>

<div class="max-w-4xl mx-auto px-4 py-12">

  <div class="mb-10 text-center">
    <h1 class="text-4xl font-extrabold text-white mb-4 tracking-tight">{t.title}</h1>
    <p class="text-lg text-slate-400 max-w-2xl mx-auto">
      {t.description}
    </p>
  </div>

  <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl mb-16">
    <TimeForge />
  </div>

  <div class="prose prose-invert max-w-none">
    <h2 class="text-2xl font-bold text-white mb-6">{t.features.title}</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div class="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
        <h3 class="text-lg font-semibold text-indigo-400 mb-2">{t.features.visualPlanning.title}</h3>
        <p class="text-slate-400 text-sm">{t.features.visualPlanning.desc}</p>
      </div>
      <div class="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
        <h3 class="text-lg font-semibold text-indigo-400 mb-2">{t.features.teamWorkspaces.title}</h3>
        <p class="text-slate-400 text-sm">{t.features.teamWorkspaces.desc}</p>
      </div>
      <div class="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
        <h3 class="text-lg font-semibold text-indigo-400 mb-2">{t.features.smartSharing.title}</h3>
        <p class="text-slate-400 text-sm">{t.features.smartSharing.desc}</p>
      </div>
    </div>

    <GuideSection {...t?.guide} />
  <AdPlaceholder />
  <FAQSection title={t.faqTitle} items={faqs} />
  </div>



  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
    <RelatedTools {lang} currentSlug="time-forge" currentCategory="productivity" />
  </div>
</div>
