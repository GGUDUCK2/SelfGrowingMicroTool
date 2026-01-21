<script lang="ts">
  import { timeStore } from '$lib/utils/time-forge/store';
  import TimeForge from '$lib/components/time-forge/TimeForge.svelte';
  import Head from '$lib/components/Head.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';

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
        import('$lib/utils/time-forge/cities').then(({ POPULAR_CITIES }) => {
             const selectedCities = decoded.cities.map((id: string) => POPULAR_CITIES.find(c => c.id === id)).filter(Boolean);
             if (selectedCities.length > 0) {
                 timeStore.loadState({
                     selectedCities,
                     homeCityId: decoded.home,
                     referenceTime: new Date(decoded.time)
                 });
             }
        });
      } catch (e) {
        console.error('Failed to parse state from URL', e);
      }
    }
  });

  $: faqs = [
    {
      question: t.q1,
      answer: t.a1
    },
    {
      question: t.q2,
      answer: t.a2
    },
    {
      question: t.q3,
      answer: t.a3
    }
  ];

  $: schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": t.title,
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "description": t.description
  };

</script>

<svelte:head>
    {@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
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
    <h2 class="text-2xl font-bold text-white mb-6">Master Your Global Schedule</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div class="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
        <h3 class="text-lg font-semibold text-indigo-400 mb-2">Visual Planning</h3>
        <p class="text-slate-400 text-sm">Instantly see day/night cycles and business hour overlaps across unlimited locations.</p>
      </div>
      <div class="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
        <h3 class="text-lg font-semibold text-indigo-400 mb-2">Team Workspaces</h3>
        <p class="text-slate-400 text-sm">Save different city groups for different project teams and switch between them instantly.</p>
      </div>
      <div class="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
        <h3 class="text-lg font-semibold text-indigo-400 mb-2">Smart Sharing</h3>
        <p class="text-slate-400 text-sm">Generate unique links to share your exact time configuration with colleagues.</p>
      </div>
    </div>

    <FAQSection {faqs} />
  </div>

</div>
