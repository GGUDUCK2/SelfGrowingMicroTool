<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import ClampBuilder from '$lib/components/clamp-forge/ClampBuilder.svelte';
  let t: any;


  $: lang = $page.params.lang || 'en';
  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = dict?.tools?.clampForge || dictionaries.en.tools.clampForge;
  $: t = d as any;

  // SEO
  $: title = d?.title || "Clamp Forge";
  $: description = d?.description || "Fluid Typography & CSS Clamp Generator";

  // JSON-LD
  $: schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/clamp-forge",
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
          "Visual Scale Simulator"
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/clamp-forge#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": d?.q1 || '',
            "acceptedAnswer": {
              "@type": "Answer",
              "text": d?.a1 || ''
            }
          },
          {
            "@type": "Question",
            "name": d?.q2 || '',
            "acceptedAnswer": {
              "@type": "Answer",
              "text": d?.a2 || ''
            }
          },
          {
            "@type": "Question",
            "name": d?.q3 || '',
            "acceptedAnswer": {
              "@type": "Answer",
              "text": d?.a3 || ''
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/clamp-forge#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://selfgrowingmicrotool.com/" + lang
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tools",
            "item": "https://selfgrowingmicrotool.com/" + lang + "/tools"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": d?.title || "Clamp Forge",
            "item": "https://selfgrowingmicrotool.com/" + lang + "/tools/clamp-forge"
          }
        ]
      }
    ]
  };
</script>

<Head
  title={title}
  description={description}
  keywords="CSS clamp, fluid typography, responsive typography, font scaling, reverse clamp, CSS variables, tailwind config, frontend developer tools"
  url={"https://selfgrowingmicrotool.com/" + lang + "/tools/clamp-forge"}
/>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${JSON.stringify(schemaObj)}</scr` + `ipt>`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
      {d.title}
    </h1>
    <p class="mt-5 max-w-xl mx-auto text-xl text-slate-500 dark:text-slate-400">
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
        { q: (d as any)?.q1 || '', a: (d as any)?.a1 || '' },
        { q: (d as any)?.q2 || '', a: (d as any)?.a2 || '' },
        { q: (d as any)?.q3 || '', a: (d as any)?.a3 || '' }
      ]}
    />
  </div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="clamp-forge" currentCategory="dev" />
</div>
