<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import { db } from '$lib/db';
  import { calculateDiff, type DiffResult, type DiffMode } from '$lib/utils/diff';
  import DiffEditor from '$lib/components/diff-viewer/DiffEditor.svelte';
  import DiffVisualizer from '$lib/components/diff-viewer/DiffVisualizer.svelte';
  import DiffHistory from '$lib/components/diff-viewer/DiffHistory.svelte';
  import DiffStats from '$lib/components/diff-viewer/DiffStats.svelte';
  import { Split, Columns, History, RotateCcw, Save, Trash2, ArrowLeftRight, Check, X, Code, FileJson, AlignLeft, Type, Copy, Share2, Info } from 'lucide-svelte';
  import Head from '$lib/components/Head.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict.tools.diffViewer;

  let original = '';
  let modified = '';
  let mode: DiffMode = 'lines';
  let viewMode: 'split' | 'unified' = 'split';
  let ignoreWhitespace = false;
  let ignoreCase = false;

  let diffResult: DiffResult = { diffs: [], stats: { additions: 0, deletions: 0, unchanged: 0 } };
  let isHistoryOpen = false;
  let showSaveNotification = false;
  let showCopyNotification = false;

  let originalEditor: DiffEditor;
  let modifiedEditor: DiffEditor;

  // Re-calculate diff whenever inputs change
  $: {
      if (original || modified) {
          // Debounce slightly if needed, but diffing small text is fast.
          // For now, instant.
          diffResult = calculateDiff(original, modified, mode, { ignoreWhitespace, ignoreCase });
      } else {
          diffResult = { diffs: [], stats: { additions: 0, deletions: 0, unchanged: 0 } };
      }
  }

  // Handle Scroll Sync
  // Using a simplified approach: we don't strictly sync scroll between input editors because users might want to edit independently.
  // But for the visualizer, it handles its own scrolling.

  async function saveToHistory() {
      if (!original && !modified) return;

      try {
          await db.diffHistory.add({
              original,
              modified,
              mode,
              createdAt: new Date(),
              starred: 0
          });
          showSaveNotification = true;
          setTimeout(() => showSaveNotification = false, 2000);
      } catch (e) {
          console.error("Failed to save history", e);
      }
  }

  function loadHistoryItem(item: any) {
      original = item.original;
      modified = item.modified;
      mode = item.mode as DiffMode;
      isHistoryOpen = false;
  }

  function swapSides() {
      const temp = original;
      original = modified;
      modified = temp;
  }

  function clearAll() {
      if (confirm('Are you sure you want to clear all text?')) {
          original = '';
          modified = '';
      }
  }

  function copyShareLink() {
      // In a real app, we would compress the content and put it in URL, or save to server.
      // Since we are client-side only and local-first, sharing huge text via URL is not feasible without a backend store or compression.
      // We'll fall back to copying the current URL which users expect, but maybe warn it doesn't persist state for this tool?
      // Or we can just copy the result stats?
      // Let's just copy the current page URL for now.
      navigator.clipboard.writeText(window.location.href);
      showCopyNotification = true;
      setTimeout(() => showCopyNotification = false, 2000);
  }

  // Load initial state from URL or generic restore?
  // We skip URL state syncing for huge text blobs to avoid URL limit errors.
</script>

<Head
  title={t.title}
  description={t.description}
  image="https://web-factory.vercel.app/og/diff-viewer.png"
