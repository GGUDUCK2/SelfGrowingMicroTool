<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { onMount } from 'svelte';
  import { db, type PromptForgeHistory } from '$lib/db';
  import { extractVariables, compilePrompt, generateExport, generateTestSuite } from '$lib/utils/prompt-forge/parser';
  import { estimateTokens, estimateCost } from '$lib/utils/prompt-forge/tokenizer';
  import { type PromptTemplate } from '$lib/utils/prompt-forge/templates';

  import PromptEditor from '$lib/components/prompt-forge/PromptEditor.svelte';
  import VariableForm from '$lib/components/prompt-forge/VariableForm.svelte';
  import PromptPreview from '$lib/components/prompt-forge/PromptPreview.svelte';
  import HistorySidebar from '$lib/components/prompt-forge/HistorySidebar.svelte';
  import CodeExport from '$lib/components/prompt-forge/CodeExport.svelte';
  import TemplateModal from '$lib/components/prompt-forge/TemplateModal.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { Menu, X, Save, Copy, Trash2, Download, Code, BookTemplate } from '@lucide/svelte';

  // Locale
  $: lang = $page.params.lang || 'en';
  $: dictionary = getDictionary(lang);
  $: dict = (dictionary as any)?.tools.promptForge;

  // State
  let systemPrompt = "";
  let userPrompt = "";
  let values: Record<string, string> = {};

  // Scenario Management
  let scenarios: Record<string, Record<string, string>> = { 'default': {} };
  let activeScenarioId: string = 'default';

  let showSidebar = false;
  let showCodeExport = false;
  let showTemplateModal = false;
  let notification: string | null = null;

  // Derived
  $: variables = extractVariables((systemPrompt || '') + '\n' + (userPrompt || ''));
  $: compiledSystem = compilePrompt(systemPrompt, values);
  $: compiledUser = compilePrompt(userPrompt, values);

  // Stats
  $: totalTokens = estimateTokens(compiledSystem) + estimateTokens(compiledUser);
  $: totalCost = estimateCost(totalTokens, 'gpt-4');

  // Shortcuts
  onMount(() => {
      const handleKeydown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 's') {
              e.preventDefault();
              handleSave();
          }
          if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
              e.preventDefault();
              showCodeExport = true;
          }
      };
      window.addEventListener('keydown', handleKeydown);
      return () => window.removeEventListener('keydown', handleKeydown);
  });

  // Actions
  function showNotification(msg: string) {
    notification = msg;
    setTimeout(() => notification = null, 2000);
  }

  async function handleSave() {
    if (!userPrompt.trim() && !systemPrompt.trim()) return;

    // Generate a title if not present
    let title = userPrompt.split('\n')[0].slice(0, 50) || 'Untitled Prompt';
    if (title.length === 50) title += '...';

    const name = prompt(dict.scenarioName || "Enter a name for this prompt:", title);
    if (!name) return;

    // Create payload (store system & user prompt as JSON in template field)
    const payload = JSON.stringify({ s: systemPrompt, u: userPrompt });

    try {
        await db.promptForgeHistory.add({
            title: name,
            template: payload,
            variables: values, // Stores current active values
            scenarios: scenarios, // Stores all scenarios
            createdAt: new Date(),
            starred: 0
        });

        showNotification(dict.toolbar.saved);
    } catch (e) {
        console.error(e);
        alert('Failed to save history.');
    }
  }

  function handleLoad(item: PromptForgeHistory) {
      try {
          // Try to parse as JSON
          const data = JSON.parse(item.template);
          if (data.s !== undefined && data.u !== undefined) {
              systemPrompt = data.s;
              userPrompt = data.u;
          } else {
              // Legacy/Fallback
              userPrompt = item.template;
              systemPrompt = "";
          }
      } catch {
          // Plain text fallback
          userPrompt = item.template;
          systemPrompt = "";
      }

      values = item.variables || {};

      // Load scenarios if available
      if (item.scenarios) {
          scenarios = item.scenarios;
          activeScenarioId = 'default';
      } else {
          // Reset scenarios if loading legacy item
          scenarios = { 'default': { ...values } };
          activeScenarioId = 'default';
      }

      showSidebar = false;
  }

  function handleClear() {
      if(confirm('Clear all fields?')) {
          systemPrompt = "";
          userPrompt = "";
          values = {};
          scenarios = { 'default': {} };
          activeScenarioId = 'default';
          showNotification(dict.toolbar.cleared);
      }
  }

  function handleExport() {
      const data = generateExport(systemPrompt, userPrompt, values);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-forge-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
  }

  function handleTemplateSelect(t: PromptTemplate) {
      systemPrompt = t.system;
      userPrompt = t.user;
      values = { ...t.variables };
      scenarios = { 'default': { ...t.variables } };
      activeScenarioId = 'default';
      showTemplateModal = false;
      showNotification('Template loaded!');
  }

  $: jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/prompt-forge",
        "isAccessibleForFree": true,
      "name": "Prompt Forge",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Dynamic Variable Extraction",
        "Multi-Scenario Testing",
        "Token Cost Estimation",
        "Code Export (cURL, Python, Node.js)",
        "Template Library",
        "Test Suite Generation (JSON/Python)"
      ]
    };

  $: jsonLd2 = {
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
  title={dict.title}
  description={dict.description}
  keywords="prompt engineering, ai prompt generator, llm prompt testing, prompt variables, openai prompt optimization, prompt management"
/>


<svelte:head>

  <link rel="canonical" href={"https://selfgrowingmicrotool.com/" + lang + "/tools/prompt-forge"} />
  <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/prompt-forge" />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/prompt-forge" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/prompt-forge" />
  <!-- Twitter -->


  <!-- JSON-LD -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</scr` + `ipt>`}
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd2)}</scr` + `ipt>`}

