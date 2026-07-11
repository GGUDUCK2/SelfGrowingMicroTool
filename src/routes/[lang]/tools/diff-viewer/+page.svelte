<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import { db } from '$lib/db';
  import { calculateDiff, parseMergeConflict, type DiffResult, type DiffMode } from '$lib/utils/diff';
  import { compressState, decompressState } from '$lib/utils/url-state';
  import * as Diff from 'diff';
  import DiffEditor from '$lib/components/diff-viewer/DiffEditor.svelte';
  import DiffVisualizer from '$lib/components/diff-viewer/DiffVisualizer.svelte';
  import DiffHistory from '$lib/components/diff-viewer/DiffHistory.svelte';
  import DiffStats from '$lib/components/diff-viewer/DiffStats.svelte';
  import MergeConflictResolver from '$lib/components/diff-viewer/MergeConflictResolver.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import Button from '$lib/components/Button.svelte';
  import { Split, Columns, History, RotateCcw, Save, Trash2, ArrowLeftRight, Check, X, Code, FileJson, AlignLeft, Type, Copy, Share2, Info, Keyboard, FileText, Download, GitMerge, FileUp } from '@lucide/svelte';
  import Head from '$lib/components/Head.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict.tools.diffViewer;
  $: translations = t; // For passing to components

  $: faqItems = [
    { q: t?.q1, a: t?.a1 },
    { q: t?.q2, a: t?.a2 },
    { q: t?.q3, a: t?.a3 }
  ];

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
  let showConflictModal = false;
  let isResolving = false;
  let conflictInput = '';
  let conflictMessage = '';

  let originalEditor: DiffEditor;
  let modifiedEditor: DiffEditor;

  // Initialize from URL
  onMount(async () => {
      if (window.innerWidth < 768) {
          viewMode = 'unified';
      }

      const hash = window.location.hash.slice(1);
      if (hash) {
          try {
              const state = JSON.parse(await decompressState(hash));
              if (state.original) original = state.original;
              if (state.modified) modified = state.modified;
              if (state.mode) mode = state.mode;
              // Clean hash
              window.history.replaceState(null, '', window.location.pathname);
          } catch (e) {
              console.error("Failed to load state from URL", e);
          }
      }
  });

  // Re-calculate diff whenever inputs change
  $: {
      if (original || modified) {
          diffResult = calculateDiff(original, modified, mode, { ignoreWhitespace, ignoreCase });
      } else {
          diffResult = { diffs: [], stats: { additions: 0, deletions: 0, unchanged: 0 } };
      }
  }

  // Handle Scroll Sync
  function handleEditorScroll(e: CustomEvent, source: 'original' | 'modified') {
      const scrollTop = e.detail.scrollTop;
      if (source === 'original' && modifiedEditor) {
          modifiedEditor.scrollTo(scrollTop);
      } else if (source === 'modified' && originalEditor) {
          originalEditor.scrollTo(scrollTop);
      }
  }

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

  async function copyShareLink() {
      const state = JSON.stringify({ original, modified, mode });
      try {
          const compressed = await compressState(state);
          const url = new URL(window.location.href);
          url.hash = compressed;
          await navigator.clipboard.writeText(url.toString());
          showCopyNotification = true;
          setTimeout(() => showCopyNotification = false, 2000);
      } catch (e) {
          console.error("Failed to share", e);
          alert("Content too large to share via URL.");
      }
  }

  function downloadPatch() {
      const patch = Diff.createTwoFilesPatch("original", "modified", original, modified);
      const blob = new Blob([patch], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `changes-${new Date().toISOString().slice(0,10)}.patch`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }

  function escapeHtml(text: string) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }

  function downloadReport() {
    const htmlContent = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(t.title)} - Report</title>
    <style>
        body { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; line-height: 1.5; padding: 20px; background: #f9fafb; color: #111827; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .diff-block { margin-bottom: 5px; }
        .added { background-color: #dcfce7; color: #166534; }
        .removed { background-color: #fee2e2; color: #991b1b; }
        .stats { margin-bottom: 20px; font-size: 0.9em; color: #6b7280; }
        pre { margin: 0; white-space: pre-wrap; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${escapeHtml(t.title)} - Comparison Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        <div class="stats">
            Additions: ${diffResult.stats.additions} | Deletions: ${diffResult.stats.deletions} | Unchanged: ${diffResult.stats.unchanged}
        </div>
        <div class="diff-content">
            ${diffResult.diffs.map(part => {
                const colorClass = part.added ? 'added' : part.removed ? 'removed' : '';
                const symbol = part.added ? '+' : part.removed ? '-' : ' ';
                return `<div class="diff-block ${colorClass}"><pre>${symbol} ${escapeHtml(part.value)}</pre></div>`;
            }).join('')}
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diff-report-${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleConflictResolve(e: CustomEvent) {
      const resolvedText = e.detail.text;
      // Put resolved text in original and empty modified? Or ask user?
      // Usually resolved goes to one place. Let's put it in "Original" and clear "Modified" to show it's done,
      // or put same in both.
      original = resolvedText;
      modified = resolvedText;
      showConflictModal = false;
      conflictInput = '';
      isResolving = false;
  }

  function startResolving() {
      if (!conflictInput.trim()) return;
      isResolving = true;
  }

  function cancelConflict() {
      showConflictModal = false;
      conflictInput = '';
      isResolving = false;
  }

  // Example Data
  const examples = {
    code: {
        original: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`,
        modified: `function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + item.price;
  }, 0);
}`
    },
    json: {
        original: `{\n  "name": "Project A",\n  "version": "1.0.0",\n  "active": true\n}`,
        modified: `{\n  "name": "Project A",\n  "version": "1.0.1",\n  "active": false,\n  "description": "Updated project"\n}`
    },
    text: {
        original: "The quick brown fox jumps over the lazy dog.\nIt was a sunny day in the park.",
        modified: "The quick brown fox jumped over the lazy dog.\nIt was a rainy day in the park."
    }
  };

  function loadExample(type: 'code' | 'json' | 'text') {
      original = examples[type].original;
      modified = examples[type].modified;
      mode = type === 'json' ? 'json' : 'lines';
  }

  // Keyboard Shortcuts
  function handleKeydown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
         // Trigger diff (automatic but good for feedback)
         e.preventDefault();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          clearAll();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
          e.preventDefault();
          isHistoryOpen = !isHistoryOpen;
      }
  }

  $: softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/diff-viewer",
        "isAccessibleForFree": true,
    "name": t.title,
    "operatingSystem": "Any",
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "DeveloperApplication",
    "screenshot": "https://selfgrowingmicrotool.com/og/diff-viewer.png",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": t.description,
    "url": `https://selfgrowingmicrotool.com/${lang}/tools/diff-viewer`,
    "image": "https://selfgrowingmicrotool.com/og/diff-viewer.png",
    "featureList": [t.guide.f1, t.guide.f2, t.guide.f3].map(s => s.replace(/\*\*/g, '')),
    "author": {
        "@type": "Organization",
        "name": "MicroFactory"
    }
  };

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://selfgrowingmicrotool.com/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": `https://selfgrowingmicrotool.com/${lang}#tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": t.title,
        "item": `https://selfgrowingmicrotool.com/${lang}/tools/diff-viewer`
      }
    ]
  };

  $: howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to compare text files with ${t.title}`,
    "step": [
      {
        "@type": "HowToStep",
        "name": "Paste Original Text",
        "text": "Paste your original text or code into the left editor.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Paste Modified Text",
        "text": "Paste the new version of the text or code into the right editor.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Select Comparison Mode",
        "text": "Choose between Lines, Words, Characters, or JSON mode for accurate results.",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "View Differences",
        "text": "Analyze the highlighted differences in the visualizer below.",
        "position": 4
      }
    ]
  };



  const keywords = "diff checker, text compare, json compare, merge conflict solver, online diff tool, file comparison, text difference";
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(softwareSchema)}</scr` + `ipt>`}
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</scr` + `ipt>`}
  {@html `<script type="application/ld+json">${JSON.stringify(howToSchema)}</scr` + `ipt>`}


</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<Head
  title={t.title}
  description={t.description}
  image="https://selfgrowingmicrotool.com/og/diff-viewer.png"
  keywords={keywords}
/>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
  <!-- Header -->
  <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-4 w-full md:w-auto">
        <a href="/{lang}" aria-label="Back to home" class="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center">
           <ArrowLeftRight class="w-5 h-5" />
        </a>
        <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 truncate">
          {t.title}
        </h1>
      </div>

      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
         <!-- Example Dropdown (Simple) -->
         <div class="flex items-center gap-1 mr-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <button class="text-sm px-3 py-2 min-h-[44px] min-w-[44px] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors shrink-0 min-h-[44px] min-w-[44px]" aria-label="Load Code Example" on:click={() => loadExample('code')}>Code</button>
            <button class="text-sm px-3 py-2 min-h-[44px] min-w-[44px] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors shrink-0 min-h-[44px] min-w-[44px]" aria-label="Load JSON Example" on:click={() => loadExample('json')}>JSON</button>
            <button class="text-sm px-3 py-2 min-h-[44px] min-w-[44px] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors shrink-0 min-h-[44px] min-w-[44px]" aria-label="Load Text Example" on:click={() => loadExample('text')}>Text</button>
         </div>

        <button
          class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors relative"
          on:click={() => isHistoryOpen = !isHistoryOpen}
          title={t.history + ' (Cmd+/)'}
          aria-label={t.history}
        >
          <History class="w-5 h-5" />
        </button>
        <button
          class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
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

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

    <!-- Conflict Modal -->
    {#if showConflictModal}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                class="absolute inset-0 bg-black/50 backdrop-blur-sm border-none w-full h-full cursor-default min-h-[44px]"
                aria-label="Close Modal"
                on:click={() => showConflictModal = false}
                on:keydown={(e) => e.key === 'Escape' && (showConflictModal = false)}
            ></button>
            <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl p-0 overflow-hidden flex flex-col max-h-[90vh]" role="dialog" tabindex="-1" aria-modal="true">
                 {#if !isResolving}
                    <!-- Input State -->
                     <div class="p-6 flex flex-col h-full">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <GitMerge class="w-5 h-5 text-indigo-500" />
                                {t.mergeConflict}
                            </h3>
                            <button class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 min-h-[44px] min-w-[44px]" on:click={cancelConflict}>
                                <X class="w-5 h-5" />
                            </button>
                        </div>
                         <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">{t.pasteConflict}</p>
                         <textarea
                            bind:value={conflictInput}
                            class="flex-1 w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-4 min-h-[300px]"
                            placeholder={`<<<<<<< HEAD\nvar x = 1;\n=======\nvar x = 2;\n>>>>>>> feature/new-x`}
                        ></textarea>
                         <div class="flex justify-end gap-2 mt-4">
                            <Button variant="secondary" on:click={cancelConflict} class="min-h-[44px] min-w-[44px]">Cancel</Button>
                            <Button variant="primary" on:click={startResolving} class="min-h-[44px] min-w-[44px]">Start Resolving</Button>
                        </div>
                     </div>
                 {:else}
                    <!-- Resolver State -->
                    <MergeConflictResolver
                        content={conflictInput}
                        translations={t}
                        on:apply={handleConflictResolve}
                        on:cancel={() => isResolving = false}
                    />
                 {/if}
            </div>
        </div>
    {/if}

    <!-- History Sidebar -->
    {#if isHistoryOpen}
        <div class="fixed inset-y-0 right-0 z-50 w-80 shadow-2xl bg-white dark:bg-gray-800" transition:fly={{ x: 300, duration: 300 }}>
            <DiffHistory {translations} onSelect={loadHistoryItem} />
             <!-- Backdrop -->
             <button
                class="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 min-h-[44px] min-w-[44px]"
                on:click={() => isHistoryOpen = false}
                aria-label="Close"
             >
                <X class="w-5 h-5" />
             </button>
        </div>
        <!-- Overlay -->
        <button
            class="fixed inset-0 bg-black/20 z-40 cursor-default w-full h-full border-none min-h-[44px]"
            aria-label="Close History Overlay"
            on:click={() => isHistoryOpen = false}
            on:keydown={(e) => e.key === 'Escape' && (isHistoryOpen = false)}
            transition:fade={{ duration: 200 }}
        ></button>
    {/if}

    <!-- Toolbar -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 flex flex-wrap gap-2 sm:gap-4 items-center justify-between static md:sticky md:top-20 z-20">

        <div class="flex flex-wrap gap-2 sm:gap-4 items-center">
            <!-- Mode Selection -->
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{t.mode}:</span>
                <select bind:value={mode} class="min-h-[44px] min-w-[44px] bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white">
                    <option value="lines">{t.lines}</option>
                    <option value="words">{t.words}</option>
                    <option value="chars">{t.chars}</option>
                    <option value="json">{t.json}</option>
                </select>
            </div>

            <!-- View Mode -->
            <div class="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                <button
                    class="px-3 py-1.5 min-h-[44px] min-w-[44px] rounded-md text-sm font-medium transition-all {viewMode === 'split' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}"
                    on:click={() => viewMode = 'split'}
                >
                    <Columns class="w-4 h-4 inline mr-1" /> {t.split}
                </button>
                <button
                    class="px-3 py-1.5 min-h-[44px] min-w-[44px] rounded-md text-sm font-medium transition-all {viewMode === 'unified' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}"
                    on:click={() => viewMode = 'unified'}
                >
                    <AlignLeft class="w-4 h-4 inline mr-1" /> {t.unified}
                </button>
            </div>

            <!-- Options -->
            <label class="flex items-center gap-2 min-h-[44px] min-w-[44px] text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input type="checkbox" bind:checked={ignoreWhitespace} class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                {t.ignoreWhitespace}
            </label>
            <label class="flex items-center gap-2 min-h-[44px] min-w-[44px] text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input type="checkbox" bind:checked={ignoreCase} class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                {t.ignoreCase}
            </label>
        </div>

        <div class="flex flex-wrap gap-2 sm:gap-4 items-center">
            <Button variant="secondary" on:click={() => showConflictModal = true} title={t.mergeConflict}>
                <GitMerge class="w-4 h-4 text-orange-500" />
                <span class="hidden md:inline">{t.mergeConflict}</span>
            </Button>
             <Button variant="secondary" on:click={downloadReport} title={t.downloadReport} class="min-h-[44px] min-w-[44px]">
                <Download class="w-4 h-4 text-blue-500" />
                <span class="hidden md:inline">Report</span>
            </Button>
            <Button variant="secondary" on:click={downloadPatch} title="Download Patch (.patch)" class="min-h-[44px] min-w-[44px]">
                <FileUp class="w-4 h-4 text-green-500" />
                <span class="hidden md:inline">Patch</span>
            </Button>
            <div class="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
            <Button variant="secondary" on:click={swapSides} title={t.swap} class="min-h-[44px] min-w-[44px]">
                <ArrowLeftRight class="w-4 h-4" />
                <span class="hidden sm:inline">{t.swap}</span>
            </Button>
            <Button variant="danger" on:click={clearAll} title={t.clear + ' (Cmd+K)'} class="min-h-[44px] min-w-[44px]">
                <Trash2 class="w-4 h-4" />
                <span class="hidden sm:inline">{t.clear}</span>
            </Button>
            <Button variant="primary" on:click={saveToHistory} title={t.save} class="min-h-[44px] min-w-[44px]">
                {#if showSaveNotification}
                    <Check class="w-4 h-4" />
                    <span>Saved</span>
                {:else}
                    <Save class="w-4 h-4" />
                    <span>{t.save}</span>
                {/if}
            </Button>
        </div>
    </div>

    <!-- Stats -->
    <DiffStats stats={diffResult.stats} />

    <!-- Editors Area -->
    <div class="flex flex-col lg:grid lg:grid-cols-2 gap-4 mb-6 h-auto lg:h-[600px]">
        <div class="h-64 sm:h-80 lg:h-full">
            <DiffEditor
                bind:this={originalEditor}
                bind:value={original}
                label={t.original}
                placeholder="Paste original text here..."
                on:scroll={(e) => handleEditorScroll(e, 'original')}
            />
        </div>
        <div class="h-64 sm:h-80 lg:h-full">
            <DiffEditor
                bind:this={modifiedEditor}
                bind:value={modified}
                label={t.modified}
                placeholder="Paste modified text here..."
                on:scroll={(e) => handleEditorScroll(e, 'modified')}
            />
        </div>
    </div>

    <!-- Visualizer Area -->
    <div class="h-[400px] sm:h-[500px] max-h-[70vh]">
        <DiffVisualizer
            {diffResult}
            mode={viewMode}
            originalLabel={t.original}
            modifiedLabel={t.modified}
        />
    </div>

    <!-- Guide & SEO Content -->
    <div class="mt-12 space-y-12">
      <GuideSection
        title={t.guide.title}
        intro={t.guide.intro}
        featuresTitle={t.guide.featuresTitle}
        f1={t.guide.f1}
        f2={t.guide.f2}
        f3={t.guide.f3}
        tipsTitle={t.guide.tipsTitle}
        tip1={t.guide.tip1}
        tip2={t.guide.tip2}
        tip3={t.guide.tip3}
      />

      <AdPlaceholder />
  <FAQSection title={t.faqTitle} items={faqItems} />
    </div>
    <div class="mt-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="diff-viewer" currentCategory="dev" />
  </div>
</main>
</div>

