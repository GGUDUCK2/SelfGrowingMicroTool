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

  import type { CssState } from '$lib/components/css-forge/types';
  import { defaultState } from '$lib/components/css-forge/types';
  import CssWorkspace from '$lib/components/css-forge/CssWorkspace.svelte';
  import CssHistory from '$lib/components/css-forge/CssHistory.svelte';

  import type { Dictionary, CssDictionary } from '$lib/components/css-forge/types';
  $: lang = $page.params.lang as 'en' | 'ko';
  $: dict = dictionaries[lang] as Dictionary;
  $: t = (dict?.tools?.cssForge as CssDictionary) || {};

  const TOOL_ID = 'css-forge';
  let state: CssState = JSON.parse(JSON.stringify(defaultState));
  let isMounted = false;
  import type { SvelteComponent } from 'svelte';
  let workspaceComponent: SvelteComponent;

  onMount(() => {
    isMounted = true;
  });

  function handleProcess(event: CustomEvent<CssState>) {
      const newState = event.detail;
      state = newState;

      if (isMounted && state.input.trim() !== '' && (state.output.trim() !== '' || state.statistics)) {
           smartSaveToHistory(
               TOOL_ID,
               JSON.parse(JSON.stringify(state)),
               { preview: state.input.substring(0, 100) + (state.input.length > 100 ? '...' : '') }
           );
      }
  }

  function loadExample(num: number) {
      if (num === 1) state.input = 'body { margin: 0; padding: 0; background: #fff; } h1 { color: #333; font-size: 2rem; }';
      if (num === 2) state.input = '.container { width: 100%; .card { border: 1px solid #ccc; .title { font-weight: bold; } } }';
      if (num === 3) state.input = 'body{margin:0;padding:0}h1,h2{font-family:sans-serif}.btn{display:inline-block;padding:10px 20px}';
      state.action = 'format';
      if (workspaceComponent) {
          workspaceComponent.process();
      }
  }

  function handleLoad(event: CustomEvent<CssState>) {
      state = JSON.parse(JSON.stringify(event.detail));
  }

  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": t.title || "CSS Forge",
    "description": t.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "isAccessibleForFree": true,
    "url": $page.url.origin + "/" + lang + "/tools/css-forge",
    "featureList": [
      "CSS Formatter",
      "CSS Minifier",
      "CSS Statistics Analyzer",
      "Local History Workspace"
    ]
  };

  $: faqItems = [
      { q: t.q1 || "Does CSS Forge send my code to a server?", a: t.a1 || "No. All processing happens locally in your browser. Your code remains private and secure." },
      { q: t.q2 || "Can I analyze CSS statistics?", a: t.a2 || "Yes. CSS Forge automatically analyzes your code to extract the number of selectors, rules, and declarations." },
      { q: t.q3 || "What happens if my CSS is invalid?", a: t.a3 || "The tool will attempt to format it as best as it can, but it relies on basic CSS block structure. It is recommended to use valid CSS for best results." }
  ];

  // eslint-disable-next-line svelte/no-immutable-reactive-statements
  $: howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to use CSS Forge",
    "description": "Step-by-step guide to using the CSS Forge tool.",
    "step": [
        {
            "@type": "HowToStep",
            "name": "Input Data",
            "text": "Paste your CSS code into the input area."
        },
        {
            "@type": "HowToStep",
            "name": "Select Action",
            "text": "Choose whether to format, minify, or analyze the CSS content."
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
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/css-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/css-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/css-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/css-forge"} />

  <meta property="og:title" content={t.title || "CSS Forge - The Definitive CSS Toolkit"} />
  <meta property="og:description" content={t.description || "Format, minify, and analyze CSS instantly. A professional tool for frontend developers."} />
  <meta property="og:url" content={$page.url.origin + "/" + lang + "/tools/css-forge"} />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={t.title || "CSS Forge - The Definitive CSS Toolkit"} />
  <meta name="twitter:description" content={t.description || "Format, minify, and analyze CSS instantly. A professional tool for frontend developers."} />

  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(howToSchema).replace(/</g, '\\u003c')}</scr` + `ipt>`}
</svelte:head>

<Head
  title={t.title || "CSS Forge - The Definitive CSS Toolkit"}
  description={t.description || "Format, minify, and analyze CSS instantly. A professional tool for frontend developers."}
  url={$page.url.origin + "/" + lang + "/tools/css-forge"}
  keywords="css formatter, css minifier, css beautifier, css analyzer, css statistics"
/>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <!-- Header -->
    <div class="text-center space-y-4">
        <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t.title || "CSS Forge"}
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.description || "Format, minify, and analyze CSS instantly. A professional tool for frontend developers."}
        </p>
    </div>

    <!-- Main Workspace Area -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <!-- Left Column: Workspace (Span 3) -->
        <div class="xl:col-span-3 flex flex-col gap-6">
             <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">

                 <!-- Examples -->
                 <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
                     <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs rounded-full whitespace-nowrap min-h-[44px]" on:click={() => loadExample(1)}>{t.example1 || 'Basic CSS'}</button>
                     <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs rounded-full whitespace-nowrap min-h-[44px]" on:click={() => loadExample(2)}>{t.example2 || 'Nested Rules'}</button>
                     <button class="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs rounded-full whitespace-nowrap min-h-[44px]" on:click={() => loadExample(3)}>{t.example3 || 'Minified CSS'}</button>
                 </div>
                 <CssWorkspace bind:this={workspaceComponent} bind:state dictionary={dict} on:process={handleProcess} />

             </div>
        </div>

        <!-- Right Column: History -->
        <div class="xl:col-span-1 flex flex-col gap-6 xl:sticky xl:top-8 self-start w-full">
             <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                 <CssHistory dictionary={dict} on:load={handleLoad} />
             </div>
        </div>
    </div>


    {#if t.guide}
        <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
        <GuideSection {...(t.guide as Record<string, unknown>)} />
    {/if}

    <!-- AEO Semantic Section for AI Search Engines -->
    <section class="mb-12 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">What is CSS Forge?</h2>
      <p class="text-slate-600 dark:text-slate-400 mb-4">
        CSS Forge is an advanced, free online tool specifically designed for frontend developers to instantly format, minify, and analyze CSS source code.
        It functions as a comprehensive CSS formatter and beautifier, automatically indenting and organizing messy CSS code into a highly readable structure.
      </p>
      <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">How do I minify CSS code?</h3>
      <p class="text-slate-600 dark:text-slate-400 mb-4">
        To minify CSS, simply paste your source code into the editor and click the "Minify" button. Our engine safely removes unnecessary whitespace and line breaks to drastically reduce file size and improve your website's load performance without altering its functionality.
      </p>
      <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">How does the CSS Analyzer work?</h3>
      <p class="text-slate-600 dark:text-slate-400">
        The CSS Analyzer instantly scans your CSS code and provides a real-time statistical breakdown, including the total number of selectors, rules, and declarations. This is crucial for optimizing stylesheet complexity and maintaining clean code architecture.
      </p>
    </section>

    <AdPlaceholder />

    <FAQSection title={t.faqTitle || 'CSS Forge FAQ'} items={faqItems} />

    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="css-forge" currentCategory="dev" />
</div>
