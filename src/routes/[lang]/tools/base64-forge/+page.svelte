<script lang="ts">
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import Head from '$lib/components/Head.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import EncoderDecoder from '$lib/components/base64-forge/EncoderDecoder.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = (getDictionary(lang) as any).tools.base64Forge;

  $: title = dict.title || 'Base64 Forge';
  $: description = dict.description || 'Encode and decode Base64 strings, files, and images.';

  $: jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": $page.url.origin + "/" + lang + "/tools/base64-forge",
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

  $: howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to use Base64 Forge",
    "description": "Step-by-step guide to using the Base64 Forge tool.",
    "step": [
        {
            "@type": "HowToStep",
            "name": "Configure Tool",
            "text": "Choose to encode or decode, and set options like URL-safe or strict mode."
        },
        {
            "@type": "HowToStep",
            "name": "Process Data",
            "text": "Paste text, drop a file, or enter base64 to see the instant preview."
        },
        {
            "@type": "HowToStep",
            "name": "Export Result",
            "text": "Copy the text result or download the decoded file."
        }
    ]
  };
</script>

<Head {title} {description} url={$page.url.origin + "/" + lang + "/tools/base64-forge"} />

<svelte:head>
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/base64-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/base64-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/base64-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/base64-forge"} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${jsonLd.replace(/</g, '\\u003c')}</scr` + `ipt>`}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${JSON.stringify(howToSchema).replace(/</g, '\\u003c')}</scr` + `ipt>`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 min-h-[44px] min-w-[44px]">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl flex items-center justify-center gap-4">
      <span class="text-indigo-600 dark:text-indigo-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binary"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>
      </span>
      {title}
    </h1>
    <p class="mt-5 max-w-7xl mx-auto text-xl text-slate-500 dark:text-slate-400">
      {description}
    </p>
  </div>

  <EncoderDecoder {dict} />

  <div class="mt-24 space-y-24">
    <GuideSection {...dict.guide} />
    <AdPlaceholder />
    <FAQSection
      title={dict.faqTitle}
      items={[
        { q: dict.q1, a: dict.a1 },
        { q: dict.q2, a: dict.a2 },
        { q: dict.q3, a: dict.a3 }
      ]}
    />
  </div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="base64-forge" currentCategory="dev" />
</div>
