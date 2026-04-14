<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getDictionary } from '$lib/dictionaries';
  import { parseExpression, generateTruthTable, simplify, getKarnaughMap, getCanonicalForms, astToString, generateExpressionFromTruthTable } from '$lib/utils/logic-forge/engine';
  import type { LogicAST, TruthTableData, KarnaughMapData } from '$lib/types/logic-forge';
  import { db } from '$lib/db';
  import { onMount } from 'svelte';

  import ExpressionInput from '$lib/components/logic-forge/ExpressionInput.svelte';
  import TruthTable from '$lib/components/logic-forge/TruthTable.svelte';
  import CircuitVisualizer from '$lib/components/logic-forge/CircuitVisualizer.svelte';
  import KarnaughMap from '$lib/components/logic-forge/KarnaughMap.svelte';
  import SimplificationSteps from '$lib/components/logic-forge/SimplificationSteps.svelte';
  import HistoryPanel from '$lib/components/logic-forge/HistoryPanel.svelte';
  import Toolbar from '$lib/components/logic-forge/Toolbar.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import { copyToClipboard } from '$lib/utils';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang).tools.logicForge;

  $: faqItems = [
    { q: dict?.q1, a: dict?.a1 },
    { q: dict?.q2, a: dict?.a2 },
    { q: dict?.q3, a: dict?.a3 }
  ];

  let expression = '';
  let ast: LogicAST | null = null;
  let truthTable: TruthTableData | null = null;
  let kmap: KarnaughMapData | null = null;
  let simplifiedExpr: string = '';
  let canonical: { sop: string, pos: string } | null = null;

  let error: string | null = null;
  let mode: 'analyzer' | 'designer' = 'analyzer';

  // Tabs
  let activeTab: 'table' | 'circuit' | 'kmap' | 'simplify' = 'table';

  onMount(() => {
      const q = $page.url.searchParams.get('q');
      if (q) {
          expression = q;
          analyze(false); // Don't save on load
      }
  });

  async function updateUrl() {
      const url = new URL($page.url);
      if (expression.trim()) {
          url.searchParams.set('q', expression);
      } else {
          url.searchParams.delete('q');
      }
      // eslint-disable-next-line svelte/no-navigation-without-resolve
      await goto(url.toString(), { keepFocus: true, replaceState: true, noScroll: true });
  }

  function analyze(save = true) {
    error = null;
    if (!expression.trim()) {
        ast = null;
        truthTable = null;
        kmap = null;
        return;
    }

    try {
      updateUrl();
      ast = parseExpression(expression);

      const forceVars = mode === 'designer' && truthTable ? truthTable.variables : undefined;
      truthTable = generateTruthTable(ast, forceVars);

      // Advanced features
      if (truthTable.variables.length <= 4) {
          kmap = getKarnaughMap(truthTable);
      } else {
          kmap = null;
      }

      const simpleAst = simplify(ast);
      simplifiedExpr = astToString(simpleAst);
      canonical = getCanonicalForms(truthTable);

      if (save) {
          db.logicForgeHistory.add({
            expression,
            type: 'truth-table',
            createdAt: new Date(),
            starred: 0
          }).catch(() => {});
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = String(e);
      }
      ast = null;
      truthTable = null;
      kmap = null;
    }
  }

  function handleRestore(e: CustomEvent<string>) {
      expression = e.detail;
      mode = 'analyzer';
      analyze(true);
  }

  function handleSave() {
      if (!expression.trim()) return;
      db.logicForgeHistory.add({
        expression,
        type: 'truth-table',
        createdAt: new Date(),
        starred: 1
      });
  }

  function handleCopy() {
      if (expression) copyToClipboard(expression);
  }

  function handleTruthTableToggle(e: CustomEvent<{ index: number; value: boolean }>) {
      if (!truthTable) return;
      const { index, value } = e.detail;

      // Update local state immediately for responsiveness
      truthTable.rows[index].result = value;
      truthTable = { ...truthTable }; // Trigger reactivity for table

      // Generate new expression
      const newExpr = generateExpressionFromTruthTable(
          truthTable.rows.map(r => r.result),
          truthTable.variables
      );

      expression = newExpr;
      analyze(false);
  }

  function toggleMode() {
      mode = mode === 'analyzer' ? 'designer' : 'analyzer';
      if (mode === 'designer' && !truthTable) {
          // Initialize with default if empty
          expression = 'A & B';
          analyze(false);
      }
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
      // Ctrl+Enter or Cmd+Enter to analyze
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          analyze(true);
      }
      // Ctrl+Space to toggle mode
      if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
          e.preventDefault();
          toggleMode();
      }
  }
  $: schema = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "isAccessibleForFree": true,
      "name": dict.title,
      "url": "https://microfactory.app/tools/logic-forge",
      "author": {
        "@type": "Organization",
        "name": "MicroFactory"
      },
      "operatingSystem": "Web, iOS, Android, macOS, Windows, Linux",
      "applicationCategory": "DeveloperApplication, EducationalApplication",
      "browserRequirements": "Requires JavaScript. HTML5.",
      "datePublished": "2023-10-01",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": "Truth Table Generator, Logic Circuit Visualizer, Boolean Algebra Simplifier, Karnaugh Map Solver, Interactive Logic Simulation, Reverse Boolean Engineering, Logic Circuit Designer",
      "screenshot": "https://microfactory.app/screenshots/logic-forge.png"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://microfactory.app"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Tools",
          "item": "https://microfactory.app/tools"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": dict.title,
          "item": "https://microfactory.app/tools/logic-forge"
        }
      ]
    }
  ];

  $: faqSchema = {
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
  };
