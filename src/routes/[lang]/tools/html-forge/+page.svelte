<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { dictionaries } from '$lib/dictionaries';
  import Head from '$lib/components/Head.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import { smartSaveToHistory } from '$lib/db/workspace';

  import type { HtmlState } from '$lib/components/html-forge/types';
  import { defaultState } from '$lib/components/html-forge/types';
  import HtmlWorkspace from '$lib/components/html-forge/HtmlWorkspace.svelte';
  import HtmlHistory from '$lib/components/html-forge/HtmlHistory.svelte';

  $: lang = $page.params.lang as 'en' | 'ko';
  import type { Dictionary, HtmlDictionary } from '$lib/components/html-forge/types';
  $: dict = dictionaries[lang] as Dictionary;
  $: t = (dict?.tools?.htmlForge as HtmlDictionary) || {};

  const TOOL_ID = 'html-forge';
  let state: HtmlState = JSON.parse(JSON.stringify(defaultState));
  let isMounted = false;

  onMount(() => {
    isMounted = true;
  });

  function handleProcess(event: CustomEvent<HtmlState>) {
      const newState = event.detail;
      state = newState;

      if (isMounted && state.input.trim() !== '' && state.output.trim() !== '') {
           smartSaveToHistory(
               TOOL_ID,
               JSON.parse(JSON.stringify(state)),
               { preview: state.input.substring(0, 100) + (state.input.length > 100 ? '...' : '') }
           );
      }
  }

  function loadExample(num: number) {
      if (num === 1) state.input = '<div>\n  <h1>Hello World</h1>\n  <p>This is a basic example.</p>\n</div>';
      if (num === 2) state.input = '<div class="container"><ul><li>Item 1</li><li>Item 2</li></ul></div>';
      if (num === 3) state.input = '<nav><a href="/">Home</a><a href="/about">About</a></nav>';
      state.action = 'format';
      // Trigger update manually or let the workspace do it via reactive statement (will happen in handleInput or process button click)
      // Actually we should trigger an event to process it
      // Since handleProcess processes, we'll just set it. The user can click format.
      // But better yet, we can pass it down.
  }

  function handleLoad(event: CustomEvent<HtmlState>) {
      state = JSON.parse(JSON.stringify(event.detail));
  }

  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": t.title || "HTML Forge",
    "description": t.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "isAccessibleForFree": true,
    "url": $page.url.origin + "/" + lang + "/tools/html-forge",
    "featureList": [
      "HTML Formatter",
      "HTML Minifier",
      "HTML Entity Encoder",
      "HTML Entity Decoder",
      "HTML Link Extractor",
      "HTML Statistics Analyzer",
      "Local History Workspace"
    ]
  };

  $: faqItems = [
      { q: t.q1 || "Does HTML Forge send my code to a server?", a: t.a1 || "No. All processing happens locally in your browser. Your code remains private and secure." },
      { q: t.q2 || "Can I format partial HTML fragments?", a: t.a2 || "Yes. HTML Forge can format both full documents and partial HTML fragments." },
      { q: t.q3 || "What is entity encoding?", a: t.a3 || "Entity encoding replaces characters like '<' or '&' with their HTML entity equivalents (e.g., '&lt;', '&amp;') to prevent them from being interpreted as code by the browser." }
  ];

  // eslint-disable-next-line svelte/no-immutable-reactive-statements
  $: howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to use HTML Forge",
    "description": "Step-by-step guide to using the HTML Forge tool.",
    "step": [
        {
            "@type": "HowToStep",
            "name": "Input Data",
            "text": "Paste your HTML code or text into the input area."
        },
        {
            "@type": "HowToStep",
            "name": "Select Action",
            "text": "Choose whether to format, minify, encode, decode, extract links, or analyze the content."
        },
        {
            "@type": "HowToStep",
            "name": "Get Result",
            "text": "The result will appear instantly. Click copy to save it to your clipboard."
        }
    ]
  };
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</scr` + `ipt>`}
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/html-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/html-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/html-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/html-forge"} />

  <meta property="og:title" content={t.title || "HTML Forge - The Definitive HTML Toolkit"} />
  <meta property="og:description" content={t.description || "Format, minify, and entity encode/decode HTML instantly. A professional tool for web developers."} />
  <meta property="og:url" content={$page.url.origin + "/" + lang + "/tools/html-forge"} />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={t.title || "HTML Forge - The Definitive HTML Toolkit"} />
  <meta name="twitter:description" content={t.description || "Format, minify, and entity encode/decode HTML instantly. A professional tool for web developers."} />

  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(howToSchema).replace(/</g, '\\u003c')}</scr` + `ipt>`}
</svelte:head>

<Head
  title={t.title || "HTML Forge - The Definitive HTML Toolkit"}
  description={t.description || "Format, minify, and entity encode/decode HTML instantly. A professional tool for web developers."}
  url={$page.url.origin + "/" + lang + "/tools/html-forge"}
  keywords="html formatter, html minifier, html beautifier, entity encoder, html entities, extract links, analyze html"
/>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4">
        <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t.title || "HTML Forge"}
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.description || "Format, minify, and entity encode/decode HTML instantly. A professional tool for web developers."}
        </p>
    </div>

    <!-- Main Workspace Area -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <!-- Left Column: Workspace (Span 3) -->
        <div class="xl:col-span-3 flex flex-col gap-6">
             <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">

                 <!-- Examples -->
                 <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
                     <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs rounded-full whitespace-nowrap" on:click={() => loadExample(1)}>{t.example1 || 'Basic HTML'}</button>
                     <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs rounded-full whitespace-nowrap" on:click={() => loadExample(2)}>{t.example2 || 'Nested Elements'}</button>
                     <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs rounded-full whitespace-nowrap" on:click={() => loadExample(3)}>{t.example3 || 'Minified HTML'}</button>
                 </div>
                 <HtmlWorkspace bind:state dictionary={dict} on:process={handleProcess} />

             </div>
        </div>

        <!-- Right Column: History -->
        <div class="xl:col-span-1 flex flex-col gap-6 xl:sticky xl:top-8 self-start w-full">
             <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                 <HtmlHistory dictionary={dict} on:load={handleLoad} />
             </div>
        </div>
    </div>


    {#if t.guide}
        <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
        <GuideSection {...(t.guide as any)} />
    {/if}

    <AdPlaceholder />

    <FAQSection title={t.faqTitle || 'HTML Forge FAQ'} items={faqItems} />

    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="html-forge" currentCategory="dev" />
</div>
