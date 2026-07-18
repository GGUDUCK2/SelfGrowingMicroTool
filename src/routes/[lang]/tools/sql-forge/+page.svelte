<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import { getDictionary } from '$lib/dictionaries';
  import { SqlEngine, type QueryResult, type TableInfo } from '$lib/utils/sql-forge/engine';
  import { db } from '$lib/db';
  import { Play, Upload, Database, Code, Terminal, Clock, FolderOpen, Menu, X } from '@lucide/svelte';

  import SqlEditor from '$lib/components/sql-forge/SqlEditor.svelte';
  import ResultTable from '$lib/components/sql-forge/ResultTable.svelte';
  import Sidebar from '$lib/components/sql-forge/Sidebar.svelte';
  import ImportModal from '$lib/components/sql-forge/ImportModal.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = ((dict as any)?.tools?.sqlForge || {});

  let engine: SqlEngine;
  let query = '';
  let result: QueryResult | null = null;
  let tables: TableInfo[] = [];
  let showImport = false;
  let isRunning = false;
  let isSidebarOpen = false;

  onMount(async () => {
      engine = new SqlEngine();
      await engine.init();
      await refreshTables();
  });

  async function refreshTables() {
      if (engine) tables = await engine.getTables();
  }

  async function handleRun(e?: CustomEvent<string> | string) {
      let sql = typeof e === 'string' ? e : e?.detail || query;
      if (!sql || !sql.trim()) return;

      // Update editor if run from history
      if (typeof e === 'string' || e?.detail) {
          query = sql;
      }

      isRunning = true;
      result = await engine.execute(sql);
      isRunning = false;

      // Check if schema changed (CREATE/DROP)
      if (sql.match(/CREATE|DROP|ALTER/i)) {
          await refreshTables();
      }

      // Save history
      try {
          await db.sqlForgeHistory.add({
              query: sql,
              timestamp: new Date(),
              status: result.error ? 'error' : 'success',
              executionTime: result.time,
              starred: 0
          });
      } catch (err) {
          console.error('Failed to save history', err);
      }
  }

  async function handleImport(e: CustomEvent<{ name: string, data: any[] }>) {
      const { name, data } = e.detail;
      try {
          await engine.createTableFromData(name, data);
          await refreshTables();
          showImport = false;
          // Auto-run select
          handleRun(`SELECT * FROM ${name} LIMIT 100`);
      } catch (err) {
          alert('Import failed: ' + err);
      }
  }

  $: schemas = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/sql-forge",
        "isAccessibleForFree": true,
      "name": "SQL Forge",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Client-side SQL Engine",
        "CSV to SQL Import",
        "JSON to SQL Import",
        "Query History",
        "Export Results to CSV"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": t?.q1, "acceptedAnswer": { "@type": "Answer", "text": t?.a1 } },
        { "@type": "Question", "name": t?.q2, "acceptedAnswer": { "@type": "Answer", "text": t?.a2 } },
        { "@type": "Question", "name": t?.q3, "acceptedAnswer": { "@type": "Answer", "text": t?.a3 } }
      ]
    }
  ];
</script>
<Head
  title={t.title}
  description={t.description}
/>


<svelte:head>
  <link rel="canonical" href={"https://selfgrowingmicrotool.com/" + lang + "/tools/sql-forge"} />
  <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/sql-forge" />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/sql-forge" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/sql-forge" />
  {@html `<script type="application/ld+json">${JSON.stringify(schemas)}</scr` + `ipt>`}
</svelte:head>