/>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
  <!-- Header -->
  <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="/{lang}" class="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400">
           <ArrowLeftRight class="w-5 h-5" />
        </a>
        <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
          {t.title}
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors relative"
          on:click={() => isHistoryOpen = !isHistoryOpen}
          title={t.history}
          aria-label={t.history}
        >
          <History class="w-5 h-5" />
        </button>
        <button
          class="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
          on:click={copyShareLink}
          title={t.share}
          aria-label={t.share}
        >
            {#if showCopyNotification}
                <Check class="w-5 h-5 text-green-500" />
            {:else}
                <Share2 class="w-5 h-5" />
            {/if}
        </button>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">

    <!-- History Sidebar -->
    {#if isHistoryOpen}
        <div class="absolute top-0 right-0 bottom-0 z-40 h-[calc(100vh-4rem)] shadow-2xl" transition:fly={{ x: 300, duration: 300 }}>
            <DiffHistory {translations} onSelect={loadHistoryItem} />
             <!-- Backdrop -->
            <button
                class="fixed inset-0 bg-black/20 z-[-1] border-none cursor-default w-full h-full"
                aria-label="Close History"
                on:click={() => isHistoryOpen = false}
                on:keydown={(e) => e.key === 'Escape' && (isHistoryOpen = false)}
            ></button>
        </div>
    {/if}

    <!-- Toolbar -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">

        <div class="flex flex-wrap gap-4 items-center">
            <!-- Mode Selection -->
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{t.mode}:</span>
                <select bind:value={mode} class="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white">
                    <option value="lines">{t.lines}</option>
                    <option value="words">{t.words}</option>
                    <option value="chars">{t.chars}</option>
                    <option value="json">{t.json}</option>
                </select>
            </div>

            <!-- View Mode -->
            <div class="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                <button
                    class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {viewMode === 'split' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}"
                    on:click={() => viewMode = 'split'}
                >
                    <Columns class="w-4 h-4 inline mr-1" /> {t.split}
                </button>
                <button
                    class="px-3 py-1.5 rounded-md text-sm font-medium transition-all {viewMode === 'unified' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}"
                    on:click={() => viewMode = 'unified'}
                >
                    <AlignLeft class="w-4 h-4 inline mr-1" /> {t.unified}
                </button>
            </div>

            <!-- Options -->
            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input type="checkbox" bind:checked={ignoreWhitespace} class="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                {t.ignoreWhitespace}
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input type="checkbox" bind:checked={ignoreCase} class="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                {t.ignoreCase}
            </label>
        </div>

        <div class="flex gap-2">
            <button class="btn-secondary flex items-center gap-2" on:click={swapSides} title={t.swap}>
                <ArrowLeftRight class="w-4 h-4" />
                <span class="hidden sm:inline">{t.swap}</span>
            </button>
            <button class="btn-secondary text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 flex items-center gap-2" on:click={clearAll} title={t.clear}>
                <Trash2 class="w-4 h-4" />
                <span class="hidden sm:inline">{t.clear}</span>
            </button>
            <button class="btn-primary flex items-center gap-2 relative" on:click={saveToHistory} title={t.save}>
                {#if showSaveNotification}
                    <Check class="w-4 h-4" />
                    <span>Saved</span>
                {:else}
                    <Save class="w-4 h-4" />
                    <span>{t.save}</span>
                {/if}
            </button>
        </div>
    </div>

    <!-- Stats -->
    <DiffStats stats={diffResult.stats} />

    <!-- Editors Area -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 h-[400px]">
        <DiffEditor
            bind:this={originalEditor}
            bind:value={original}
            label={t.original}
            placeholder="Paste original text here..."
        />
        <DiffEditor
            bind:this={modifiedEditor}
            bind:value={modified}
            label={t.modified}
            placeholder="Paste modified text here..."
        />
    </div>

    <!-- Visualizer Area -->
    <div class="h-[500px]">
        <DiffVisualizer {diffResult} mode={viewMode} />
    </div>

    <!-- Guide & SEO Content -->
    <div class="mt-16 prose dark:prose-invert max-w-none">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 class="flex items-center gap-2 text-2xl font-bold mb-6">
          <Info class="w-6 h-6 text-indigo-500" />
          {t.guide.title}
        </h2>

        <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {t.guide.intro}
        </p>

        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <div class="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl">
            <h3 class="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">{t.guide.featuresTitle}</h3>
            <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li class="flex gap-2">
                <FileJson class="w-4 h-4 mt-1 flex-shrink-0 text-indigo-500" />
                <span>{@html t.guide.f1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
              </li>
              <li class="flex gap-2">
                <Type class="w-4 h-4 mt-1 flex-shrink-0 text-indigo-500" />
                <span>{@html t.guide.f2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
              </li>
              <li class="flex gap-2">
                <Check class="w-4 h-4 mt-1 flex-shrink-0 text-indigo-500" />
                <span>{@html t.guide.f3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
              </li>
            </ul>
          </div>

          <div class="bg-violet-50 dark:bg-violet-900/20 p-6 rounded-xl">
            <h3 class="font-semibold text-violet-900 dark:text-violet-200 mb-2">{t.guide.tipsTitle}</h3>
             <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li class="flex gap-2">
                <ArrowLeftRight class="w-4 h-4 mt-1 flex-shrink-0 text-violet-500" />
                <span>{@html t.guide.tip1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
              </li>
              <li class="flex gap-2">
                <Code class="w-4 h-4 mt-1 flex-shrink-0 text-violet-500" />
                <span>{@html t.guide.tip2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
              </li>
              <li class="flex gap-2">
                <History class="w-4 h-4 mt-1 flex-shrink-0 text-violet-500" />
                <span>{@html t.guide.tip3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- FAQ -->
        <h3 class="text-xl font-bold mb-6">{t.faqTitle}</h3>
        <div class="space-y-6">
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">{t.q1}</h4>
            <p class="text-gray-600 dark:text-gray-400 text-sm">{t.a1}</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">{t.q2}</h4>
            <p class="text-gray-600 dark:text-gray-400 text-sm">{t.a2}</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">{t.q3}</h4>
            <p class="text-gray-600 dark:text-gray-400 text-sm">{t.a3}</p>
          </div>
        </div>

        <!-- JSON-LD Schema -->
        <Head>
            {@html `<script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "${t.title}",
              "operatingSystem": "Web",
              "applicationCategory": "DeveloperApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "${t.description}",
              "featureList": "Diff comparison, JSON sorting, Syntax highlighting, Local history"
            }
            </script>`}
            {@html `<script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "${t.q1}",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "${t.a1}"
                  }
                },
                {
                  "@type": "Question",
                  "name": "${t.q2}",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "${t.a2}"
                  }
                },
                {
                  "@type": "Question",
                  "name": "${t.q3}",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "${t.a3}"
                  }
                }
              ]
            }
            </script>`}
        </Head>

      </div>
    </div>
  </div>
</div>

<style>
  .btn-primary {
    @apply px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm;
  }
  .btn-secondary {
    @apply px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 text-sm;
  }
</style>