</svelte:head>

<div class="flex h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-900">

  <!-- Sidebar -->
  <div class="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 md:relative md:translate-x-0 md:shadow-none border-r border-slate-200 dark:border-slate-700 {showSidebar ? 'translate-x-0' : '-translate-x-full'}">
      <div class="absolute top-4 right-4 md:hidden">
        <button on:click={() => showSidebar = false} class="p-2 text-slate-500 min-h-[44px] min-w-[44px]" aria-label="Close sidebar">
            <X class="w-6 h-6" />
        </button>
      </div>
      <HistorySidebar {dict} onLoad={handleLoad} />
  </div>

  <!-- Backdrop -->
  {#if showSidebar}
    <button
        class="fixed inset-0 bg-black/50 z-40 md:hidden cursor-default w-full h-full border-none min-h-[44px] min-w-[44px]"
        on:click={() => showSidebar = false}
        aria-label="Close Sidebar"
    ></button>
  {/if}

  <!-- Main Content -->
  <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
     <!-- Header -->
     <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
            <button
                class="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg min-h-[44px] min-w-[44px]"
                on:click={() => showSidebar = true}
                aria-label="Open sidebar"
            >
                <Menu class="w-5 h-5" />
            </button>
            <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 hidden sm:block">
                Prompt Forge
            </h1>
        </div>

        <div class="flex items-center gap-2">
             <!-- Stats Pill -->
             <div class="hidden lg:flex items-center gap-4 text-xs font-mono mr-4 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full text-slate-500 border border-slate-200 dark:border-slate-700">
                <span>{totalTokens} tokens</span>
                <span class="w-px h-3 bg-slate-300 dark:bg-slate-600"></span>
                <span>~${totalCost.toFixed(5)}</span>
             </div>

             <button on:click={handleClear} class="p-2 text-slate-500 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px]" title={dict.toolbar.clear} aria-label={dict.toolbar.clear}>
                 <Trash2 class="w-5 h-5" />
             </button>
             <button on:click={() => showTemplateModal = true} class="p-2 text-slate-500 hover:text-indigo-500 transition-colors min-h-[44px] min-w-[44px]" title="Templates" aria-label="Templates">
                 <BookTemplate class="w-5 h-5" />
             </button>
             <button on:click={handleExport} class="p-2 text-slate-500 hover:text-indigo-500 transition-colors min-h-[44px] min-w-[44px]" title={dict.toolbar.export} aria-label={dict.toolbar.export}>
                 <Download class="w-5 h-5" />
             </button>
             <button on:click={() => showCodeExport = true} class="p-2 text-slate-500 hover:text-indigo-500 transition-colors min-h-[44px] min-w-[44px]" title="Export Code (Ctrl+E)" aria-label="Export Code">
                 <Code class="w-5 h-5" />
             </button>
             <button on:click={handleSave} class="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium text-sm transition-colors shadow-sm min-h-[44px] min-w-[44px]" aria-label={dict.toolbar.save} title="Save (Ctrl+S)">
                 <Save class="w-4 h-4" />
                 <span class="hidden sm:inline">{dict.toolbar.save}</span>
             </button>
        </div>
     </header>

     <!-- Workspace -->
     <main class="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[800px]">

            <!-- Column 1: Editor (5/12) -->
            <div class="lg:col-span-5 flex flex-col h-full min-h-[400px]">
                <PromptEditor bind:systemPrompt bind:userPrompt {dict} />
            </div>

            <!-- Column 2: Variables (3/12) -->
            <div class="lg:col-span-3 flex flex-col h-full min-h-[200px]">
                 <VariableForm {variables} bind:values bind:scenarios bind:activeScenarioId {dict} />
            </div>

            <!-- Column 3: Preview (4/12) -->
            <div class="lg:col-span-4 flex flex-col h-full min-h-[400px]">
                 <PromptPreview {compiledSystem} {compiledUser} {dict} />
            </div>
        </div>

        <!-- Documentation & SEO Content -->
        <div class="mt-20 w-full pb-20 px-4">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                <GuideSection
                    title={dict.guide.title}
                    intro={dict.guide.intro}
                    featuresTitle={dict.guide.featuresTitle}
                    f1={dict.guide.f1}
                    f2={dict.guide.f2}
                    f3={dict.guide.f3}
                    tipsTitle={dict.guide.tipsTitle}
                    tip1={dict.guide.tip1}
                    tip2={dict.guide.tip2}
                    tip3={dict.guide.tip3}
                />
            </div>

            <div class="max-w-4xl mx-auto mt-12">
                <AdPlaceholder />
  <FAQSection
                    title={dict.faqTitle}
                    items={[
                        { q: dict?.q1, a: dict?.a1 },
                        { q: dict?.q2, a: dict?.a2 },
                        { q: dict?.q3, a: dict?.a3 }
                    ]}
                />
            </div>
        </div>
       <div class="mt-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="prompt-forge" currentCategory="ai" />
  </div>
</main>
  </div>

  <!-- Toast -->
  {#if notification}
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-sm z-[60] flex items-center gap-2 animate-bounce-in">
       <span class="text-green-400">✓</span> {notification}
    </div>
  {/if}

  <!-- Code Export Modal -->
  {#if showCodeExport}
     <CodeExport
        data={generateExport(systemPrompt, userPrompt, values)}
        testSuite={generateTestSuite(systemPrompt, userPrompt, scenarios)}
        onClose={() => showCodeExport = false}
     />
  {/if}

  <!-- Template Modal -->
  {#if showTemplateModal}
     <TemplateModal
        onSelect={handleTemplateSelect}
        onClose={() => showTemplateModal = false}
     />
  {/if}
</div>

<style>
    @keyframes bounce-in {
        0% { transform: translate(-50%, 20px); opacity: 0; }
        50% { transform: translate(-50%, -5px); opacity: 1; }
        100% { transform: translate(-50%, 0); }
    }
    .animate-bounce-in {
        animation: bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
</style>
