<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import Editor from '$lib/components/string-theory/Editor.svelte';
  import StatsPanel from '$lib/components/string-theory/StatsPanel.svelte';
  import Toolbar from '$lib/components/string-theory/Toolbar.svelte';
  import HistorySidebar from '$lib/components/string-theory/HistorySidebar.svelte';
  import ExtractorPanel from '$lib/components/string-theory/ExtractorPanel.svelte';
  import { TextAnalyzer } from '$lib/utils/string-theory/analyzer';
  import { TextTransformer } from '$lib/utils/string-theory/transformer';
  import { TextCleaner } from '$lib/utils/string-theory/cleaner';
  import { TextExtractor } from '$lib/utils/string-theory/extractor';
  import { TextGenerator } from '$lib/utils/string-theory/generator';
  import type { TextStats, TransformMode, CleanMode, SecurityMode, EncodeMode, ExtractionResult } from '$lib/utils/string-theory/types';
  import { db } from '$lib/db/string-theory';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  $: dict = getDictionary($page.params.lang || 'en').tools.stringTheory;

  let text = '';
  let stats: TextStats = TextAnalyzer.analyze('');
  let extractions: ExtractionResult[] = [];
  let showHistory = false;
  let toastMessage = '';

  function handleAction(event: CustomEvent) {
    const { type, mode } = event.detail;
    let result = text;
    let operationName = mode;

    if (type === 'transform') {
      result = TextTransformer.transform(text, mode as TransformMode);
    } else if (type === 'clean') {
      result = TextCleaner.clean(text, mode as CleanMode);
    } else if (type === 'security') {
      result = TextCleaner.redact(text, mode as SecurityMode);
    } else if (type === 'encode') {
      result = TextCleaner.encode(text, mode as EncodeMode);
    }

    if (result !== text) {
      text = result;
      // Save to history
      db.history.add({
        text: result,
        operation: mode,
        timestamp: Date.now(),
        isFavorite: false
      });
      showToast('Action Applied: ' + mode);
    } else {
        showToast('No changes made');
    }
  }

  function handleGenerate(event: CustomEvent) {
      const { type } = event.detail;
      let newText = '';

      if (type === 'lorem') {
          newText = TextGenerator.loremIpsum(3);
      } else if (type === 'uuid') {
          newText = TextGenerator.uuid();
      } else if (type === 'random') {
          newText = TextGenerator.randomString(32);
      }

      if (text) {
          text += '\n' + newText;
      } else {
          text = newText;
      }
      showToast('Generated: ' + type);
  }

  function handleRestore(event: CustomEvent) {
    text = event.detail;
    showHistory = false;
    showToast('Restored from History');
  }

  function showToast(msg: string) {
    toastMessage = msg;
    setTimeout(() => {
      if (toastMessage === msg) toastMessage = '';
    }, 2000);
  }

  function handleKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        showToast('Stats Updated');
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        text = '';
        showToast('Cleared');
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard');
    }
  }

  function loadExample(type: 'json' | 'log' | 'messy') {
      if (type === 'json') {
          text = '{\n  "name": "String Theory",\n  "version": 1.0,\n  "features": ["analysis", "transform"]\n}';
      } else if (type === 'log') {
          text = '[2023-10-27 10:00:00] INFO: Server started\n[2023-10-27 10:05:00] ERROR: Connection failed\n[2023-10-27 10:10:00] INFO: Retrying...';
      } else if (type === 'messy') {
          text = '  This is   some \n messy   text.\n\n\nIt needs cleaning!  ';
      }
      showToast('Example Loaded: ' + type);
  }

  // Reactive updates for extractions
  $: {
      extractions = TextExtractor.analyzeAll(text);
  }

  // Wait for dict to be ready
  $: jsonLd = dict ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "String Theory",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": dict.description,
    "featureList": [
        "Text Analysis",
        "Case Conversion",
        "String Cleaning",
        "Security Redaction",
        "Base64 Encoding"
    ],
    "isAccessibleForFree": true,
    "author": {
        "@type": "Organization",
        "name": "MicroFactory"
    }
  } : null;

  const canonicalUrl = `https://web-factory.vercel.app/${$page.params.lang}/tools/string-theory`;
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
  <title>{dict.title} - MicroFactory</title>
  <meta name="description" content={dict.description} />
  <meta name="keywords" content="string manipulation, text converter, case converter, slugify, base64, url encode, text analysis" />
  <link rel="canonical" href={canonicalUrl} />

  <!-- Open Graph -->
  <meta property="og:title" content={dict.title} />
  <meta property="og:description" content={dict.description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:type" content="website" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={dict.title} />
  <meta name="twitter:description" content={dict.description} />

  {#if jsonLd}
  <script type="application/ld+json">
    {JSON.stringify(jsonLd)}
  </script>
  {/if}
</svelte:head>

<div class="space-y-8 relative">
  <!-- Top Stats -->
  <StatsPanel {stats} />

  <!-- Extractor Panel (Visible only when matches found) -->
  <ExtractorPanel {extractions} />

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Main Editor -->
    <div class="lg:col-span-2 space-y-4">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-xl font-bold text-slate-800 dark:text-white">{dict.input} / {dict.output}</h2>
        <div class="flex items-center gap-4">
            <!-- Smart Examples -->
            <div class="flex gap-2 text-xs">
                <button on:click={() => loadExample('messy')} class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium">Messy</button>
                <button on:click={() => loadExample('json')} class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium">JSON</button>
                <button on:click={() => loadExample('log')} class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium">Log</button>
            </div>

            <button
              on:click={() => showHistory = !showHistory}
              class="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1"
              aria-label="Toggle History Sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {dict.history}
            </button>
        </div>
      </div>

      <Editor bind:text bind:stats />
    </div>

    <!-- Toolbar -->
    <div class="lg:col-span-1">
      <div class="sticky top-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
        <Toolbar on:action={handleAction} on:generate={handleGenerate} />
      </div>
    </div>
  </div>

  <!-- Documentation Section -->
  <section class="mt-20 prose dark:prose-invert max-w-4xl mx-auto">
    <h2 class="text-3xl font-bold text-slate-900 dark:text-white">{dict.guide.title}</h2>
    <p class="text-lg text-slate-600 dark:text-slate-400">{dict.guide.intro}</p>

    <div class="grid md:grid-cols-3 gap-8 my-12">
      <div class="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
        <h3 class="text-indigo-900 dark:text-indigo-300 font-bold mb-3">{dict.guide.featuresTitle}</h3>
        <ul class="space-y-2 text-indigo-800 dark:text-indigo-200 text-sm">
          <li>{@html dict.guide.f1}</li>
          <li>{@html dict.guide.f2}</li>
          <li>{@html dict.guide.f3}</li>
        </ul>
      </div>

      <div class="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
        <h3 class="text-emerald-900 dark:text-emerald-300 font-bold mb-3">{dict.guide.tipsTitle}</h3>
        <ul class="space-y-2 text-emerald-800 dark:text-emerald-200 text-sm">
          <li>{@html dict.guide.tip1}</li>
          <li>{@html dict.guide.tip2}</li>
          <li>{@html dict.guide.tip3}</li>
        </ul>
      </div>

      <div class="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/50">
        <h3 class="text-amber-900 dark:text-amber-300 font-bold mb-3">{dict.faqTitle}</h3>
        <ul class="space-y-4 text-amber-800 dark:text-amber-200 text-sm">
          <li>
            <strong class="block mb-1">{dict.q1}</strong>
            {dict.a1}
          </li>
          <li>
            <strong class="block mb-1">{dict.q2}</strong>
            {dict.a2}
          </li>
          <li>
            <strong class="block mb-1">{dict.q3}</strong>
            {dict.a3}
          </li>
        </ul>
      </div>
    </div>
  </section>

  <!-- History Sidebar Overlay -->
  {#if showHistory}
    <button
      transition:fade={{ duration: 200 }}
      class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 w-full h-full cursor-default"
      on:click={() => showHistory = false}
      on:keydown={(e) => e.key === 'Escape' && (showHistory = false)}
      aria-label="Close History Overlay"
    ></button>
    <div transition:fly={{ x: 300, duration: 300 }} class="z-50 fixed right-0 top-0 bottom-0">
        <HistorySidebar on:close={() => showHistory = false} on:restore={handleRestore} />
    </div>
  {/if}

  <!-- Toast -->
  {#if toastMessage}
    <div
      transition:fly={{ y: 50, duration: 300 }}
      class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-xl font-medium z-50 flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400 dark:text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      {toastMessage}
    </div>
  {/if}
</div>

<style>
  /* Custom Scrollbar for Toolbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-200 dark:bg-slate-700 rounded-full;
  }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    @apply bg-slate-300 dark:bg-slate-600;
  }
</style>
