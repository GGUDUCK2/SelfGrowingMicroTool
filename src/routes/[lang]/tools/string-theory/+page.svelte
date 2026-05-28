<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import Editor from '$lib/components/string-theory/Editor.svelte';
  import StatsPanel from '$lib/components/string-theory/StatsPanel.svelte';
  import Toolbar from '$lib/components/string-theory/Toolbar.svelte';
  import HistorySidebar from '$lib/components/string-theory/HistorySidebar.svelte';
  import ExtractorPanel from '$lib/components/string-theory/ExtractorPanel.svelte';
  import SmartAssistant from '$lib/components/string-theory/SmartAssistant.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { TextAnalyzer } from '$lib/utils/string-theory/analyzer';
  import { TextTransformer } from '$lib/utils/string-theory/transformer';
  import { TextCleaner } from '$lib/utils/string-theory/cleaner';
  import { TextExtractor } from '$lib/utils/string-theory/extractor';
  import { TextGenerator } from '$lib/utils/string-theory/generator';
  import type { TextStats, TransformMode, CleanMode, SecurityMode, EncodeMode, ExtractionResult } from '$lib/utils/string-theory/types';
  import { StringHistoryManager } from '$lib/db/string-theory';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  $: lang = $page.params.lang || 'en';

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

    try {
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
        StringHistoryManager.add(result, mode);
        showToast('Action Applied: ' + mode);
      } else {
          showToast('No changes made');
      }
    } catch (e) {
      showToast('Error: ' + (e as Error).message);
    }
  }

  function handleGenerate(event: CustomEvent) {
      const { type } = event.detail;
      let newText = '';

      if (type === 'lorem') {
          newText = TextGenerator.loremIpsum(3);
      } else if (type === 'uuid') {
          newText = TextGenerator.uuid();
      } else if (type === 'ulid') {
          newText = TextGenerator.ulid();
      } else if (type === 'nanoid') {
          newText = TextGenerator.nanoid();
      } else if (type === 'random') {
          newText = TextGenerator.randomString(32);
      }

      if (text) {
          text += '\n' + newText;
      } else {
          text = newText;
      }
      // Save generated content to history too? Maybe only on explicit save, but sticking to "Action Applied" pattern
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
        copyText();
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

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
    } catch (e) {
      showToast('Failed to copy');
    }
  }

  function downloadText() {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'string-theory-export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded');
  }

  async function shareText() {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'String Theory Text',
                  text: text.slice(0, 10000) // Share limit
              });
              showToast('Shared');
          } catch (e) {
              // Share cancelled or failed
          }
      } else {
          // Fallback
          copyText();
      }
  }

  // Reactive updates for extractions
  $: {
      extractions = TextExtractor.analyzeAll(text);
  }

  $: faqItems = dict ? [
    { q: dict?.q1, a: dict?.a1 },
    { q: dict?.q2, a: dict?.a2 },
    { q: dict?.q3, a: dict?.a3 }
  ] : [];

  // Wait for dict to be ready
  $: jsonLd = dict ? {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/string-theory",
        "name": "String Theory",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web, iOS, Android, macOS, Windows, Linux",
        "applicationSubCategory": "Developer Application",
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
            "Base64 Encoding",
            "ULID/NanoID Generation"
        ],
        "isAccessibleForFree": true,
        "author": {
            "@type": "Organization",
            "name": "MicroFactory"
        }
      }
    ]
  } : null;

  $: faqSchema = dict ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": dict?.q1,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict?.a1
        }
      },
      {
        "@type": "Question",
        "name": dict?.q2,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict?.a2
        }
      },
      {
        "@type": "Question",
        "name": dict?.q3,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict?.a3
        }
      }
    ]
  } : null;

  const canonicalUrl = `https://selfgrowingmicrotool.com/${$page.params.lang}/tools/string-theory`;
</script>
<Head
  title={dict.title}
  description={dict.description}
  keywords="string manipulation, text converter, case converter, slugify, base64, url encode, text analysis, ulid generator, nanoid generator"
/>


<svelte:window on:keydown={handleKeydown} />

<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
  <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/string-theory" />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/string-theory" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/string-theory" />


  {#if jsonLd}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}
  {/if}

  {#if faqSchema}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(faqSchema) + '</scr' + 'ipt>'}
  {/if}

</svelte:head>

<div class="space-y-8 relative">
  <!-- Top Stats -->
  <StatsPanel {stats} />

  <!-- Extractor Panel (Visible only when matches found) -->
  <ExtractorPanel {extractions} />

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Main Editor -->
    <section class="lg:col-span-2 space-y-4" aria-label="Editor Workspace">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-xl font-bold text-slate-800 dark:text-white">{dict.input} / {dict.output}</h2>
        <div class="flex items-center gap-4">
            <!-- Smart Examples -->
            <div class="flex gap-2 text-xs">
                <button on:click={() => loadExample('messy')} class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium">Messy</button>
                <button on:click={() => loadExample('json')} class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium">JSON</button>
                <button on:click={() => loadExample('log')} class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium">Log</button>
            </div>

             <div class="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>

            <div class="flex gap-2">
                 <button on:click={copyText} class="text-slate-500 hover:text-indigo-600 transition-colors min-h-[44px] min-w-[44px]" aria-label="Copy" title="Copy">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                 </button>
                  <button on:click={downloadText} class="text-slate-500 hover:text-indigo-600 transition-colors min-h-[44px] min-w-[44px]" aria-label="Download" title="Download">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                 </button>
                 <button on:click={shareText} class="text-slate-500 hover:text-indigo-600 transition-colors min-h-[44px] min-w-[44px]" aria-label="Share" title="Share">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                 </button>
            </div>

             <div class="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>

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

      <div class="relative">
        <Editor bind:text bind:stats />
        <SmartAssistant {text} on:action={handleAction} />
      </div>
    </section>

    <!-- Toolbar -->
    <aside class="lg:col-span-1" aria-label="Tools">
      <div class="sticky top-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
        <Toolbar on:action={handleAction} on:generate={handleGenerate} />
      </div>
    </aside>
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

      <GuideSection {...dict?.guide} />
  <AdPlaceholder />
  <FAQSection title={dict.faqTitle} items={faqItems} />
    </div>
  </section>

  <!-- History Sidebar Overlay -->
  {#if showHistory}
    <button
      transition:fade={{ duration: 200 }}
      class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 w-full h-full cursor-default min-h-[44px]"
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

  <div class="mt-12 mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <RelatedTools {lang} currentSlug="string-theory" currentCategory="dev" />
  </div>
