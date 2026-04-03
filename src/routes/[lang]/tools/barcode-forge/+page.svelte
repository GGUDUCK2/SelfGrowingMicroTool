<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import BarcodeGenerator from '$lib/components/barcode-forge/BarcodeGenerator.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = dictionary.tools.barcodeForge;

  // SEO
  $: title = d.title;
  $: description = d.description;

  // JSON-LD
  $: jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "isAccessibleForFree": true,
    "name": "Barcode Forge",
    "applicationCategory": "BusinessApplication, UtilitiesApplication",
    "operatingSystem": "Web, iOS, Android, macOS, Windows, Linux",
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": "EAN-13, UPC-A, Code 128, ITF-14, Bulk Generator, Vector Export"
  });

  $: faqJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": d.q1,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": d.a1
        }
      },
      {
        "@type": "Question",
        "name": d.q2,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": d.a2
        }
      },
      {
        "@type": "Question",
        "name": d.q3,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": d.a3
        }
      }
    ]
  });

  $: breadcrumbJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://microfactory.io"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": "https://microfactory.io/en/tools"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": d.title,
        "item": `https://microfactory.io/${lang}/tools/barcode-forge`
      }
    ]
  });
</script>

<Head
  title={title}
  description={description}
/>

<svelte:head>
  {@html '<script type="application/ld+json">' + jsonLd + '</script>'}
  {@html '<script type="application/ld+json">' + faqJsonLd + '</script>'}
  {@html '<script type="application/ld+json">' + breadcrumbJsonLd + '</script>'}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
      {d.title}
    </h1>
    <p class="mt-5 max-w-xl mx-auto text-xl text-slate-500 dark:text-slate-400">
      {d.description}
    </p>
  </div>

  <BarcodeGenerator {lang} />

  <div class="mt-24 space-y-24">
    <GuideSection {...d.guide} />
    <FAQSection
      title={d.faqTitle}
      items={[
        { q: d.q1, a: d.a1 },
        { q: d.q2, a: d.a2 },
        { q: d.q3, a: d.a3 }
      ]}
    />
  </div>
</div>
