<script lang="ts">
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import Head from '$lib/components/Head.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { LayoutDashboard, Save, RotateCcw, Clock } from '@lucide/svelte';
  import { fade } from 'svelte/transition';

  import ControlsSidebar from '$lib/components/flex-forge/ControlsSidebar.svelte';
  import Workspace from '$lib/components/flex-forge/Workspace.svelte';
  import CodeOutput from '$lib/components/flex-forge/CodeOutput.svelte';
  import HistorySidebar from '$lib/components/flex-forge/HistorySidebar.svelte';

  import type { FlexContainerProps, FlexItemProps, FlexForgeHistoryItem } from '$lib/db/flex-forge';
  import { db } from '$lib/db';

  $: lang = $page.params.lang || 'en';
  $: dict = (getDictionary(lang) as any)?.tools?.flexForge || getDictionary('en').tools.flexForge;

  let activeTab: 'editor' | 'history' = 'editor';

  let containerProps: FlexContainerProps = {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    alignContent: 'stretch',
    gap: '16px'
  };

  let items: FlexItemProps[] = [
    { id: crypto.randomUUID(), order: '0', flexGrow: '0', flexShrink: '1', flexBasis: 'auto', alignSelf: 'auto', width: 'auto', height: '100px', text: '1' },
    { id: crypto.randomUUID(), order: '0', flexGrow: '0', flexShrink: '1', flexBasis: 'auto', alignSelf: 'auto', width: 'auto', height: '100px', text: '2' },
    { id: crypto.randomUUID(), order: '0', flexGrow: '0', flexShrink: '1', flexBasis: 'auto', alignSelf: 'auto', width: 'auto', height: '100px', text: '3' }
  ];

  let selectedItemId: string | null = null;
  let historyKey = 0;
  let isSaving = false;

  function addItem() {
    items = [...items, {
      id: crypto.randomUUID(),
      order: '0', flexGrow: '0', flexShrink: '1', flexBasis: 'auto', alignSelf: 'auto', width: 'auto', height: '100px',
      text: String(items.length + 1)
    }];
  }

  function duplicateItem(id: string) {
    const itemToDuplicate = items.find(i => i.id === id);
    if (itemToDuplicate) {
      items = [...items, {
        ...itemToDuplicate,
        id: crypto.randomUUID(),
        text: String(items.length + 1)
      }];
    }
  }

  function removeItem(id: string) {
    items = items.filter(i => i.id !== id);
    // Re-number text
    items = items.map((i, index) => ({ ...i, text: String(index + 1) }));
  }

  function resetLayout() {
    containerProps = { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch', alignContent: 'stretch', gap: '16px' };
    items = [
      { id: crypto.randomUUID(), order: '0', flexGrow: '0', flexShrink: '1', flexBasis: 'auto', alignSelf: 'auto', width: 'auto', height: '100px', text: '1' },
      { id: crypto.randomUUID(), order: '0', flexGrow: '0', flexShrink: '1', flexBasis: 'auto', alignSelf: 'auto', width: 'auto', height: '100px', text: '2' },
      { id: crypto.randomUUID(), order: '0', flexGrow: '0', flexShrink: '1', flexBasis: 'auto', alignSelf: 'auto', width: 'auto', height: '100px', text: '3' }
    ];
    selectedItemId = null;
  }

  async function saveLayout() {
    isSaving = true;
    try {
      await db.flexForgeHistory.add({
        containerProps: { ...containerProps },
        items: JSON.parse(JSON.stringify(items)),
        createdAt: Date.now(),
        starred: false
      });
      historyKey++;
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => isSaving = false, 500);
    }
  }

  function loadHistoryItem(item: FlexForgeHistoryItem) {
    containerProps = { ...item.containerProps };
    items = JSON.parse(JSON.stringify(item.items));
    selectedItemId = null;
    activeTab = 'editor';
  }

  $: schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${$page.url.origin}/${lang}/tools/flex-forge`,
    "isAccessibleForFree": true,
    "name": dict.title,
    "applicationCategory": "DeveloperApplication",
    "applicationSubCategory": "Developer Tool",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. HTML5.",
    "description": dict.description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  $: faqItems = [
    { q: dict.faqQ1, a: dict.faqA1 },
    { q: dict.faqQ2, a: dict.faqA2 },
    { q: dict.faqQ3, a: dict.faqA3 }
  ];
</script>

<Head
  title={dict.title}
  description={dict.description}
  url={`${$page.url.origin}/${lang}/tools/flex-forge`}
/>

<svelte:head>
  <link rel="canonical" href={`${$page.url.origin}/${lang}/tools/flex-forge`} />
  <link rel="alternate" hreflang="en" href={`${$page.url.origin}/en/tools/flex-forge`} />
  <link rel="alternate" hreflang="ko" href={`${$page.url.origin}/ko/tools/flex-forge`} />
  <link rel="alternate" hreflang="x-default" href={`${$page.url.origin}/en/tools/flex-forge`} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <!-- Header -->
  <div class="text-center space-y-4">
    <div class="inline-flex items-center justify-center p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-3xl mb-4 shadow-sm">
      <LayoutDashboard size={48} class="text-indigo-600 dark:text-indigo-400" />
    </div>
    <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      {dict.title}
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
      {dict.description}
    </p>
  </div>

  <!-- Main Toolbar -->
  <div class="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
    <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
       <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] {activeTab === 'editor' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
        on:click={() => activeTab = 'editor'}
      >
        <LayoutDashboard size={18} />
        <span class="hidden sm:inline">{dict.tabs.editor}</span>
      </button>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] {activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
        on:click={() => activeTab = 'history'}
      >
        <Clock size={18} />
        <span class="hidden sm:inline">{dict.tabs.history}</span>
      </button>
    </div>

    <div class="flex items-center gap-2">
      <button
        on:click={resetLayout}
        class="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium text-sm min-h-[44px]"
      >
        <RotateCcw size={18} />
        <span class="hidden sm:inline">{dict.reset}</span>
      </button>
      <button
        on:click={saveLayout}
        disabled={isSaving}
        class="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg font-medium text-sm min-h-[44px] disabled:opacity-50"
      >
        <Save size={18} class={isSaving ? 'animate-bounce' : ''} />
        {dict.save}
      </button>
    </div>
  </div>

  <!-- App Body -->
  <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row h-[800px] max-h-[80vh]">
    {#if activeTab === 'editor'}
      <!-- Sidebar Controls -->
      <div class="w-full md:max-w-[20rem] border-r border-slate-200 dark:border-slate-800 shrink-0 h-full">
        <ControlsSidebar
          {dict}
          bind:containerProps
          bind:items
          bind:selectedItemId
          {addItem}
          {duplicateItem}
          {removeItem}
        />
      </div>

      <!-- Workspace & Code -->
      <div class="flex-1 flex flex-col h-full overflow-hidden relative" in:fade>
        <div class="flex-1 overflow-hidden p-4">
          <Workspace
            bind:containerProps
            bind:items
            bind:selectedItemId
          />
        </div>
        <div class="h-64 shrink-0 border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50">
          <CodeOutput {dict} {containerProps} {items} />
        </div>
      </div>
    {:else}
      <!-- History Tab -->
      <div class="w-full h-full" in:fade>
        {#key historyKey}
          <HistorySidebar {dict} onSelect={loadHistoryItem} {lang} />
        {/key}
      </div>
    {/if}
  </div>

  <!-- SEO Content -->
  <GuideSection
    title={dict.guideTitle}
    intro={dict.guideIntro}
    featuresTitle={dict.guideFeaturesTitle}
    f1={dict.guideF1}
    f2={dict.guideF2}
    f3={dict.guideF3}
    tipsTitle={dict.guideTipsTitle}
    tip1={dict.guideTip1}
    tip2={dict.guideTip2}
    tip3={dict.guideTip3}
  />

  <AdPlaceholder />
  <FAQSection title={dict.faqTitle} items={faqItems} />
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
  <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="flex-forge" currentCategory="dev" />
</div>
