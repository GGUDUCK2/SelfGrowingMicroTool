<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import DockerBuilder from '$lib/components/docker-forge/DockerBuilder.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = (dict as any)?.tools?.dockerForge || dictionaries.en.tools.dockerForge;

  // SEO
  $: title = d?.title || "Docker Forge";
  $: description = d?.description || "Visual Dockerfile Builder";

  // JSON-LD
  $: schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/docker-forge",
        "name": d?.title || "Docker Forge",
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
          "Visual Dockerfile Builder",
          "Multi-stage Build Support",
          "Docker Compose Generator",
          "Local IndexedDB Workspace",
          "GitHub Actions CI/CD Pipeline Generator",
          "Intelligent Linter & Security Check",
          ".dockerignore Configuration",
          "Smart Auto-Optimize Refactoring",
          "Compose Service Architecture Visualizer",
          "Build & Run Makefile Generator",
          "Kubernetes Manifest Generator"
        ]
      }
    ]
  };
  $: jsonLd = JSON.stringify(schemaObj);
</script>

<Head
  title={title}
  description={description}
  keywords="docker, dockerfile, generator, visual builder, docker compose, multi-stage build, container, devops"
  image="{$page.url.origin}/og-image.png"

/>

<svelte:head>
  <title>{title} | Web Factory</title>
  <meta name="description" content={description} />
  <meta name="keywords" content="docker, dockerfile, generator, visual builder, docker compose, multi-stage build, container, devops" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={`${$page.url.origin}/${lang}/tools/docker-forge`} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <link rel="canonical" href={`${$page.url.origin}/${lang}/tools/docker-forge`} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/docker-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/docker-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/docker-forge"} />

  {@html `<script type="application/ld+json">${jsonLd.replace(/</g, '\\u003c')}</scr` + `ipt>`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
      {d?.title}
    </h1>
    <p class="mt-5 max-w-7xl mx-auto text-xl text-slate-500 dark:text-slate-400">
      {d?.description}
    </p>
  </div>

  <DockerBuilder {lang} />

  <div class="mt-24 space-y-24">
    <GuideSection {...d?.guide} />
    <AdPlaceholder />
  <FAQSection
      title={d?.faqTitle}
      items={[
        { q: d?.q1, a: d?.a1 },
        { q: d?.q2, a: d?.a2 },
        { q: d?.q3, a: d?.a3 }
      ]}
    />

    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="docker-forge" currentCategory="dev" />
  </div>
</div>
