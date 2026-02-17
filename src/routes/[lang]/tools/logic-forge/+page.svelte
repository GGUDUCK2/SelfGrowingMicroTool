<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getDictionary } from '$lib/dictionaries';
  import { parseExpression, generateTruthTable, simplify, getKarnaughMap, getCanonicalForms } from '$lib/utils/logic-forge/engine';
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
  import { copyToClipboard } from '$lib/utils';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang).tools.logicForge;

  $: faqItems = [
    { q: dict.q1, a: dict.a1 },
    { q: dict.q2, a: dict.a2 },
    { q: dict.q3, a: dict.a3 }
  ];

  let expression = '';
  let ast: LogicAST | null = null;
  let truthTable: TruthTableData | null = null;
  let kmap: KarnaughMapData | null = null;
  let simplifiedExpr: string = '';
  let canonical: { sop: string, pos: string } | null = null;

  let error: string | null = null;
  let viewMode: 'table' | 'circuit' = 'table';

  // Tabs
  let activeTab: 'table' | 'circuit' | 'kmap' | 'simplify' = 'table';

  onMount(() => {
      const q = $page.url.searchParams.get('q');
      if (q) {
          expression = q;
          analyze(false); // Don't save on load
      }
  });

  function updateUrl() {
      const url = new URL($page.url);
      if (expression.trim()) {
          url.searchParams.set('q', expression);
      } else {
          url.searchParams.delete('q');
      }
      goto(url.toString(), { keepFocus: true, replaceState: true, noScroll: true });
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
      truthTable = generateTruthTable(ast);

      // Advanced features
      if (truthTable.variables.length <= 4) {
          kmap = getKarnaughMap(truthTable);
      } else {
          kmap = null;
      }

      const simpleAst = simplify(ast);
      // Re-serialize simplified AST - quick hack or need a serializer?
      // engine.ts doesn't have astToString.
      // But we can just use the debug string or implement a simple one.
      // Actually simplify returns an AST. Let's just create a quick serializer here or in engine.
      // For now, I'll rely on the fact that I need to show it stringified.
      // I'll add a simple serializer here.
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

  function astToString(node: LogicAST, precedence = 0): string {
      if (node.type === 'VAR') return node.name;
      if (node.type === 'CONST') return node.value ? '1' : '0';
      if (node.type === 'NOT') {
          const s = astToString(node.operand, 5);
          return '!' + s; // High precedence
      }
      // Binary
      let op = '';
      let p = 0;
      if (node.type === 'AND') { op = '&'; p = 4; }
      else if (node.type === 'OR') { op = '|'; p = 2; }
      else if (node.type === 'XOR') { op = '^'; p = 3; }
      else if (node.type === 'IMPLIES') { op = '->'; p = 1; }
      else if (node.type === 'EQUIV') { op = '<->'; p = 1; }
      else if (node.type === 'NAND') { op = ' NAND '; p = 4; }
      else if (node.type === 'NOR') { op = ' NOR '; p = 2; }
      else if (node.type === 'XNOR') { op = ' XNOR '; p = 3; }

      if ('left' in node) {
          const l = astToString(node.left, p);
          const r = astToString(node.right, p);
          const s = `${l} ${op} ${r}`;
          return p < precedence ? `(${s})` : s;
      }
      return '';
  }

  function handleRestore(e: CustomEvent<string>) {
      expression = e.detail;
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
</script>

<svelte:head>
  <title>{expression ? expression + ' - ' : ''}{dict.title}</title>
  <meta name="description" content={dict.description} />
  <meta name="keywords" content="logic gates, truth table generator, boolean algebra, logic circuit simulator, online tool, digital logic design, karnaugh map, boolean simplifier" />
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": dict.title,
      "url": "https://microfactory.app/tools/logic-forge",
      "author": {
        "@type": "Organization",
        "name": "MicroFactory"
      },
      "operatingSystem": "Any",
      "applicationCategory": "DeveloperApplication",
      "datePublished": "2023-10-01",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": "Truth Table Generator, Logic Circuit Visualizer, Boolean Algebra Simplifier, Karnaugh Map Solver, Interactive Logic Simulation",
      "screenshot": "https://microfactory.app/screenshots/logic-forge.png"
    })}
  </script>
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
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
    <!-- Left: History -->
    <div class="lg:col-span-1 hidden lg:block">
       <HistoryPanel {lang} on:restore={handleRestore} />
    </div>

    <!-- Center: Editor & Visualizer -->
    <div class="lg:col-span-3 space-y-6">
       <!-- Input Area -->
       <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 relative overflow-visible z-20">
          <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
             <div class="flex-1 w-full">
                <label class="block text-sm font-medium text-gray-700 mb-1 ml-1">{dict.input}</label>
                <ExpressionInput {lang} label={dict.input} bind:value={expression} {error} on:submit={() => analyze(true)} on:input={() => { if(error) error = null; }} />
             </div>
             <div class="flex items-end h-full sm:pt-6">
                 <Toolbar {lang} on:save={handleSave} on:copy={handleCopy} />
             </div>
          </div>

          <!-- Quick Operators Helper -->
          <div class="flex flex-wrap gap-2 text-xs text-gray-500 font-mono">
             {#each Object.entries(dict.operators) as [key, label]}
                 <button
                    class="px-2 py-1 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded border border-gray-200 transition-colors"
                    aria-label="Insert {label}"
                    on:click={() => {
                        expression += (expression && !expression.endsWith(' ') ? ' ' : '') + label.split(' ')[0] + ' ';
                    }}
                 >
                    {label}
                 </button>
             {/each}
             <!-- Extra Operators -->
             <button class="px-2 py-1 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded border border-gray-200 transition-colors" on:click={() => expression += ' -> '}>→</button>
             <button class="px-2 py-1 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded border border-gray-200 transition-colors" on:click={() => expression += ' <-> '}>↔</button>
          </div>
       </div>

       <!-- Tabs -->
       <div class="flex items-center gap-1 border-b border-gray-200 overflow-x-auto">
          <button
             class="px-4 py-2 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap {activeTab === 'table' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
             on:click={() => activeTab = 'table'}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table"><path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
             {dict.truthTable}
          </button>
          <button
             class="px-4 py-2 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap {activeTab === 'circuit' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
             on:click={() => activeTab = 'circuit'}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-network"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
             {dict.circuit}
          </button>
          <button
             class="px-4 py-2 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap {activeTab === 'kmap' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
             on:click={() => activeTab = 'kmap'}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grid"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
             K-Map
          </button>
          <button
             class="px-4 py-2 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap {activeTab === 'simplify' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
             on:click={() => activeTab = 'simplify'}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
             {dict.simplify}
          </button>
       </div>

       <!-- Output Area -->
       <div class="min-h-[500px]">
          {#if activeTab === 'table'}
             <TruthTable {lang} data={truthTable} />
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
  </div>

  <GuideSection {...dict.guide} />
  <FAQSection title={dict.faqTitle} items={faqItems} />
</div>
