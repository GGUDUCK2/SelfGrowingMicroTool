<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import DockerBuilder from '$lib/components/docker-forge/DockerBuilder.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = dict.tools.dockerForge;

  // SEO
  $: title = d.title;
  $: description = d.description;

  // JSON-LD
  $: schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Docker Forge",
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
          "Local IndexedDB Workspace"
        ]
      },
      {
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
            "name": "Docker Forge",
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
  <link rel="alternate" hreflang="en" href="https://web-factory.vercel.app/en/tools/docker-forge" />
  <link rel="alternate" hreflang="ko" href="https://web-factory.vercel.app/ko/tools/docker-forge" />
  <link rel="alternate" hreflang="x-default" href="https://web-factory.vercel.app/en/tools/docker-forge" />
  <!-- eslint-disable svelte/no-at-html-tags -->
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">` + jsonLd + `</` + `script>`}
  <!-- eslint-enable svelte/no-at-html-tags -->
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

  <DockerBuilder {lang} />

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
