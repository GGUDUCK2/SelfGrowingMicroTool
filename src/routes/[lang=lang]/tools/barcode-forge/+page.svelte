<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import BarcodeGenerator from '$lib/components/barcode-forge/BarcodeGenerator.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  $: lang = ($page.params.lang || 'en') as 'en' | 'ko';
  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = (dict as any).tools.barcodeForge;

  // SEO
  $: title = d.title;
  $: description = d.description;

  // JSON-LD
  $: schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/barcode-forge",
        "name": d?.title || "Barcode Forge",
        "applicationCategory": "BusinessApplication, UtilitiesApplication",
        "operatingSystem": "Web, iOS, Android, macOS, Windows, Linux",
        "description": description,
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "EAN-13",
          "UPC-A",
          "Code 128",
          "ITF-14",
          "Bulk Generator",
          "Vector Export"
        ]
      }
    ]
  };
  $: jsonLd = JSON.stringify(schemaObj);

  $: breadcrumbJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://selfgrowingmicrotool.com"
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
        "name": d.title,
        "item": "https://selfgrowingmicrotool.com/" + lang + "/tools/barcode-forge"
      }
    ]
  });
</script>

<Head
  title={title}
  description={description}
/>

<svelte:head>
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${jsonLd}</scr` + `ipt>`}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${breadcrumbJsonLd}</scr` + `ipt>`}
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

  <BarcodeGenerator lang={lang} />

  <div class="mt-24 space-y-24">
    <GuideSection {...d.guide} />
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
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="barcode-forge" currentCategory="dev" />
  </div>
