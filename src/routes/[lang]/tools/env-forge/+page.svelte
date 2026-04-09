<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import EnvBuilder from '$lib/components/env-forge/EnvBuilder.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = (dict?.tools as any)?.envForge || (dictionaries.en.tools as any).envForge;

  // SEO
  $: title = d?.title || "Env Forge";
  $: description = d?.description || "Advanced environment variables manager.";

  // JSON-LD
  $: schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
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
            "name": d?.title || "Env Forge",
            "item": `https://web-factory.vercel.app/${lang}/tools/env-forge`
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
  keywords="env, environment variables, dotenv, config, kubernetes configmap, docker env file, yaml, json, format env"
  image="https://web-factory.vercel.app/og-image.png"
  url={`https://web-factory.vercel.app/${lang}/tools/env-forge`}
/>

<svelte:head>
  <!-- Open Graph / Meta -->
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={`https://web-factory.vercel.app/${lang}/tools/env-forge`} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <link rel="canonical" href={`https://web-factory.vercel.app/${lang}/tools/env-forge`} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
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

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
      {d?.title}
    </h1>
    <p class="mt-5 max-w-xl mx-auto text-xl text-slate-500 dark:text-slate-400">
      {d?.description}
    </p>
  </div>

  <EnvBuilder {lang} t={d} {showToast} />

  <div class="mt-24 space-y-24">
    <!-- Inline Guide Section mapping localized keys -->
    <section class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
          {d?.guideTitle}
        </h2>
        <p class="text-lg text-slate-600 dark:text-slate-300 mb-12 leading-relaxed">
          {d?.guideIntro}
        </p>

        <div class="grid md:grid-cols-2 gap-12">
          <!-- Features -->
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span class="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </span>
              {d?.featuresTitle}
            </h3>
            <ul class="space-y-4 text-slate-600 dark:text-slate-300 list-none pl-0">
               <li class="flex gap-3"><span class="w-1.5 h-1.5 mt-2 rounded-full bg-indigo-500 shrink-0"></span><span>{@html d?.f1?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
               <li class="flex gap-3"><span class="w-1.5 h-1.5 mt-2 rounded-full bg-indigo-500 shrink-0"></span><span>{@html d?.f2?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
               <li class="flex gap-3"><span class="w-1.5 h-1.5 mt-2 rounded-full bg-indigo-500 shrink-0"></span><span>{@html d?.f3?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
               <li class="flex gap-3"><span class="w-1.5 h-1.5 mt-2 rounded-full bg-indigo-500 shrink-0"></span><span>{@html d?.f4?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
            </ul>
          </div>

          <!-- Technical & Tips -->
          <div class="space-y-12">
            <div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span class="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </span>
                {d?.technicalTitle}
              </h3>
              <ul class="space-y-4 text-slate-600 dark:text-slate-300 list-none pl-0">
                <li class="flex gap-3 items-start"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>{d?.tech1}</span></li>
                <li class="flex gap-3 items-start"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>{d?.tech2}</span></li>
                <li class="flex gap-3 items-start"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>{d?.tech3}</span></li>
              </ul>
            </div>

            <div class="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-100 dark:border-amber-900/50">
              <h3 class="text-lg font-bold text-amber-900 dark:text-amber-500 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                {d?.tipsTitle}
              </h3>
              <ul class="space-y-3 text-sm text-amber-800 dark:text-amber-200/80 list-none pl-0">
                <li class="flex gap-2"><span>•</span> <span>{@html d?.tip1?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
                <li class="flex gap-2"><span>•</span> <span>{@html d?.tip2?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
                <li class="flex gap-2"><span>•</span> <span>{@html d?.tip3?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
              </ul>
            </div>
          </div>
        </div>
    </section>

    <FAQSection
      title={d?.faqTitle}
      items={[
        { q: d?.q1, a: d?.a1 },
        { q: d?.q2, a: d?.a2 },
        { q: d?.q3, a: d?.a3 }
      ]}
    />
  </div>
</div>