</script>
<Head
  title={`${expression ? expression + ' - ' : ''}${dict.title}`}
  description={dict.description}
  keywords="logic gates, truth table generator, boolean algebra, logic circuit simulator, online tool, digital logic design, karnaugh map, boolean simplifier"
/>


<svelte:window on:keydown={handleGlobalKeydown} />

<svelte:head>
        {@html '<script type="application/ld+json">' + JSON.stringify(schema) + '</script>'}

  {@html '<script type="application/ld+json">' + JSON.stringify(faqSchema) + '</script>'}

</svelte:head>

<div class="max-w-7xl mx-auto space-y-8">
  <!-- Header -->
  <div class="text-center space-y-4 pt-4">
    <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
      {dict.title.split(':')[0]}
    </h1>
    <p class="text-lg text-gray-600 max-w-2xl mx-auto">
      {dict.description}
    </p>
  </div>

  <!-- Main Workspace -->
  <main class="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow">
    <!-- Left: History -->
    <div class="lg:col-span-1 hidden lg:block">
       <HistoryPanel {lang} on:restore={handleRestore} />
    </div>

    <!-- Center: Editor & Visualizer -->
    <div class="lg:col-span-3 space-y-6">
       <!-- Input Area -->
       <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 relative overflow-visible z-20">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
             <div class="flex items-center bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                <button
                   class="flex-1 sm:flex-none px-4 py-2 min-h-[44px] min-w-[44px] text-sm font-medium rounded-md transition-colors {mode === 'analyzer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
                   on:click={() => mode = 'analyzer'}
                >
                   {dict.analyzer}
                </button>
                <button
                   class="flex-1 sm:flex-none px-4 py-2 min-h-[44px] min-w-[44px] text-sm font-medium rounded-md transition-colors {mode === 'designer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
                   on:click={toggleMode}
                >
                   {dict.designer}
                </button>
             </div>
             {#if mode === 'designer'}
                <span class="text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full animate-pulse w-full sm:w-auto text-center">
                   {dict.editingTruthTable}
                </span>
             {/if}
          </div>

          <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
             <div class="flex-1 w-full">
                 <label for="logicInput" class="block text-sm font-medium text-gray-700 mb-1 ml-1">{dict.input}</label>
                <div class={mode === 'designer' ? 'pointer-events-none opacity-60' : ''}>
                    <ExpressionInput {lang} label={dict.input} bind:value={expression} {error} on:submit={() => analyze(true)} on:input={() => { if(error) error = null; }} />
                </div>
             </div>
             <div class="flex items-end h-full sm:pt-6">
                 <Toolbar {lang} on:save={handleSave} on:copy={handleCopy} />
             </div>
          </div>

          <!-- Quick Operators Helper -->
          {#if mode === 'analyzer'}
          <div class="flex flex-wrap gap-2 text-xs text-gray-500 font-mono">
             {#each Object.values(dict.operators) as label (label)}
                 <button
                    class="px-3 py-2 min-h-[44px] min-w-[44px] bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded border border-gray-200 transition-colors"
                    aria-label="Insert {label}"
                    on:click={() => {
                        expression += (expression && !expression.endsWith(' ') ? ' ' : '') + label.split(' ')[0] + ' ';
                    }}
                 >
                    {label}
                 </button>
             {/each}
             <!-- Extra Operators -->
             <button class="px-3 py-2 min-h-[44px] min-w-[44px] bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded border border-gray-200 transition-colors" aria-label="Insert Implies" on:click={() => expression += ' -> '}>→</button>
             <button class="px-3 py-2 min-h-[44px] min-w-[44px] bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded border border-gray-200 transition-colors" aria-label="Insert Equivalent" on:click={() => expression += ' <-> '}>↔</button>
          </div>
          {/if}
       </div>

       <!-- Tabs -->
       <div class="flex items-center gap-1 border-b border-gray-200 overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide">
          <button
             class="px-4 py-2 min-h-[44px] min-w-[44px] font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap {activeTab === 'table' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
             on:click={() => activeTab = 'table'}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table"><path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
             {dict.truthTable}
          </button>
          <button
             class="px-4 py-2 min-h-[44px] min-w-[44px] font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap {activeTab === 'circuit' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
             on:click={() => activeTab = 'circuit'}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-network"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
             {dict.circuit}
          </button>
          <button
             class="px-4 py-2 min-h-[44px] min-w-[44px] font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap {activeTab === 'kmap' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
             on:click={() => activeTab = 'kmap'}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grid"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
             K-Map
          </button>
          <button
             class="px-4 py-2 min-h-[44px] min-w-[44px] font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap {activeTab === 'simplify' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
             on:click={() => activeTab = 'simplify'}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
             {dict.simplify}
          </button>
       </div>

       <!-- Output Area -->
       <div class="min-h-[500px]">
          {#if activeTab === 'table'}
             <TruthTable {lang} data={truthTable} editable={mode === 'designer'} on:toggle={handleTruthTableToggle} />
          {:else if activeTab === 'circuit'}
             <CircuitVisualizer {lang} {ast} />
          {:else if activeTab === 'kmap'}
             <KarnaughMap data={kmap} />
          {:else if activeTab === 'simplify'}
             <SimplificationSteps simplified={simplifiedExpr} sop={canonical?.sop || ''} pos={canonical?.pos || ''} />
          {/if}
       </div>
    </div>

    <!-- Mobile History (visible only on small screens) -->
    <div class="lg:hidden">
       <HistoryPanel {lang} on:restore={handleRestore} />
    </div>
  </main>

  <GuideSection {...dict.guide} />
  <FAQSection title={dict.faqTitle} items={faqItems} />
  <RelatedTools currentToolId="logic-forge" category="development" />
</div>
