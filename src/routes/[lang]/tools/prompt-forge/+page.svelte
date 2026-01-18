<script lang="ts">
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { onMount } from 'svelte';
  import { db, type PromptForgeHistory } from '$lib/db';
  import { extractVariables, compilePrompt, generateExport } from '$lib/utils/prompt-forge/parser';
  import { estimateTokens, estimateCost } from '$lib/utils/prompt-forge/tokenizer';

  import PromptEditor from '$lib/components/prompt-forge/PromptEditor.svelte';
  import VariableForm from '$lib/components/prompt-forge/VariableForm.svelte';
  import PromptPreview from '$lib/components/prompt-forge/PromptPreview.svelte';
  import HistorySidebar from '$lib/components/prompt-forge/HistorySidebar.svelte';
  import { Menu, X, Save, Copy, Trash2, Download } from 'lucide-svelte';
  import { browser } from '$app/environment';

  // Locale
  $: lang = $page.params.lang || 'en';
  $: dictionary = getDictionary(lang);
  $: dict = dictionary.tools.promptForge;

  // State
  let systemPrompt = "";
  let userPrompt = "";
  let values: Record<string, string> = {};

  let showSidebar = false;
  let notification: string | null = null;

  // Derived
  $: variables = extractVariables((systemPrompt || '') + '\n' + (userPrompt || ''));
  $: compiledSystem = compilePrompt(systemPrompt, values);
  $: compiledUser = compilePrompt(userPrompt, values);

  // Stats
  $: totalTokens = estimateTokens(compiledSystem) + estimateTokens(compiledUser);
  $: totalCost = estimateCost(totalTokens, 'gpt-4');

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

    // Check if we are updating an existing one?
    // For simplicity, always create new or prompt?
    // Let's simple add for now, "Save As".
    // Or ask for name.
    const name = prompt("Enter a name for this prompt:", title);
    if (!name) return;

    try {
        await db.promptForgeHistory.add({
            title: name,
            template: userPrompt, // Main template
            // We need to store system prompt too.
            // The DB schema has 'template', maybe we store JSON or pack it?
            // Or just append?
            // Let's Pack it into 'template' field as JSON string if we want, or just stick to userPrompt as main.
            // Actually, for "Professional Grade", we should handle both.
            // I'll store it as a JSON string in 'template' if it detects object, or legacy string.
            // Wait, I can't easily change schema now without migration.
            // But 'template' is a string. I can stringify an object: { system, user }.
            // The `variables` field in DB is Record<string, string>.
            variables: values,
            createdAt: new Date(),
            starred: 0
            // I'll cheat a bit and store JSON in `template` field,
            // but for backward compatibility with my own thought process, I'll prefix it.
            // Actually, let's just use the `template` field for User Prompt and maybe append System Prompt with a separator?
            // Or better: `JSON.stringify({ s: systemPrompt, u: userPrompt })`.
        } as any);
        // Forced cast because I defined template as string.
        // To be cleaner, I will store JSON string.

        showNotification(dict.toolbar.saved);
    } catch (e) {
        console.error(e);
    }
  }

  // Actually, I should just update the save logic to store JSON in the template field
  // and handle parsing on load.

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
          // Plain text
          userPrompt = item.template;
          systemPrompt = "";
      }

      values = item.variables || {};
      showSidebar = false;
  }

  function handleClear() {
      if(confirm('Clear all fields?')) {
          systemPrompt = "";
          userPrompt = "";
          values = {};
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

  // Custom save handling to encode proper format
  async function saveToDb() {
      if (!userPrompt.trim() && !systemPrompt.trim()) return;
      const name = prompt("Enter a name for this prompt:", "My Prompt");
      if (!name) return;

      const payload = JSON.stringify({ s: systemPrompt, u: userPrompt });

      await db.promptForgeHistory.add({
          title: name,
          template: payload,
          variables: values,
          createdAt: new Date(),
          starred: 0
      });
      showNotification(dict.toolbar.saved);
  }

</script>

<svelte:head>
  <title>{dict.title}</title>
  <meta name="description" content={dict.description} />
  <!-- JSON-LD -->
  {@html `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Prompt Forge",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  </script>`}
</svelte:head>

<div class="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">

  <!-- Sidebar -->
  <div class="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 md:relative md:translate-x-0 md:shadow-none border-r border-slate-200 dark:border-slate-700 {showSidebar ? 'translate-x-0' : '-translate-x-full'}">
      <div class="absolute top-4 right-4 md:hidden">
        <button on:click={() => showSidebar = false} class="p-2 text-slate-500">
            <X class="w-6 h-6" />
        </button>
      </div>
      <HistorySidebar {dict} onLoad={handleLoad} />
  </div>

  <!-- Backdrop -->
  {#if showSidebar}
    <button
        class="fixed inset-0 bg-black/50 z-40 md:hidden cursor-default w-full h-full border-none"
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
                class="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                on:click={() => showSidebar = true}
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

             <button on:click={handleClear} class="p-2 text-slate-500 hover:text-red-500 transition-colors" title={dict.toolbar.clear}>
                 <Trash2 class="w-5 h-5" />
             </button>
             <button on:click={handleExport} class="p-2 text-slate-500 hover:text-indigo-500 transition-colors" title={dict.toolbar.export}>
                 <Download class="w-5 h-5" />
             </button>
             <button on:click={saveToDb} class="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium text-sm transition-colors shadow-sm">
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
                 <VariableForm {variables} bind:values {dict} />
            </div>

            <!-- Column 3: Preview (4/12) -->
            <div class="lg:col-span-4 flex flex-col h-full min-h-[400px]">
                 <PromptPreview {compiledSystem} {compiledUser} {dict} />
            </div>
        </div>

        <!-- Documentation & SEO Content -->
        <div class="mt-20 max-w-4xl mx-auto pb-20">
            <article class="prose dark:prose-invert max-w-none">
                <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-6">
                    {dict.guide.title}
                </h2>
                <p class="text-lg text-slate-600 dark:text-slate-400 mb-8">
                    {dict.guide.intro}
                </p>

                <div class="grid md:grid-cols-2 gap-8 mb-12">
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 class="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{dict.guide.featuresTitle}</h3>
                        <ul class="space-y-3 text-slate-600 dark:text-slate-400">
                            <li class="flex items-start gap-2"><span class="text-indigo-500">✓</span> {@html dict.guide.f1}</li>
                            <li class="flex items-start gap-2"><span class="text-indigo-500">✓</span> {@html dict.guide.f2}</li>
                            <li class="flex items-start gap-2"><span class="text-indigo-500">✓</span> {@html dict.guide.f3}</li>
                        </ul>
                    </div>
                    <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 class="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{dict.guide.tipsTitle}</h3>
                        <ul class="space-y-3 text-slate-600 dark:text-slate-400">
                            <li class="flex items-start gap-2"><span class="text-amber-500">💡</span> {@html dict.guide.tip1}</li>
                            <li class="flex items-start gap-2"><span class="text-amber-500">💡</span> {@html dict.guide.tip2}</li>
                            <li class="flex items-start gap-2"><span class="text-amber-500">💡</span> {@html dict.guide.tip3}</li>
                        </ul>
                    </div>
                </div>

                <div class="border-t border-slate-200 dark:border-slate-700 pt-12">
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-8">{dict.faqTitle}</h2>
                    <div class="grid gap-8 md:grid-cols-2">
                        <div>
                            <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-2">{dict.q1}</h3>
                            <p class="text-slate-600 dark:text-slate-400">{dict.a1}</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-2">{dict.q2}</h3>
                            <p class="text-slate-600 dark:text-slate-400">{dict.a2}</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg text-slate-900 dark:text-white mb-2">{dict.q3}</h3>
                            <p class="text-slate-600 dark:text-slate-400">{dict.a3}</p>
                        </div>
                    </div>
                </div>
            </article>
        </div>
     </main>
  </div>

  <!-- Toast -->
  {#if notification}
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-sm z-[60] flex items-center gap-2 animate-bounce-in">
       <span class="text-green-400">✓</span> {notification}
    </div>
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
