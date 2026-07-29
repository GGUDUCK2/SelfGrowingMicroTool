<script lang="ts">
  import XPathForge from "$lib/components/xpath-forge/XPathForge.svelte";
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import Head from '$lib/components/Head.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = (dict as any)?.tools?.xpathForge;

  $: title = t?.title || 'XPath Forge';
  $: description = t?.description || 'Test and execute XPath expressions against XML or HTML documents.';

  $: jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": $page.url.origin + "/" + lang + "/tools/xpath-forge",
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

  $: breadcrumbJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": $page.url.origin
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
        "item": `${$page.url.origin}/${lang}/tools/xpath-forge`
      }
    ]
  });
</script>

<Head {title} {description} url={$page.url.origin + "/" + lang + "/tools/xpath-forge"} />

<svelte:head>
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/xpath-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/xpath-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/xpath-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/xpath-forge"} />
  {@html `<script type="application/ld+json">${jsonLd}</scr` + `ipt>`}
  {@html `<script type="application/ld+json">${breadcrumbJsonLd}</scr` + `ipt>`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
      {title}
    </h1>
    <p class="mt-5 max-w-xl mx-auto text-xl text-slate-500 dark:text-slate-400">
      {description}
    </p>
  </div>

  <XPathForge />

  <div class="mt-24 space-y-24">
    <GuideSection {...t?.guide} />
    <AdPlaceholder />
    <FAQSection
      title={t?.faqTitle || 'FAQ'}
      items={[
        { q: t?.q1 || '', a: t?.a1 || '' },
        { q: t?.q2 || '', a: t?.a2 || '' },
        { q: t?.q3 || '', a: t?.a3 || '' }
      ]}
    />
  </div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="xpath-forge" currentCategory="dev" />
</div>
