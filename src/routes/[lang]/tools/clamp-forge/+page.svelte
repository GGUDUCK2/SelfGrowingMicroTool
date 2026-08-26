<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import ClampBuilder from '$lib/components/clamp-forge/ClampBuilder.svelte';
  $: lang = $page.params.lang || 'en';
  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = (dict as any)?.tools?.clampForge || dictionaries.en.tools.clampForge;
  $: t = d;

  // SEO
  $: title = d?.title || "Clamp Forge";
  $: description = d?.description || "Fluid Typography & CSS Clamp Generator";

  // JSON-LD
  // i18n
  $: i18nKeys = {
    copy: d?.buttons?.copy || "Copy",
    download: d?.buttons?.download || "Download",
    share: d?.buttons?.share || "Share",
    example_1: d?.buttons?.example_1 || "Example 1",
    star: d?.buttons?.star || "Star",
    delete: d?.buttons?.delete || "Delete",
    copied: d?.feedback?.copied || "Copied to clipboard!",
    processing: d?.feedback?.processing || "Processing...",
    saved: d?.feedback?.saved || "Saved to history!",
    historyTitle: d?.history?.title || "History",
    historyEmpty: d?.history?.empty_state || "No history yet.",
    help: d?.shortcuts?.help || "Keyboard Shortcuts"};

  $: schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/clamp-forge",
        "name": d?.title || "Clamp Forge",
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
          "Fluid Typography Generation",
          "Reverse Clamp Engineering",
          "Tailwind Config Export",
          "CSS Variables Export",
          "Visual Scale Simulator",
          "Container Queries (cqi) Support",
          "Smart Presets"
        ]
      }
    ]
  };
</script>

<Head
  title={title}
  description={description}
  keywords="CSS clamp, fluid typography, responsive typography, font scaling, reverse clamp, CSS variables, tailwind config, frontend developer tools"
  url={$page.url.origin + "/" + lang + "/tools/clamp-forge"}
/>


<svelte:head>
  <link rel="canonical" href={`${$page.url.origin}/${lang}/tools/clamp-forge`} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/clamp-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/clamp-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/clamp-forge"} />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(schemaObj).replace(/</g, '\\u003c')}</scr` + `ipt>`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
      {d.title}
    </h1>
    <p class="mt-5 max-w-7xl mx-auto text-xl text-slate-500 dark:text-slate-400">
      {d.description}
    </p>
  </div>

  <ClampBuilder {lang} />

  <div class="mt-24 space-y-24">
    <GuideSection {...t?.guide} />
    <AdPlaceholder />
    <FAQSection
      title={d.faqTitle}
      items={[
        { q: d?.q1, a: d?.a1 },
        { q: d?.q2, a: d?.a2 },
        { q: d?.q3, a: d?.a3 }
      ]}
    />
  </div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="clamp-forge" currentCategory="dev" />
</div>
