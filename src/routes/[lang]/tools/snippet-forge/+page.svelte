<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { snippetStore } from '$lib/utils/snippet-forge/store';
  import SnippetCanvas from '$lib/components/snippet-forge/SnippetCanvas.svelte';
  import Controls from '$lib/components/snippet-forge/Controls.svelte';
  import Toolbar from '$lib/components/snippet-forge/Toolbar.svelte';
  import HistoryDrawer from '$lib/components/snippet-forge/HistoryDrawer.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { db, type SnippetForgeHistory } from '$lib/db';
  import { marked } from 'marked';
  import { History, Menu, X, Code2 } from 'lucide-svelte';
  import { fade, slide } from 'svelte/transition';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang).tools.snippetForge;

  let showHistory = false;
  let showMobileControls = false;
  let showToast = false;
  let toastMessage = '';

  function handleSave() {
      db.snippetForgeHistory.add({
          code: $snippetStore.code,
          language: $snippetStore.language,
          theme: $snippetStore.theme,
          background: $snippetStore.background,
          padding: $snippetStore.padding,
          windowControls: $snippetStore.windowControls !== 'none',
          title: $snippetStore.windowTitle || 'Untitled',
          createdAt: new Date(),
          starred: 0
      }).then(() => {
          showToastMessage(dict.saved);
      });
  }

  function handleHistorySelect(e: CustomEvent<SnippetForgeHistory>) {
      const item = e.detail;
      snippetStore.update(s => ({
          ...s,
          code: item.code,
          language: item.language,
          theme: item.theme,
          background: item.background,
          padding: item.padding,
          windowControls: item.windowControls ? 'mac' : 'none',
          windowTitle: item.title || ''
      }));
      showHistory = false;
  }

  function showToastMessage(msg: string) {
      toastMessage = msg;
      showToast = true;
      setTimeout(() => showToast = false, 3000);
  }

  $: jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/snippet-forge",
        "isAccessibleForFree": true,
      "name": dict.title,
      "description": dict.description,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "featureList": [
        "Syntax Highlighting (PrismJS)",
        "Custom Themes (Dracula, Monokai)",
        "Background Gradients",
        "High-Res PNG Export",
        "macOS/Windows Window Styles",
        "History Management"
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
  keywords="code screenshots, snippet image, carbon alternative, code to image, syntax highlighting image, developer tools"
/>


<!-- Heads & Meta -->
<svelte:head>


  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}

  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd2) + '</scr' + 'ipt>'}

</svelte:head>

<!-- UI Layout -->
<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white">
   <!-- Tool Section -->
   <div class="h-[calc(100vh-64px)] min-h-[600px] flex flex-col border-b border-slate-200 dark:border-slate-800 relative z-10">
       <!-- Header / Toolbar -->
       <div class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-20 shrink-0">
           <div class="flex items-center gap-3">
               <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                   <Code2 size={20} />
               </div>
               <h1 class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:block">
                   {dict.title.split(':')[0]}
               </h1>
           </div>

           <div class="flex items-center gap-2">
                <Toolbar {dict} on:save={handleSave} />
                <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button
                    class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative min-h-[44px] min-w-[44px]"
                    on:click={() => showHistory = !showHistory}
                    title={dict.history}
                >
                    <History size={20} />
                </button>
                <button
                    class="lg:hidden p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    on:click={() => showMobileControls = !showMobileControls}
                >
                    <Menu size={20} />
                </button>
           </div>
       </div>

       <!-- Main Workspace -->
       <div class="flex-1 flex overflow-hidden relative">
           <!-- Controls Sidebar (Desktop) -->
           <div class="hidden lg:block w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full overflow-hidden z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
               <Controls {dict} />
           </div>

           <!-- Canvas Area -->
           <div class="flex-1 bg-slate-100 dark:bg-black/50 overflow-hidden relative">
               <SnippetCanvas />
           </div>

           <!-- Mobile Controls Drawer -->
           {#if showMobileControls}
                <div class="fixed inset-0 z-40 lg:hidden" transition:fade>
                     <!-- svelte-ignore a11y-click-events-have-key-events -->
                     <!-- svelte-ignore a11y-no-static-element-interactions -->
                     <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" on:click={() => showMobileControls = false}></div>
                     <div class="absolute inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 shadow-2xl flex flex-col" transition:slide={{axis: 'x'}}>
                         <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                             <h3 class="font-bold">Settings</h3>
                             <button on:click={() => showMobileControls = false} class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={20} /></button>
                         </div>
                         <Controls {dict} />
                     </div>
                </div>
           {/if}

           <!-- History Drawer -->
           {#if showHistory}
               <!-- svelte-ignore a11y-click-events-have-key-events -->
               <!-- svelte-ignore a11y-no-static-element-interactions -->
               <div class="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm" on:click={() => showHistory = false} transition:fade></div>
               <HistoryDrawer {dict} on:select={handleHistorySelect} on:close={() => showHistory = false} />
           {/if}
       </div>
   </div>

   <!-- SEO Content (Below Fold) -->
   <section class="bg-white dark:bg-slate-900 py-16 lg:py-24">
       <div class="max-w-4xl mx-auto px-6 space-y-16">
           <!-- Guide -->
           <article class="prose dark:prose-invert max-w-none">
               <h2 class="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                   {dict.guide.title}
               </h2>
               <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
                   {dict.guide.intro}
               </p>

               <div class="grid md:grid-cols-2 gap-8 not-prose">
                    <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <h3 class="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                             <span class="text-indigo-500">✨</span> {dict.guide.featuresTitle}
                        </h3>
                        <ul class="space-y-3">
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <div class="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                 <span>{@html marked.parseInline(dict.guide.f1)}</span>
                             </li>
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <div class="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                 <span>{@html marked.parseInline(dict.guide.f2)}</span>
                             </li>
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <div class="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                 <span>{@html marked.parseInline(dict.guide.f3)}</span>
                             </li>
                        </ul>
                    </div>

                    <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <h3 class="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                             <span class="text-amber-500">💡</span> {dict.guide.tipsTitle}
                        </h3>
                         <ul class="space-y-3">
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <div class="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                                 <span>{@html marked.parseInline(dict.guide.tip1)}</span>
                             </li>
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <div class="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                                 <span>{@html marked.parseInline(dict.guide.tip2)}</span>
                             </li>
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <div class="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                                 <span>{@html marked.parseInline(dict.guide.tip3)}</span>
                             </li>
                        </ul>
                    </div>
               </div>
           </article>

           <!-- FAQ -->
           <GuideSection {...dict?.guide} />
  <AdPlaceholder />
  <FAQSection
               title={dict.faqTitle}
               items={[
                   { question: dict?.q1, answer: dict?.a1 },
                   { question: dict?.q2, answer: dict?.a2 },
                   { question: dict?.q3, answer: dict?.a3 }
               ]}
           />
       </div>
   </section>
</div>

<!-- Toast -->
{#if showToast}
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3" transition:slide={{ axis: 'y', duration: 300 }}>
        <div class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-black">
            <Check size={12} strokeWidth={4} />
        </div>
        <span class="font-medium text-sm">{toastMessage}</span>
    </div>
{/if}

<script context="module">
    import { Check } from 'lucide-svelte';
</script>

  <div class="mt-12 mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <RelatedTools {lang} currentSlug="snippet-forge" currentCategory="dev" />
  </div>
