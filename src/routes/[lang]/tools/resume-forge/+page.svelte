<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { resumeStore } from '$lib/utils/resume-forge/store';
  import ResumeEditor from '$lib/components/resume-forge/ResumeEditor.svelte';
  import ResumePreview from '$lib/components/resume-forge/ResumePreview.svelte';
  import HistoryPanel from '$lib/components/resume-forge/HistoryPanel.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { db } from '$lib/db';
  import { onMount, onDestroy } from 'svelte';
  import { Menu, X, FileText, Split, Smartphone } from '@lucide/svelte';
  import { browser } from '$app/environment';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: toolDict = dict.tools.resumeForge;

  let showHistory = false;
  let showPreviewOnMobile = false; // Toggle for mobile view
  let debounceTimer: any;

  // Auto-save to localStorage
  const unsubscribe = resumeStore.subscribe(val => {
      if (!browser) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
          localStorage.setItem('resume-forge-autosave', JSON.stringify(val));
      }, 1000);
  });

  onMount(() => {
      const saved = localStorage.getItem('resume-forge-autosave');
      if (saved) {
          try {
              resumeStore.load(JSON.parse(saved));
          } catch (e) { console.error('Failed to load autosave', e); }
      }
  });

  onDestroy(() => {
      unsubscribe();
  });

  async function handleSave() {
      try {
          await db.resumeForgeHistory.add({
              name: $resumeStore.basics.name || 'Untitled Resume',
              data: $resumeStore,
              createdAt: new Date(),
              updatedAt: new Date(),
              starred: 0
          });
          // Simple toast could be better but sticking to dict
          alert(toolDict.actions.saved);
      } catch (e) {
          console.error('Failed to save', e);
      }
  }

  function handleReset() {
      if (confirm(toolDict.actions.reset + '?')) {
          resumeStore.reset();
      }
  }

  function handleExportJson() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify($resumeStore, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", ($resumeStore.basics.name || "resume") + ".json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  }

  function handleImportJson() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (re) => {
              try {
                  const json = JSON.parse(re.target?.result as string);
                  resumeStore.load(json);
              } catch (err) {
                  alert('Invalid JSON file');
              }
          };
          reader.readAsText(file);
      };
      input.click();
  }

  // SEO Schema
  $: faqItems = [
    { q: toolDict?.q1, a: toolDict?.a1 },
    { q: toolDict?.q2, a: toolDict?.a2 },
    { q: toolDict?.q3, a: toolDict?.a3 }
  ];

  $: jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/resume-forge",
        "isAccessibleForFree": true,
        "name": toolDict.title,
        "description": toolDict.description,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
           "JSON Resume Support",
           "PDF Export",
           "Real-time Preview",
           "ATS Friendly Templates",
           "Offline Privacy"
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": { "@type": "Answer", "text": item.a }
        }))
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": dict.home.title,
            "item": `https://selfgrowingmicrotool.com/${lang}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": toolDict.title,
            "item": $page.url.href
          }
        ]
      }
    ]
  });
</script>
<Head
  title={toolDict.title}
  description={toolDict.description}
  keywords="resume builder, cv maker, json resume, free resume template, ats friendly resume, pdf resume"
/>


<svelte:head>
  {@html `<script type="application/ld+json">${jsonLd}</scr` + `ipt>`}
</svelte:head>

<div class="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
    <!-- Header -->
    <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 flex-shrink-0 z-20 print:hidden">
        <div class="flex items-center gap-3">
             <button class="md:hidden p-2 text-slate-500 min-h-[44px] min-w-[44px]" on:click={() => showHistory = !showHistory}>
                 <Menu size={20} />
             </button>
             <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                 <FileText size={20} />
             </div>
             <h1 class="font-bold text-lg hidden sm:block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{toolDict.title}</h1>
        </div>

        <div class="flex items-center gap-2 md:hidden">
             <!-- Mobile View Toggle -->
             <button
                class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 min-h-[44px] min-w-[44px]"
                on:click={() => showPreviewOnMobile = !showPreviewOnMobile}
             >
                {#if showPreviewOnMobile}
                    <Split size={20} /> <!-- Show Editor Icon -->
                {:else}
                    <Smartphone size={20} /> <!-- Show Preview Icon logic inverted for icon meaning -->
                {/if}
             </button>
        </div>
    </header>

    <div class="flex-1 flex overflow-hidden relative">
        <!-- History Sidebar (Responsive) -->
        <div class="fixed inset-y-0 left-0 z-30 transform {showHistory ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 shadow-xl md:shadow-none bg-white dark:bg-slate-900 h-full print:hidden">
            <div class="absolute top-2 right-2 md:hidden">
                <button class="p-2 text-slate-500 min-h-[44px] min-w-[44px]" on:click={() => showHistory = false}><X size={20}/></button>
            </div>
            <HistoryPanel dict={toolDict} />
        </div>

        <!-- Backdrop -->
        {#if showHistory}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="fixed inset-0 bg-black/50 z-20 md:hidden" on:click={() => showHistory = false}></div>
        {/if}

        <!-- Main Workspace -->
        <main class="flex-1 flex flex-col md:flex-row min-w-0 bg-slate-100 dark:bg-black/20">
            <!-- Editor Pane -->
            <div class="flex-1 flex flex-col min-w-0 border-r border-slate-200 dark:border-slate-800 h-full {showPreviewOnMobile ? 'hidden md:flex' : 'flex'} print:hidden">
                <div class="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm text-slate-500 uppercase tracking-wider flex justify-between items-center">
                    {toolDict.editor.title}
                    <div class="flex gap-2">
                        <button on:click={handleImportJson} class="text-xs text-indigo-600 hover:underline min-h-[44px] min-w-[44px]">{toolDict.actions.importJson}</button>
                    </div>
                </div>
                <div class="flex-1 overflow-hidden">
                    <ResumeEditor dict={toolDict} />
                </div>
            </div>

            <!-- Preview Pane -->
            <div class="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-black h-full {showPreviewOnMobile ? 'flex' : 'hidden md:flex'}">
                 <ResumePreview
                    dict={toolDict}
                    onSave={handleSave}
                    onReset={handleReset}
                    onExportJson={handleExportJson}
                 />
            </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="resume-forge" currentCategory="dev" />
  </div>
</main>
    </div>
</div>

<!-- Documentation (Below fold, printable hidden) -->
<div class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 print:hidden">
    <div class="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <GuideSection {...toolDict.guide} />
        <AdPlaceholder />
  <FAQSection title={toolDict.faqTitle} items={faqItems} />
    </div>
</div>
