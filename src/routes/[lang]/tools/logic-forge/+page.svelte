<script lang="ts">
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { parseExpression, generateTruthTable } from '$lib/utils/logic-forge/engine';
  import type { LogicAST, TruthTableData } from '$lib/types/logic-forge';
  import { db } from '$lib/db';

  import ExpressionInput from '$lib/components/logic-forge/ExpressionInput.svelte';
  import TruthTable from '$lib/components/logic-forge/TruthTable.svelte';
  import CircuitVisualizer from '$lib/components/logic-forge/CircuitVisualizer.svelte';
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
  let error: string | null = null;
  let viewMode: 'table' | 'circuit' = 'table';

  function analyze() {
    error = null;
    if (!expression.trim()) {
        ast = null;
        truthTable = null;
        return;
    }

    try {
      ast = parseExpression(expression);
      truthTable = generateTruthTable(ast);

      // Save to history automatically
      db.logicForgeHistory.add({
        expression,
        type: 'truth-table',
        createdAt: new Date(),
        starred: 0
      }).catch(() => {}); // Ignore error if add fails (e.g. storage full)
    } catch (e: any) {
      console.error(e);
      error = e.message;
      ast = null;
      truthTable = null;
    }
  }

  function handleRestore(e: CustomEvent<string>) {
      expression = e.detail;
      analyze();
  }

  function handleSave() {
      if (!expression.trim()) return;
      // Explicit save stars it
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
  <title>{dict.title}</title>
  <meta name="description" content={dict.description} />
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": dict.title,
      "operatingSystem": "Any",
      "applicationCategory": "DeveloperApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": "Truth Table Generator, Logic Circuit Visualizer, Boolean Algebra Simplifier, Logic Gate Simulator",
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
                <ExpressionInput {lang} bind:value={expression} {error} on:submit={analyze} on:input={() => { if(error) error = null; }} />
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
                    on:click={() => {
                        expression += (expression && !expression.endsWith(' ') ? ' ' : '') + label.split(' ')[0] + ' ';
                        // Trigger input update via assignment or manual dispatch? Binding handles it but need to focus.
                        // Ideally ExpressionInput exposes a focus method or we just bind.
                    }}
                 >
                    {label}
                 </button>
             {/each}
          </div>
       </div>

       <!-- View Toggle -->
       <div class="flex items-center gap-2 border-b border-gray-200 pb-1">
          <button
             class="px-4 py-2 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 border-b-2 {viewMode === 'table' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
             on:click={() => viewMode = 'table'}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-table"><path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
             {dict.truthTable}
          </button>
          <button
             class="px-4 py-2 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 border-b-2 {viewMode === 'circuit' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
             on:click={() => viewMode = 'circuit'}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-network"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
             {dict.circuit}
          </button>
       </div>

       <!-- Output Area -->
       <div class="min-h-[500px]">
          {#if viewMode === 'table'}
             <TruthTable {lang} data={truthTable} />
          {:else}
             <CircuitVisualizer {lang} {ast} />
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
