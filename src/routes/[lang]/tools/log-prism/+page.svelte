<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { fade, slide } from 'svelte/transition';
  import { getDictionary } from '$lib/dictionaries';
  import { parseLogs } from '$lib/utils/log-prism/parser';
  import { clusterLogs, type LogCluster } from '$lib/utils/log-prism/clustering';
  import { generateInsightReport } from '$lib/utils/log-prism/report';
  import type { LogEntry } from '$lib/utils/log-prism/types';
  import { logPrismDB, pruneHistory } from '$lib/db/log-prism';
  import { Download, Upload, AlertTriangle, Activity, Trash2, FileJson, List, LayoutGrid, X, FileText, ChevronLeft } from '@lucide/svelte';

  import LogUploader from '$lib/components/log-prism/LogUploader.svelte';
  import LogViewer from '$lib/components/log-prism/LogViewer.svelte';
  import LogTimeline from '$lib/components/log-prism/LogTimeline.svelte';
  import LogFilter from '$lib/components/log-prism/LogFilter.svelte';
  import LogDetail from '$lib/components/log-prism/LogDetail.svelte';
  import HistorySidebar from '$lib/components/log-prism/HistorySidebar.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { History } from '@lucide/svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = ((getDictionary(lang) as any)?.tools?.logPrism || {});

  // State
  let entries: LogEntry[] = [];
  let selectedEntry: LogEntry | null = null;
  let searchTerm = '';
  let selectedLevels = { error: true, warn: true, info: true, debug: true };
  let timeRange: { start: number, end: number } | null = null;
  let showUploader = true;
  let isParsing = false;
  let showHistory = false;
  let viewMode: 'list' | 'cluster' = 'list';
  let showShortcuts = false;
  let reportCopied = false;

  // Derived
  $: filteredEntries = entries.filter(e => {
      // Level Filter
      if (!selectedLevels[e.level as keyof typeof selectedLevels] && e.level !== 'unknown') return false;

      // Time Filter
      if (timeRange && e.timestamp) {
          const t = e.timestamp.getTime();
          if (t < timeRange.start || t > timeRange.end) return false;
      }

      // Text Filter
      if (searchTerm) {
          try {
              // Simple Includes for speed, regex if starts with /
              if (searchTerm.startsWith('/') && searchTerm.endsWith('/')) {
                   const regex = new RegExp(searchTerm.slice(1, -1), 'i');
                   return regex.test(e.raw);
              }
              return e.raw.toLowerCase().includes(searchTerm.toLowerCase());
          } catch {
              return e.raw.toLowerCase().includes(searchTerm.toLowerCase());
          }
      }
      return true;
  });

  $: clusteredEntries = viewMode === 'cluster' ? clusterLogs(filteredEntries) : [];

  $: stats = {
      total: entries.length,
      filtered: filteredEntries.length,
      errors: entries.filter(e => e.level === 'error').length,
      warns: entries.filter(e => e.level === 'warn').length
  };

  $: spikeWarning = detectSpikes(filteredEntries);

  function detectSpikes(logs: LogEntry[]) {
      if (logs.length < 50) return null;
      const errors = logs.filter(e => e.level === 'error').length;
      if (errors / logs.length > 0.15) return `${dict.levels.error} Rate: ${(errors/logs.length*100).toFixed(1)}%`;
      return null;
  }

  // Handlers
  async function handleLoad(event: CustomEvent) {
      isParsing = true;
      showUploader = false;

      const { data, name } = event.detail;

      // Yield to UI
      setTimeout(async () => {
          const parsed = parseLogs(data);
          entries = parsed;
          isParsing = false;

          // Save to DB
          try {
              // Limit size if too huge? Dexie handles large strings well usually (IndexedDB limits are high).
              // But strictly, we should probably check size.
              if (data.length < 50 * 1024 * 1024) { // 50MB limit
                  await logPrismDB.sessions.add({
                      name: name || `Session ${new Date().toLocaleString()}`,
                      data: data,
                      createdAt: new Date(),
                      starred: 0,
                      stats: {
                        errorCount: parsed.filter(e => e.level === 'error').length,
                        warnCount: parsed.filter(e => e.level === 'warn').length,
                        entryCount: parsed.length
                      }
                  });
                  await pruneHistory();
              }
          } catch (e) {
              console.error("Failed to save session", e);
          }
      }, 50);
  }

  function handleHistoryLoad(data: string, name: string) {
      // Direct load from history (already saved)
      isParsing = true;
      showUploader = false;
      showHistory = false;

      setTimeout(() => {
          const parsed = parseLogs(data);
          entries = parsed;
          isParsing = false;
      }, 50);
  }

  function handleTimeSelect(start: number, end: number) {
      timeRange = { start, end };
  }

  function clear() {
      if (confirm('Clear all logs?')) {
          entries = [];
          timeRange = null;
          showUploader = true;
      }
  }

  function clearTimeFilter() {
      timeRange = null;
  }

  function exportJson() {
      const data = JSON.stringify(filteredEntries, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `log-prism-export-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
  }

  function handleReport() {
      const clusters = clusterLogs(filteredEntries);
      const report = generateInsightReport(filteredEntries, clusters);
      navigator.clipboard.writeText(report);
      reportCopied = true;
      setTimeout(() => reportCopied = false, 2000);
  }

  function handleKeydown(e: KeyboardEvent) {
      const isCmd = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      // Allow Escape on inputs, but not other shortcuts
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) && e.key !== 'Escape') return;

      if (isCmd && e.key === 'k') {
          e.preventDefault();
          document.getElementById('log-search')?.focus();
      }

      if (isCmd && e.key === 's') {
          e.preventDefault();
          handleReport();
      }

      if (isCmd && e.key === 'o') {
          e.preventDefault();
          if (filteredEntries.length > 0) {
             if (confirm('Load new log? Current session will be saved to history.')) {
                 entries = [];
                 timeRange = null;
                 showUploader = true;
             }
          } else {
             showUploader = true;
          }
      }

      if (e.key === 'Escape') {
          if (showShortcuts) {
              showShortcuts = false;
              return;
          }
          if (selectedEntry) {
              selectedEntry = null;
              return;
          }
          if (showHistory) {
              showHistory = false;
              return;
          }
          if (timeRange) {
              timeRange = null;
              return;
          }
      }

      if (e.key === '?') {
           e.preventDefault();
           showShortcuts = !showShortcuts;
      }
  }

  const shortcuts = [
      { keys: ['Ctrl', 'K'], desc: 'Search Logs' },
      { keys: ['Ctrl', 'S'], desc: 'Copy Report' },
      { keys: ['Ctrl', 'O'], desc: 'Open / New' },
      { keys: ['Esc'], desc: 'Clear / Close' },
      { keys: ['?'], desc: 'Shortcuts' }
  ];

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${$page.url.origin}/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": dict.title,
        "item": `${$page.url.origin}/${lang}/tools/log-prism`
      }
    ]
  };

</script>
<Head
  title={dict.title}
  description={dict.description}
  keywords="log viewer, log analyzer, nginx log parser, syslog viewer, json log viewer, error log analysis, automated insights, smart log generation"
/>


<svelte:window on:keydown={handleKeydown} />

<svelte:head>




  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/log-prism"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/log-prism"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/log-prism"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/log-prism"} />
  {@html `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/log-prism",
        "isAccessibleForFree": true,
      "name": (dict as any)?.title || "",
      "description": (dict as any)?.description || "",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "featureList": [
        "Nginx/Apache/Syslog Parsing",
        "Log Pattern Clustering",
        "JSON Log Viewer",
        "Error Spike Detection",
        "Timeline Visualization",
        "Smart History & Shortcuts",
        "Client-side Processing",
        "Smart Example Generation",
        "Automated Insight Reports"
      ]
    }
  </scr` + `ipt>`}



  {@html `<script type="application/ld+json">

  </scr` + `ipt>`}
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</scr` + `ipt>`}

