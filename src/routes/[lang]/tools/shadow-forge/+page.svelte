<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { shadowStore, generateShadowCSS } from '$lib/utils/shadow-forge/store';
  import { saveToHistory } from '$lib/db/workspace';

  import ShadowCanvas from '$lib/components/shadow-forge/ShadowCanvas.svelte';
  import LayerControl from '$lib/components/shadow-forge/LayerControl.svelte';
  import CodeExport from '$lib/components/shadow-forge/CodeExport.svelte';
  import HistoryPanel from '$lib/components/shadow-forge/HistoryPanel.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { History, LayoutTemplate } from '@lucide/svelte';
  import { fade, slide } from 'svelte/transition';

  $: lang = $page.params.lang || 'en';
  $: dict = (getDictionary(lang) || getDictionary('en')).tools.shadowForge;

  let showHistory = false;
  let showToast = false;
  let toastMessage = '';

  async function handleSave() {
      try {
          const css = generateShadowCSS($shadowStore);
          await saveToHistory('shadow-forge', $shadowStore, { css });
          toastMessage = dict.export.saved;
          showToast = true;
          setTimeout(() => showToast = false, 2000);
      } catch (e) {
          console.error("Failed to save history", e);
      }
  }

  $: jsonLd = dict ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/shadow-forge",
    "name": "Shadow Forge",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "isAccessibleForFree": true,
    "description": dict.description,
    "featureList": [
      "Multi-Layer Box Shadows",
      "Smooth Shadow Interpolation",
      "Neumorphism Generator",
      "Tailwind CSS Export"
    ]
  } : {};

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Tools", "item": `${$page.url.origin}/${lang}/tools` },
      { "@type": "ListItem", "position": 2, "name": "Shadow Forge", "item": `${$page.url.origin}/${lang}/tools/shadow-forge` }
    ]
  };


</script>

<Head
  title={dict.title}
  description={dict.description}
  keywords="css box shadow generator, smooth shadow generator, neumorphism generator, multiple box shadows, tailwind shadow generator"
/>

<svelte:head>
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/shadow-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/shadow-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/shadow-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/shadow-forge"} />
  {#if dict}
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(jsonLd)}</scr` + `ipt>`}
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</scr` + `ipt>`}


  {/if}
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white">
   <!-- Top Nav/Header -->
   <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-20 shrink-0 sticky top-0">
       <div class="flex items-center gap-3">
           <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
               <LayoutTemplate size={20} />
           </div>
           <h1 class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:block">
               {dict.title.split(':')[0]}
           </h1>
       </div>
       <div class="flex items-center gap-2">
            <button class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                on:click={() => showHistory = true}
            >
                <History size={18} />
                <span class="hidden sm:inline">{dict.history.title}</span>
            </button>
       </div>
   </header>

   <!-- Main Workspace -->
   <main class="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden relative">

       <!-- Left Side: Canvas & Export (Flex Column) -->
       <div class="flex-1 flex flex-col min-h-0 relative lg:border-r border-slate-200 dark:border-slate-800 z-10">
           <ShadowCanvas {dict} />
           <CodeExport {dict} on:save={handleSave} />
       </div>

       <!-- Right Side: Controls Sidebar -->
       <div class="w-full lg:w-96 bg-white dark:bg-slate-900 h-full flex flex-col shrink-0 overflow-hidden relative z-20 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)]">
           <LayerControl {dict} />
       </div>


  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="shadow-forge" currentCategory="dev" />
  </div>
</main>

   <!-- Documentation Section (Below Fold, requires scroll on main window) -->
   <section class="bg-white dark:bg-slate-900 py-16 lg:py-24 border-t border-slate-200 dark:border-slate-800 relative z-10">
       <div class="max-w-7xl mx-auto px-6 space-y-16">
           <!-- Guide -->
           <article class="prose dark:prose-invert max-w-none min-h-[44px] min-w-[44px]">
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
                                 <span>{@html dict.guide.f1}</span>
                             </li>
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <div class="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                 <span>{@html dict.guide.f2}</span>
                             </li>
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <div class="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                 <span>{@html dict.guide.f3}</span>
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
                                 <span>{@html dict.guide.tip1}</span>
                             </li>
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <div class="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                                 <span>{@html dict.guide.tip2}</span>
                             </li>
                             <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                 <div class="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                                 <span>{@html dict.guide.tip3}</span>
                             </li>
                        </ul>
                    </div>
               </div>
           </article>

           <!-- FAQ -->
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
       </div>
   </section>
</div>

<!-- History Drawer -->
{#if showHistory}
    <HistoryPanel {dict} on:close={() => showHistory = false} />
{/if}

<!-- Global Toast -->
{#if showToast}
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3" transition:slide={{ axis: 'y', duration: 300 }}>
        <div class="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <span class="font-medium text-sm">{toastMessage}</span>
    </div>
{/if}
