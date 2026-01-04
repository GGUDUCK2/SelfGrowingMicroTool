<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';
  import RegexEditor from '$lib/components/regex-tester/RegexEditor.svelte';
  import MatchViewer from '$lib/components/regex-tester/MatchViewer.svelte';
  import RegexCheatsheet from '$lib/components/regex-tester/RegexCheatsheet.svelte';
  import RegexLibrary from '$lib/components/regex-tester/RegexLibrary.svelte';
  import { getMatches } from '$lib/utils/regex';
  import { db } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { browser } from '$app/environment';

  $: lang = $page.params.lang || 'en';
  $: dictionary = getDictionary(lang);
  $: t = dictionary.tools.regexTester;

  let pattern = '';
  let flags = 'g';
  let testString = 'Hello World! user@example.com 2025-02-01';

  let matches: any[] = [];
  let error: string | null = null;
  let copied = false;

  // History
  let history = liveQuery(() => db.regexHistory.orderBy('createdAt').reverse().limit(10).toArray());

  // Debounced execution
  let timeout: any;

  $: {
    if (browser) {
      updateUrl();
      runRegex(pattern, flags, testString);
    }
  }

  function runRegex(p: string, f: string, tStr: string) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      const result = getMatches(p, f, tStr);
      matches = result.matches;
      error = result.error;
    }, 100);
  }

  function handleEditorChange(e: CustomEvent) {
    pattern = e.detail.pattern;
    flags = e.detail.flags;
  }

  function handleTestStringChange(e: CustomEvent) {
    testString = e.detail.testString;
  }

  function handleLibrarySelect(e: CustomEvent) {
    pattern = e.detail.pattern;
    flags = e.detail.flags;
  }

  function updateUrl() {
    if (!browser) return;
    const url = new URL(window.location.href);
    url.searchParams.set('pattern', pattern);
    url.searchParams.set('flags', flags);
    url.searchParams.set('text', testString);
    window.history.replaceState({}, '', url);
  }

  async function saveToHistory() {
    if (!pattern) return;
    try {
      await db.regexHistory.add({
        pattern,
        flags,
        createdAt: new Date()
      });
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  async function deleteHistory(id: number) {
    await db.regexHistory.delete(id);
  }

  function loadHistory(item: any) {
    pattern = item.pattern;
    flags = item.flags;
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function copyPattern() {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('pattern')) pattern = params.get('pattern') || '';
    if (params.has('flags')) flags = params.get('flags') || 'g';
    if (params.has('text')) testString = params.get('text') || '';
  });
</script>

<svelte:head>
  <title>{t.title} - MicroFactory</title>
  <meta name="description" content={t.description} />
  <meta name="keywords" content="regex, regex tester, regular expression, debug regex, regex visualizer" />

  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Regex Pro",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": t.description
    })}
  </script>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <!-- Header -->
  <div class="text-center mb-12">
    <div class="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
        <path d="M18 14h-8"/>
        <path d="M15 18h-5"/>
        <path d="M10 6h8v4h-8V6Z"/>
      </svg>
    </div>
    <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
      {t.title}
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
      {t.description}
    </p>
  </div>

  <!-- Main Tool -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
    <!-- Left Column: Editor & Viewer (8 cols) -->
    <div class="lg:col-span-8 space-y-6">
      <RegexEditor {pattern} {flags} dictionary={t} on:change={handleEditorChange} />

      <div class="flex gap-4">
        <button
          class="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
          on:click={saveToHistory}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 011-1h5a1 1 0 110 2h-5a1 1 0 01-1-1z" />
          </svg>
          {t.save}
        </button>
        <button
          class="flex-1 py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          on:click={copyLink}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {copied ? t.copied : t.share}
        </button>
        <button
          class="flex-1 py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          on:click={copyPattern}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {t.copy}
        </button>
      </div>

      <MatchViewer {testString} {matches} {error} dictionary={t} on:change={handleTestStringChange} />
    </div>

    <!-- Right Column: Sidebar (4 cols) -->
    <div class="lg:col-span-4 space-y-6">
      <div class="h-64 lg:h-80">
        <RegexLibrary dictionary={t} on:select={handleLibrarySelect} />
      </div>
      <div class="h-64 lg:h-80">
        <RegexCheatsheet dictionary={t} />
      </div>

      <!-- History Section -->
      <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-indigo-100 dark:border-indigo-900 shadow-sm">
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 px-2">{t.history}</h3>
        {#if $history && $history.length > 0}
          <div class="space-y-2">
            {#each $history as item}
              <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 group">
                <button class="flex-grow min-w-0 mr-3 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1" on:click={() => loadHistory(item)}>
                  <div class="text-sm font-mono font-medium text-slate-700 dark:text-slate-200 truncate">
                    /{item.pattern}/{item.flags}
                  </div>
                  <div class="text-xs text-slate-400">
                    {item.createdAt.toLocaleDateString()}
                  </div>
                </button>
                <button
                  class="text-slate-400 hover:text-red-500 transition-colors p-1"
                  on:click={() => deleteHistory(item.id)}
                  title={t.delete}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
            {t.historyEmpty || "No history yet"}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Documentation & FAQ -->
  <div class="prose dark:prose-invert max-w-4xl mx-auto">
    <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-indigo-100 dark:border-indigo-900 shadow-sm">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t.faqTitle}
      </h2>
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.q1}</h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{t.a1}</p>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.q2}</h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{t.a2}</p>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.q3}</h3>
          <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{t.a3}</p>
        </div>
      </div>
    </div>
  </div>
</div>
