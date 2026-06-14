<script lang="ts">
  import XPathForge from "$lib/components/xpath-forge/XPathForge.svelte";
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import Head from '$lib/components/Head.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict?.tools?.xpathForge;

  $: title = t?.title || 'XPath Forge';
  $: description = t?.description || 'Test and execute XPath expressions against XML or HTML documents.';

  $: jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/xpath-forge",
    "isAccessibleForFree": true,
    "name": title,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  });

  $: faqJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t?.q1 || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.a1 || ''
        }
      },
      {
        "@type": "Question",
        "name": t?.q2 || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.a2 || ''
        }
      },
      {
        "@type": "Question",
        "name": t?.q3 || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.a3 || ''
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
        "item": "https://selfgrowingmicrotool.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": "https://selfgrowingmicrotool.com/en/tools"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": `https://selfgrowingmicrotool.com/${lang}/tools/xpath-forge`
      }
    ]
  });
</script>

<Head {title} {description} url={"https://selfgrowingmicrotool.com/" + lang + "/tools/xpath-forge"} />

<svelte:head>
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${jsonLd}</scr` + `ipt>`}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${faqJsonLd}</scr` + `ipt>`}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${breadcrumbJsonLd}</scr` + `ipt>`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <XPathForge />
</div>