<div class="h-[calc(100vh-4rem)] flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- Toolbar -->
    <header class="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0 z-20">
        <div class="flex items-center gap-3">
            <button class="md:hidden p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 min-h-[44px] min-w-[44px]" on:click={() => isSidebarOpen = !isSidebarOpen} aria-label="Toggle Menu">
                {#if isSidebarOpen}
                    <X size={20} />
                {:else}
                    <Menu size={20} />
                {/if}
            </button>
            <div class="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 hidden md:block">
                <Database size={20} />
            </div>
            <h1 class="font-bold text-gray-900 dark:text-white truncate hidden sm:block">{t.title}</h1>
        </div>

        <div class="flex items-center gap-2">
            <button
                class="flex items-center gap-2 px-3 py-1.5 min-h-[44px] min-w-[44px] text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                on:click={() => showImport = true}
            >
                <Upload size={16} />
                <span class="hidden sm:inline">{t.import}</span>
            </button>
            <button
                class="flex items-center gap-2 px-4 py-1.5 min-h-[44px] min-w-[44px] text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                on:click={() => handleRun()}
                disabled={isRunning}
            >
                {#if isRunning}
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {:else}
                    <Play size={16} />
                {/if}
                <span>{t.run}</span>
            </button>
        </div>
    </header>

    <!-- Main Layout -->
    <div class="flex-1 flex overflow-hidden relative">
        <!-- Mobile Sidebar Backdrop -->
        {#if isSidebarOpen}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="absolute inset-0 bg-black/50 z-20 md:hidden"
                on:click={() => isSidebarOpen = false}
                transition:fade={{ duration: 200 }}
            ></div>
        {/if}

        <!-- Sidebar -->
        <div class={`absolute md:static inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 md:transform-none bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar
                {tables}
                {t}
                on:run={(e) => {
                    handleRun(e);
                    isSidebarOpen = false;
                }}
            />
        </div>

        <!-- Workspace -->
        <main class="flex-1 flex flex-col min-w-0 bg-gray-100 dark:bg-gray-900/50 p-2 sm:p-4 gap-4 overflow-y-auto">
            <!-- Editor Pane -->
            <div class="flex flex-col gap-2 min-h-[200px] flex-shrink-0">
                <div class="flex items-center justify-between px-1">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Terminal size={14} />
                        {t.input}
                    </label>
                    <span class="text-xs text-gray-400">Ctrl + Enter to Run</span>
                </div>
                <SqlEditor bind:value={query} placeholder="SELECT * FROM ..." on:run={() => handleRun()} />
            </div>

            <!-- Results Pane -->
            <div class="flex-1 min-h-0 flex flex-col gap-2">
                <div class="flex items-center justify-between px-1">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Code size={14} />
                        {t.output}
                    </label>
                </div>
                <ResultTable {result} {t} />
            </div>

            <!-- Guide Section (Below fold) -->
            <div class="mt-8 prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2>{t.guide.title}</h2>
                <p>{t.guide.intro}</p>

                <div class="grid md:grid-cols-3 gap-6 not-prose my-8">
                    <div class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <h3 class="font-bold mb-2 flex items-center gap-2">
                            <Clock size={18} class="text-indigo-500" />
                            Fast
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400"><span class="markdown-body">{@html t.guide.f1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></p>
                    </div>
                    <div class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <h3 class="font-bold mb-2 flex items-center gap-2">
                            <FolderOpen size={18} class="text-green-500" />
                            Versatile
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400"><span class="markdown-body">{@html t.guide.f2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></p>
                    </div>
                    <div class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <h3 class="font-bold mb-2 flex items-center gap-2">
                            <Database size={18} class="text-purple-500" />
                            Private
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400"><span class="markdown-body">{@html t.guide.f3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></p>
                    </div>
                </div>

                <h3>{t.guide.tipsTitle}</h3>
                <ul>
                    <li><span class="markdown-body">{@html t.guide.tip1.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">$1</code>')}</span></li>
                    <li><span class="markdown-body">{@html t.guide.tip2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
                    <li><span class="markdown-body">{@html t.guide.tip3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span></li>
                </ul>

                <GuideSection {...t?.guide} />
  <AdPlaceholder />
  <FAQSection title={t.faqTitle} items={[
                    { q: t?.q1, a: t?.a1 },
                    { q: t?.q2, a: t?.a2 },
                    { q: t?.q3, a: t?.a3 }
                ]} />
            </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="sql-forge" currentCategory="dev" />
  </div>
</main>
    </div>
</div>

{#if showImport}
    <ImportModal {t} on:close={() => showImport = false} on:import={handleImport} />
{/if}
