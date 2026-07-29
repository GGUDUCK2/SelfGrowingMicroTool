<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { db, type MockForgeSchema } from '$lib/db';
  import { MockEngine } from '$lib/utils/mock-forge/engine';
  import type { SchemaField, GeneratorOptions } from '$lib/utils/mock-forge/types';

  import SchemaBuilder from '$lib/components/mock-forge/SchemaBuilder.svelte';
  import PreviewTable from '$lib/components/mock-forge/PreviewTable.svelte';
  import ExportPanel from '$lib/components/mock-forge/ExportPanel.svelte';
  import HistoryPanel from '$lib/components/mock-forge/HistoryPanel.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import { Save, RefreshCw, Check } from '@lucide/svelte';

  // Dictionary
  $: lang = $page.params.lang || 'en';
  $: dictionary = getDictionary(lang);
  $: t = (dictionary as any)?.tools?.mockForge;
  $: common = dictionary.common;

  $: faqItems = [
    { q: t.q1, a: t.a1 },
    { q: t.q2, a: t.a2 },
    { q: t.q3, a: t.a3 }
  ];

  // State
  let schema: SchemaField[] = [
    { id: '1', name: 'id', type: 'id', options: { format: 'uuid' } },
    { id: '2', name: 'fullName', type: 'name', options: {} },
    { id: '3', name: 'email', type: 'email', options: {} }
  ];

  let options: GeneratorOptions = {
    locale: lang === 'ko' ? 'ko' : 'en',
    rows: 100, // For download
    format: 'json',
    tableName: 'users'
  };

  let previewData: any[] = [];
  let previewLoading = false;
  let showToast = false;
  let toastMsg = '';
  let saveName = '';
  let toastTimer: any;

  let engine: MockEngine;

  // Debounced generation for preview
  let timer: any;

  function generatePreview() {
    previewLoading = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      // Re-instantiate engine if locale changed
      engine = new MockEngine(options.locale);
      // Generate 20 rows for preview
      previewData = engine.generate(schema, 20);
      previewLoading = false;
    }, 500);
  }

  // Watch for changes
  $: {
    schema;
    options.locale;
    generatePreview();
  }

  onMount(() => {
    engine = new MockEngine(options.locale);
    generatePreview();
  });

  async function handleExport(format: GeneratorOptions['format']) {
    options.format = format;
    const data = engine.generate(schema, options.rows);
    let content = '';
    let mime = 'text/plain';
    let ext = 'txt';

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        mime = 'application/json';
        ext = 'json';
        break;
      case 'csv':
        content = engine.toCSV(data);
        mime = 'text/csv';
        ext = 'csv';
        break;
      case 'sql':
        content = engine.toSQL(data, options.tableName || 'mock_data');
        mime = 'application/sql';
        ext = 'sql';
        break;
      case 'xml':
        content = engine.toXML(data);
        mime = 'application/xml';
        ext = 'xml';
        break;
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock_data.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToastMsg('Download started!');
  }

  async function saveSchema() {
    const name = prompt('Schema Name:', saveName || 'My Schema');
    if (!name) return;
    saveName = name;

    try {
      await db.mockForgeSchemas.add({
        name,
        fields: JSON.parse(JSON.stringify(schema)),
        createdAt: new Date(),
        starred: 0
      });
      showToastMsg('Schema saved!');
    } catch (e) {
      console.error(e);
      showToastMsg('Failed to save.');
    }
  }

  function loadSchema(item: MockForgeSchema) {
    if (confirm('Load this schema? Current work will be replaced.')) {
      schema = item.fields;
      saveName = item.name;
      showToastMsg('Schema loaded.');
    }
  }

  function showToastMsg(msg: string) {
    clearTimeout(toastTimer);
    toastMsg = msg;
    showToast = true;
    toastTimer = setTimeout(() => showToast = false, 3000);
  }

  const baseUrl = 'https://micro-tools.vercel.app';
  $: canonical = `${baseUrl}/${lang}/tools/mock-forge`;

  $: schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/mock-forge",
        "isAccessibleForFree": true,
        "name": t.title,
        "description": t.description,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          t.guide.f1.replace(/\*\*/g, ''),
          t.guide.f2.replace(/\*\*/g, ''),
          t.guide.f3.replace(/\*\*/g, '')
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${baseUrl}/${lang}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": t.title,
            "item": canonical
          }
        ]
      }
    ]
  };


</script>
<Head
  title={t.title}
  description={t.description}
  keywords="mock data generator, fake data, json generator, csv generator, sql insert generator, test data, developer tools"
/>


<svelte:head>
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/mock-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/mock-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/mock-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/mock-forge"} />
  <link rel="alternate" hreflang="en" href="{baseUrl}/en/tools/mock-forge" />
  <link rel="alternate" hreflang="ko" href="{baseUrl}/ko/tools/mock-forge" />
  <link rel="alternate" hreflang="x-default" href="{baseUrl}/en/tools/mock-forge" />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(schemaOrg)}</scr` + `ipt>`}


</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black pb-20">

  <!-- Header -->
  <div class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a href="/{lang}" aria-label={common.back} class="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          {t.title}
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
          on:click={generatePreview}
          aria-label={t.generate}
        >
          <RefreshCw size={16} class={previewLoading ? 'animate-spin' : ''} />
          <span class="hidden sm:inline">{t.generate}</span>
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
          on:click={saveSchema}
          aria-label={t.actions.save}
        >
          <Save size={16} />
          <span class="hidden sm:inline">{t.actions.save}</span>
        </button>
      </div>
    </div>
  </div>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Left Column: Schema Builder -->
      <div class="lg:col-span-5 space-y-6">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-4">{t.schema}</h2>
          <SchemaBuilder bind:fields={schema} dictionary={t} />
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <ExportPanel bind:options={options} dictionary={t} onExport={handleExport} />
        </div>

        <div class="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <HistoryPanel dictionary={t} onLoad={loadSchema} />
        </div>
      </div>

      <!-- Right Column: Preview -->
      <div class="lg:col-span-7 h-full min-h-[500px]">
        <div class="h-auto lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
          <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            {t.preview}
            <span class="text-xs font-normal bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">Live</span>
          </h2>
          <PreviewTable data={previewData} loading={previewLoading} />
        </div>
      </div>

    </div>

    <!-- Guide & FAQ -->
    <div class="max-w-4xl mx-auto space-y-20">
      <GuideSection {...t.guide} />
      <AdPlaceholder />
      <FAQSection title={t.faqTitle} items={faqItems} />
    </div>

    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="mock-forge" currentCategory="dev" />
  </main>

  {#if showToast}
    <div transition:fade class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium text-sm">
      <Check size={18} />
      {toastMsg}
    </div>
  {/if}
</div>
