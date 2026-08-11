<script lang="ts">
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import Head from '$lib/components/Head.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';

  import StopSlider from '$lib/components/gradient-forge/StopSlider.svelte';
  import GradientControls from '$lib/components/gradient-forge/GradientControls.svelte';
  import ExportPanel from '$lib/components/gradient-forge/ExportPanel.svelte';
  import WorkspacePanel from '$lib/components/gradient-forge/WorkspacePanel.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = (getDictionary(lang) as any)?.tools?.gradientForge || {};

  let type: 'linear' | 'radial' | 'conic' = 'linear';
  let angle = 90;
  let position = 'center';
  let stops = [
    { color: '#8b5cf6', position: 0 },
    { color: '#3b82f6', position: 100 }
  ];

  $: cssGradient = generateCss(type, angle, position, stops);

  function generateCss(t: string, a: number, p: string, s: any[]) {
    const stopsStr = s.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    if (t === 'linear') return `linear-gradient(${a}deg, ${stopsStr})`;
    if (t === 'radial') return `radial-gradient(circle at ${p}, ${stopsStr})`;
    if (t === 'conic') return `conic-gradient(from ${a}deg at ${p}, ${stopsStr})`;
    return '';
  }

  function handleControlsUpdate(e: CustomEvent) {
    type = e.detail.type;
    angle = e.detail.angle;
    position = e.detail.position;
  }

  function handleStopsUpdate(e: CustomEvent) {
    stops = e.detail;
  }

  function handleWorkspaceLoad(e: CustomEvent) {
    type = e.detail.type;
    angle = e.detail.angle;
    position = e.detail.position;
    stops = e.detail.stops;
  }

  $: currentGradientObj = { type, angle, position, stops, css: cssGradient };

  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": dict.title,
    "description": dict.description,
    "applicationCategory": "DesignApplication",
    "operatingSystem": "All",
    "url": `${$page.url.origin}/${lang}/tools/gradient-forge`
  };
</script>

<svelte:head>
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</scr` + `ipt>`}
  <link rel="canonical" href={$page.url.origin + `/${lang}/tools/gradient-forge`} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/gradient-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/gradient-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/gradient-forge"} />
</svelte:head>

<Head
  title={dict.title}
  description={dict.description}
  url={$page.url.origin + `/${lang}/tools/gradient-forge`}
/>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

  <!-- Header -->
  <div class="text-center space-y-4">
    <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        Gradient Forge
      </span>
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-300 max-w-7xl mx-auto">
      {dict.description}
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

    <!-- Left Column: Controls & History -->
    <div class="lg:col-span-4 flex flex-col gap-6">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <GradientControls
          t={dict}
          {type} {angle} {position}
          on:update={handleControlsUpdate}
        />
      </div>

      <div class="flex-1 min-h-[300px]">
        <WorkspacePanel t={dict} currentGradient={currentGradientObj} on:load={handleWorkspaceLoad} />
      </div>
    </div>

    <!-- Right Column: Preview & Stops -->
    <div class="lg:col-span-8 flex flex-col gap-6">

      <!-- Live Preview -->
      <div class="bg-white dark:bg-slate-800 p-2 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div
          class="w-full h-64 sm:h-80 md:h-96 rounded-2xl transition-all duration-300 relative group overflow-hidden"
          style="background: {cssGradient};"
        >
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
             <span class="text-white/80 font-mono text-sm px-4 py-2 bg-black/30 rounded-lg shadow-sm border border-white/10 backdrop-blur-md">
               {cssGradient}
             </span>
          </div>
        </div>
      </div>

      <!-- Stop Slider -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
         <StopSlider t={dict} {stops} on:update={handleStopsUpdate} />
      </div>

      <!-- Export -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <ExportPanel t={dict} {cssGradient} />
      </div>

    </div>
  </div>

  <GuideSection
      title={dict.guideTitle}
      intro={dict.guideSubtitle}
      featuresTitle="Features"
      f1={dict.guideFeatures[0] || ""}
      f2={dict.guideFeatures[1] || ""}
      f3={dict.guideFeatures[2] || ""}

      tipsTitle="Pro Tips"
      tip1="Use 'to bottom right' angle for a sleek modern look."
      tip2="Save frequently used gradients in your workspace."
      tip3="Experiment with conic gradients for pie-chart backgrounds."
      technicalTitle="Technical Details"
      tech1="Uses standard W3C CSS gradient specifications."
      tech2="IndexedDB (Dexie) based local storage ensures privacy."
      tech3="Full Tailwind CSS arbitrary values support."
  />

  <AdPlaceholder />

  <FAQSection
      title={dict.faqTitle}
      items={[
          { q: dict.q1, a: dict.a1 },
          { q: dict.q2, a: dict.a2 },
          { q: dict.q3, a: dict.a3 }
      ]}
  />

  <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="gradient-forge" currentCategory="design" />
</div>
