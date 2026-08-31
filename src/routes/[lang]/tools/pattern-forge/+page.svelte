<script lang="ts">
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import Head from '$lib/components/Head.svelte';
  import PatternForge from '$lib/components/pattern-forge/PatternForge.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';

  $: lang = $page.params.lang as 'en' | 'ko';
  $: dict = getDictionary(lang);
  $: t = (dict as any)?.patternForge || {};

  // Safe cast for strict TS compiler validation in SvelteKit
  $: faqs = Array.isArray(t.faqs) ? t.faqs : [];

  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": t.title || "Pattern Forge",
    "description": t.desc || "Create beautiful, customizable CSS and SVG background patterns.",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": $page.url.origin + "/" + lang + "/tools/pattern-forge"
  };


  $: howToSchema = {
    "@context": "https://schema.org",

    "@type": "HowTo",
    "name": "How to use Pattern Forge",
    "description": "Step-by-step guide to using the Pattern Forge tool.",
    "step": [
        {
            "@type": "HowToStep",
            "name": "Configure Tool",
            "text": "Adjust the settings or input your data according to your requirements."
        },
        {
            "@type": "HowToStep",
            "name": "Process Data",
            "text": "Review the live preview or click the generate/process button."
        },
        {
            "@type": "HowToStep",
            "name": "Export Result",
            "text": "Copy or download the final output."
        }
    ]

  };

</script>

<svelte:head>
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</scr` + `ipt>`}
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/pattern-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/pattern-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/pattern-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/pattern-forge"} />

  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(howToSchema).replace(/</g, '\\u003c')}</scr` + `ipt>`}
</svelte:head>

<Head
  title={t.title || 'Pattern Forge'}
  description={t.desc || 'Create beautiful, customizable CSS and SVG background patterns.'}
  url={$page.url.origin + "/" + lang + "/tools/pattern-forge"}
/>

<PatternForge t={t} />

<!-- Standard Page Documentation -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <AdPlaceholder />

  <GuideSection {...t.guide} />

  <FAQSection title="Frequently Asked Questions" items={faqs} />

  <AdPlaceholder />

  <RelatedTools lang={lang} currentSlug="pattern-forge" currentCategory="productivity" />
</div>
