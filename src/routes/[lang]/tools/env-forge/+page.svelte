<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import EnvBuilder from '$lib/components/env-forge/EnvBuilder.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = ((dict as any)?.tools as any)?.envForge || (dictionaries.en.tools as any).envForge;

  // SEO
  $: title = d?.title || "Env Forge";
  $: description = d?.description || "Advanced environment variables manager.";

  // JSON-LD
  $: schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/env-forge",
        "name": d?.title || "Env Forge",
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
          "Advanced .env Formatter",
          "Duplicate Key Removal",
          "Syntax Validation for .env",
          "Local IndexedDB Workspace",
          "Export to JSON, YAML, Docker, Kubernetes",
          "Smart Drag and Drop",
          "Value Obfuscation for secure sharing"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": d?.q1 || "Are my secrets safe?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": d?.a1 || "Yes! Env Forge is entirely a client-side tool."
            }
          },
          {
            "@type": "Question",
            "name": d?.q2 || "What formats does the exporter support?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": d?.a2 || "You can export your .env data to JSON, YAML, Docker --env-file format, and Kubernetes ConfigMap format."
            }
          },
          {
            "@type": "Question",
            "name": d?.q3 || "How does the validator work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": d?.a3 || "The validator checks for common issues such as keys containing spaces or invalid characters."
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `https://selfgrowingmicrotool.com/${lang}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tools",
            "item": `https://selfgrowingmicrotool.com/${lang}/tools`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": d?.title || "Env Forge",
            "item": `https://selfgrowingmicrotool.com/${lang}/tools/env-forge`
          }
        ]
      }
    ]
  };
  $: jsonLd = JSON.stringify(schemaObj);

  // Toast System
  let toastMsg = '';
  let toastType: 'success' | 'error' = 'success';
  let toastTimeout: ReturnType<typeof setTimeout>;

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
      toastMsg = msg;
      toastType = type;
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
          toastMsg = '';
      }, 3000);
  }
</script>

<Head
  title={title}
  description={description}
  url={`https://selfgrowingmicrotool.com/${lang}/tools/env-forge`}
  keywords="env, environment variables, dotenv, config, kubernetes configmap, docker env file, yaml, json, format env"
  image="https://selfgrowingmicrotool.com/og-image.png"
/>

<svelte:head>
  <link rel="canonical" href={`https://selfgrowingmicrotool.com/${lang}/tools/env-forge`} />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/env-forge" />
  <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/env-forge" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/env-forge" />


  {@html `<script type="application/ld+json">` + jsonLd + `</` + `script>`}
</svelte:head>

<!-- Toast Notification -->
{#if toastMsg}
  <div class="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 {toastType === 'success' ? 'bg-emerald-600' : 'bg-red-600'}">
      {#if toastType === 'success'}
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      {/if}
      {toastMsg}
  </div>
{/if}

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
      {d?.title}
    </h1>
    <p class="mt-5 max-w-xl mx-auto text-xl text-slate-500 dark:text-slate-400">
      {d?.description}
    </p>
  </div>

  <EnvBuilder t={d} {showToast} />

  <div class="mt-24 space-y-24">
    <!-- Inline Guide Section mapping localized keys -->
    <GuideSection title={d?.guideTitle} intro={d?.guideIntro} featuresTitle={d?.featuresTitle} f1={d?.f1} f2={d?.f2} f3={d?.f3} tipsTitle={d?.tipsTitle} tip1={d?.tip1} tip2={d?.tip2} tip3={d?.tip3} />

    <AdPlaceholder />
  <FAQSection
      title={d?.faqTitle}
      items={[
        { q: d?.q1, a: d?.a1 },
        { q: d?.q2, a: d?.a2 },
        { q: d?.q3, a: d?.a3 }
      ]}
    />
  </div>


  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="env-forge" currentCategory="dev" />
  </div>
</div>