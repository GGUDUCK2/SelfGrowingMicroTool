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
  $: t = ((dict as any)?.tools?.timeForge || {});

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
        "@id": $page.url.origin + "/" + lang + "/tools/time-forge",
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
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/time-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/time-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/time-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/time-forge"} />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</scr` + `ipt>`}

</svelte:head>

<Head
  title="{t.title} - {t.description}"
  description={t.description}
  image="https://microfactory.dev/og/time-forge.png"
/>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

  <div class="mb-10 text-center">
    <h1 class="text-4xl font-extrabold text-white mb-4 tracking-tight">{t.title}</h1>
    <p class="text-lg text-slate-400 max-w-7xl mx-auto">
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

    <GuideSection {...(t as any)?.guide} />
  <AdPlaceholder />
  <FAQSection title={t.faqTitle} items={faqs} />
  </div>



  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="time-forge" currentCategory="productivity" />
  </div>
</div>
