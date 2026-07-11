<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { db } from '$lib/db';
  import type { LoadedFont, VariableAxis } from '$lib/utils/type-forge/types';
  import { Type, History, Info, ChevronLeft } from '@lucide/svelte';

  import FontUploader from '$lib/components/type-forge/FontUploader.svelte';
  import PreviewCanvas from '$lib/components/type-forge/PreviewCanvas.svelte';
  import VariableControls from '$lib/components/type-forge/VariableControls.svelte';
  import GlyphGrid from '$lib/components/type-forge/GlyphGrid.svelte';
  import CssExport from '$lib/components/type-forge/CssExport.svelte';
  import HistoryPanel from '$lib/components/type-forge/HistoryPanel.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = (getDictionary(lang) as any).tools.typeForge as any;
  $: common = getDictionary(lang).common;

  let currentFont: LoadedFont | null = null;
  let showHistory = false;

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": (common as any).home || "Home",
        "item": `https://selfgrowingmicrotool.com/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": dict.title,
        "item": `https://selfgrowingmicrotool.com/${lang}/tools/type-forge`
      }
    ]
  };

  async function handleLoad(event: CustomEvent<LoadedFont>) {
      currentFont = event.detail;
      // Save to history
      await db.typeForgeHistory.add({
          fontName: currentFont.meta.family,
          fileName: currentFont.fileName,
          config: JSON.stringify(currentFont.axes.map(a => ({ tag: a.tag, val: a.current }))),
          createdAt: new Date(),
          starred: 0
      });
  }

  function handleRestore(event: CustomEvent<any>) {
      // Restoration logic is tricky because we don't save the blob in history (too big).
      // We only save metadata. So we can't truly "restore" the font view without the file.
      // Ideally, we would use File System Access API or IndexedDB to store blobs but storing large fonts in IndexedDB might hit quota.
      // For now, let's just alert the user or maybe we assume they just want to see the record.
      // Actually, FontUploader handles new files.
      // Let's just show a message.
      alert("Note: History currently only tracks metadata. To restore a session, please re-upload the font file.");
  }
</script>
<Head
  title={dict.title}
  description={dict.description}
  keywords="font inspector, variable fonts, glyph viewer, web font tester, woff2 viewer, opentype.js, css font generator"
/>


<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/type-forge", "isAccessibleForFree": true, "name": dict.title, "description": dict.description, "applicationCategory": "DeveloperApplication", "operatingSystem": "Any", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }, "featureList": [ "Variable Font Axis Control", "Glyph Inspection", "CSS @font-face Generator", "Local Processing" ] })}</scr` + `ipt>`}
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</scr` + `ipt>`}
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20">
  <!-- Header -->
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -ml-2 rounded-lg">
          <ChevronLeft size={20} />
        </a>
        <div class="flex items-center space-x-2">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
             <Type size={20} />
          </div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {dict.title}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2">
          <button
              on:click={() => showHistory = !showHistory}
              class="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
              title={dict.history.title}
          >
              <History size={20} />
          </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <!-- Main Workspace -->
          <div class="lg:col-span-8 space-y-8">
              {#if !currentFont}
                  <FontUploader {dict} on:load={handleLoad} />
              {:else}
                  <div class="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div>
                          <h2 class="text-xl font-bold text-slate-800 dark:text-white">{currentFont.meta.family} <span class="text-sm font-normal text-slate-500 dark:text-slate-400">({currentFont.meta.style})</span></h2>
                          <div class="text-xs text-slate-400 mt-1 flex gap-4">
                              <span>{currentFont.fileName}</span>
                              <span>{(currentFont.fileSize / 1024).toFixed(1)} KB</span>
                              <span>{currentFont.font.numGlyphs} Glyphs</span>
                          </div>
                      </div>
                      <button on:click={() => currentFont = null} class="text-sm text-indigo-600 hover:underline min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg">
                          Upload New
                      </button>
                  </div>

                  <PreviewCanvas font={currentFont} axes={currentFont.axes} {dict} />

                  <GlyphGrid font={currentFont} {dict} />
              {/if}

              <div class="mt-12">
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

                  <div class="mt-8">
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
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-4 space-y-6">
              {#if currentFont}
                  <VariableControls bind:axes={currentFont.axes} {dict} />
                  <CssExport font={currentFont} axes={currentFont.axes} {dict} />

                  <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                      <h4 class="font-bold text-slate-700 dark:text-slate-300">Metadata</h4>
                      <div class="grid grid-cols-[80px_1fr] gap-1">
                          <span>Version:</span> <span class="truncate">{currentFont.meta.version}</span>
                          <span>License:</span> <span class="truncate" title={currentFont.meta.license}>{currentFont.meta.license || '-'}</span>
                          <span>Designer:</span> <span class="truncate">{currentFont.meta.designer || '-'}</span>
                          <span>Copyright:</span> <span class="truncate" title={currentFont.meta.copyright}>{currentFont.meta.copyright || '-'}</span>
                      </div>
                  </div>
              {/if}

              {#if showHistory || !currentFont}
                  <HistoryPanel {dict} on:restore={handleRestore} />
              {/if}
          </div>
      </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="type-forge" currentCategory="dev" />
  </div>
</main>
</div>
