<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import DockerBuilder from '$lib/components/docker-forge/DockerBuilder.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = dict?.tools?.dockerForge || dictionaries.en.tools.dockerForge;

  // SEO
  $: title = d?.title || "Docker Forge";
  $: description = d?.description || "Visual Dockerfile Builder";

  // JSON-LD
  $: schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/docker-forge",
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
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": d?.q1 || "What is Docker Forge?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": d?.a1 || "Docker Forge is a visual tool to easily create Dockerfiles, Docker Compose files, and CI/CD pipelines without writing code manually."
            }
          },
          {
            "@type": "Question",
            "name": d?.q2 || "Can I convert an existing Dockerfile?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": d?.a2 || "Yes! You can use the Smart Paste feature to drop in an existing Dockerfile, and it will be parsed into the visual editor."
            }
          },
          {
            "@type": "Question",
            "name": d?.q3 || "Is it free and offline?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": d?.a3 || "Yes, Docker Forge is entirely free and works locally in your browser. It uses IndexedDB to save your workspace history securely."
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
            "item": `https://web-factory.vercel.app/${lang}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tools",
            "item": `https://web-factory.vercel.app/${lang}/tools`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": d?.title || "Docker Forge",
            "item": `https://web-factory.vercel.app/${lang}/tools/docker-forge`
          }
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
  ogImage="https://web-factory.vercel.app/og-image.png"
  ogUrl={`https://web-factory.vercel.app/${lang}/tools/docker-forge`}
/>

<svelte:head>
  <title>{title} | Web Factory</title>
  <meta name="description" content={description} />
  <meta name="keywords" content="docker, dockerfile, generator, visual builder, docker compose, multi-stage build, container, devops" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={`https://web-factory.vercel.app/${lang}/tools/docker-forge`} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <link rel="canonical" href={`https://web-factory.vercel.app/${lang}/tools/docker-forge`} />
  <link rel="alternate" hreflang="en" href="https://web-factory.vercel.app/en/tools/docker-forge" />
  <link rel="alternate" hreflang="ko" href="https://web-factory.vercel.app/ko/tools/docker-forge" />
  <link rel="alternate" hreflang="x-default" href="https://web-factory.vercel.app/en/tools/docker-forge" />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">` + jsonLd + `</` + `script>`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
      {d?.title}
    </h1>
    <p class="mt-5 max-w-xl mx-auto text-xl text-slate-500 dark:text-slate-400">
      {d?.description}
    </p>
  </div>

  <DockerBuilder {lang} />

  <div class="mt-24 space-y-24">
    <GuideSection {...d?.guide} />
    <FAQSection
      title={d?.faqTitle}
      items={[
        { q: d?.q1, a: d?.a1 },
        { q: d?.q2, a: d?.a2 },
        { q: d?.q3, a: d?.a3 }
      ]}
    />

    <RelatedTools {lang} currentSlug="docker-forge" currentCategory="dev" />
  </div>
</div>
