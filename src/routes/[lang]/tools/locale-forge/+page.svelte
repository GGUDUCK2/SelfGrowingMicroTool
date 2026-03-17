<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import ProjectManager from '$lib/components/locale-forge/ProjectManager.svelte';
  import FileImport from '$lib/components/locale-forge/FileImport.svelte';
  import TranslationTable from '$lib/components/locale-forge/TranslationTable.svelte';
  import Toolbar from '$lib/components/locale-forge/Toolbar.svelte';
  import { projectStore } from '$lib/utils/locale-forge/store';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';

  $: lang = $page.params.lang || 'en';
  // Use optional chaining or fallback as the dictionary entry might not be typed yet
  $: dict = getDictionary(lang).tools?.localeForge || {
      title: "Locale Forge",
      description: "Manage translation files.",
      guide: { title: "Guide", intro: "", featuresTitle: "", f1: "", f2: "", f3: "", tipsTitle: "", tip1: "", tip2: "", tip3: ""},
      faqTitle: "FAQ",
      q1: "", a1: "", q2: "", a2: "", q3: "", a3: ""
  };

  $: hasData = $projectStore.data.length > 0;

  $: faqItems = [
      { q: dict.q1, a: dict.a1 },
      { q: dict.q2, a: dict.a2 },
      { q: dict.q3, a: dict.a3 }
  ];

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `https://selfgrowingmicrotool.com/${lang}` },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": `https://selfgrowingmicrotool.com/${lang}#tools` },
      { "@type": "ListItem", "position": 3, "name": dict.title, "item": `https://selfgrowingmicrotool.com/${lang}/tools/locale-forge` }
    ]
  };

  $: clean = (text: string) => text ? text.replace(/\*\*/g, '') : '';
  $: featureList = dict.guide?.f1 ? [
    clean(dict.guide.f1),
    clean(dict.guide.f2),
    clean(dict.guide.f3)
  ] : undefined;

  $: softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": dict.title,
      "description": dict.description,
      "applicationCategory": "DeveloperApplication",
      "applicationSubCategory": "Localization Tool",
      "operatingSystem": "Any",
      "browserRequirements": "Requires JavaScript. HTML5.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      ...(featureList ? { "featureList": featureList } : {})
  };

  $: howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${dict.title}`,
    "description": "Step-by-step guide to managing translations",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Import Files",
        "text": "Drag and drop or upload your JSON localization files."
      },
      {
        "@type": "HowToStep",
        "name": "Edit Translations",
        "text": "Modify keys or values directly in the translation table."
      },
      {
        "@type": "HowToStep",
        "name": "Export",
        "text": "Export your updated translation files as a ZIP archive."
      }
    ]
  };
</script>
<Head
  title={dict.title}
  description={dict.description}
  keywords="translation manager, i18n tool, locale editor, json translation, localization forge"
/>


<svelte:head>

  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(softwareSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(howToSchema)}</script>`}

  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "${dict.q1}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict.a1}"
        }
      },
      {
        "@type": "Question",
        "name": "${dict.q2}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict.a2}"
        }
      },
      {
        "@type": "Question",
        "name": "${dict.q3}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict.a3}"
        }
      }
    ]
  }
  </script>`}

</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20">
    <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
             <div class="flex items-center gap-2">
                 <a href="/{lang}" aria-label="Back to home" class="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                 </a>
                 <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                    {dict.title}
                 </h1>
             </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div class="prose dark:prose-invert max-w-none mb-8">
            <p class="lead">{dict.description}</p>
        </div>

        <ProjectManager />

        {#if !hasData}
            <FileImport />
        {:else}
            <Toolbar />
            <div class="h-[600px]">
                <TranslationTable />
            </div>
        {/if}

        <div class="mt-20 space-y-12">
             <GuideSection
                title={dict.guide.title}
                intro={dict.guide.intro}
                featuresTitle={dict.guide.featuresTitle}
                f1={dict.guide.f1}
                f2={dict.guide.f2}
                f3={dict.guide.f3}
                tipsTitle={dict.guide.tipsTitle}
                tip1={dict.guide.tip1}
                tip2={dict.guide.tip2}
                tip3={dict.guide.tip3}
             />
             <FAQSection title={dict.faqTitle} items={faqItems} />
        </div>
    </main>
</div>