</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white">

    <!-- Header -->
    <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
        <div class="flex items-center gap-3">
             <a href="/{lang}" aria-label="Back" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -ml-2 rounded-lg">
                 <ChevronLeft size={20} />
             </a>
             <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Activity size={20} />
            </div>
            <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 hidden sm:block">
                {dict.title}
            </h1>
        </div>

        <div class="flex items-center gap-3">
            <button class="p-2 text-slate-500 hover:text-indigo-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                on:click={() => showHistory = !showHistory}
                title="History"
                aria-label="Toggle History"
            >
                <History size={20} />
            </button>

            {#if entries.length > 0}
                <div class="hidden sm:flex items-center gap-4 mr-4 text-xs font-mono text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-4">
                    <span>{stats.filtered} / {stats.total} {dict.entries}</span>
                    {#if stats.errors > 0}
                        <span class="text-red-500 font-bold">{stats.errors} {dict.errors}</span>
                    {/if}
                </div>

                <button class="p-2 text-slate-500 hover:text-indigo-600 transition-colors relative min-h-[44px] min-w-[44px] flex items-center justify-center"
                    on:click={handleReport}
                    title={dict.report?.title || "Insight Report"}
                    aria-label="Generate Insight Report"
                >
                    <FileText size={20} />
                    {#if reportCopied}
                        <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap" transition:fade>
                            Copied!
                        </span>
                    {/if}
                </button>

                <button class="p-2 text-slate-500 hover:text-indigo-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    on:click={exportJson}
                    title={dict.export}
                    aria-label={dict.export}
                >
                    <Download size={20} />
                </button>

                 <button class="p-2 text-slate-500 hover:text-red-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    on:click={clear}
                    title={dict.clear}
                    aria-label={dict.clear}
                >
                    <Trash2 size={20} />
                </button>
            {/if}
        </div>
    </header>

    <main class="flex-1 flex flex-col relative overflow-hidden">
        {#if showShortcuts}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" on:click={() => showShortcuts = false}>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 min-h-[44px] min-w-[44px]" on:click|stopPropagation role="document">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-lg text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
                        <button on:click={() => showShortcuts = false} class="text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg">
                            <X size={20} />
                        </button>
                    </div>
                    <div class="space-y-2">
                        {#each shortcuts as s}
                            <div class="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                                <span class="text-sm text-slate-600 dark:text-slate-400">{s.desc}</span>
                                <div class="flex gap-1">
                                    {#each s.keys as k}
                                        <kbd class="px-2 py-0.5 rounded text-xs font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm text-slate-500 dark:text-slate-300">{k}</kbd>
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}

        {#if showHistory}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="absolute inset-0 z-40 bg-black/20 backdrop-blur-sm min-h-[44px] min-w-[44px]" on:click={() => showHistory = false}></div>
            <HistorySidebar onClose={() => showHistory = false} onLoad={handleHistoryLoad} />
        {/if}

        {#if showUploader}
            <div class="flex-1 flex flex-col items-center justify-center p-4" transition:fade>
                <div class="w-full max-w-2xl">
                    <LogUploader {dict} on:load={handleLoad} />
                    {#if isParsing}
                        <div class="mt-8 text-center text-slate-500">
                            <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
                            <p>Parsing logs...</p>
                        </div>
                    {/if}
                </div>
            </div>
        {:else}
            <!-- Timeline & Filter -->
            <div class="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20 shadow-sm flex flex-col">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pr-2">
                    <LogFilter bind:searchTerm bind:selectedLevels {dict} />
                    <div class="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-2 gap-1">
                         <button class="p-2 rounded-md transition-colors {viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'} min-h-[44px] min-w-[44px] flex items-center justify-center"
                            on:click={() => viewMode = 'list'}
                            title="List View"
                            aria-label="Switch to List View"
                         >
                            <List size={18} />
                         </button>
                         <button class="p-2 rounded-md transition-colors {viewMode === 'cluster' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'} min-h-[44px] min-w-[44px] flex items-center justify-center"
                            on:click={() => viewMode = 'cluster'}
                            title="Cluster View"
                            aria-label="Switch to Cluster View"
                         >
                            <LayoutGrid size={18} />
                         </button>
                    </div>
                </div>

                {#if spikeWarning}
                    <div class="bg-red-50 dark:bg-red-900/20 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2 border-t border-red-100 dark:border-red-900/30" transition:slide>
                        <AlertTriangle size={14} />
                        {spikeWarning}
                    </div>
                {/if}

                {#if entries.length > 0}
                    <div class="h-16 relative w-full border-t border-slate-200 dark:border-slate-800">
                        <LogTimeline entries={filteredEntries} {timeRange} onSelectTime={handleTimeSelect} />
                        {#if timeRange}
                            <button class="absolute top-1 right-1 px-3 py-1.5 bg-slate-800 text-white text-xs rounded opacity-80 hover:opacity-100 shadow-md z-30 min-h-[44px] min-w-[44px]"
                                on:click={clearTimeFilter}
                                aria-label="Clear Time Zoom"
                            >
                                Clear Zoom
                            </button>
                        {/if}
                    </div>
                {/if}
            </div>

            <!-- Viewer -->
            <div class="flex-1 overflow-hidden relative">
                <LogViewer
                    entries={filteredEntries}
                    clusteredEntries={clusteredEntries}
                    viewMode={viewMode}
                    {dict}
                    selectedId={selectedEntry?.id || null}
                    on:select={(e) => selectedEntry = e.detail}
                />

                {#if selectedEntry}
                    <div transition:slide={{ axis: 'x', duration: 200 }}>
                        <LogDetail
                            entry={selectedEntry}
                            {dict}
                            onClose={() => selectedEntry = null}
                        />
                    </div>
                {/if}
            </div>
        {/if}
</main>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <GuideSection {...(dict as any)?.guide} />
    <AdPlaceholder />
    <FAQSection
        title={dict.faqTitle}
        items={[
            { q: (dict as any)?.q1, a: (dict as any)?.a1 },
            { q: (dict as any)?.q2, a: (dict as any)?.a2 },
            { q: (dict as any)?.q3, a: (dict as any)?.a3 }
        ]}
    />
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="log-prism" currentCategory="dev" />
</div>
</div>
