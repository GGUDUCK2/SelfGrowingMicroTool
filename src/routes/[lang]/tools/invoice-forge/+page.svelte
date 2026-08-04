<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import InvoiceEditor from '$lib/components/invoice-forge/InvoiceEditor.svelte';
  import InvoicePreview from '$lib/components/invoice-forge/InvoicePreview.svelte';
  import ClientManager from '$lib/components/invoice-forge/ClientManager.svelte';
  import HistoryPanel from '$lib/components/invoice-forge/HistoryPanel.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import type { Invoice } from '$lib/utils/invoice-forge/types';
  import { createEmptyInvoice } from '$lib/utils/invoice-forge/defaults';
  import { calculateTotal } from '$lib/utils/invoice-forge/calculations';
  import { db } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { Printer, Download, Save, RefreshCw, Menu, ArrowLeft, Image as ImageIcon, Users, FileText, Edit3 } from '@lucide/svelte';
  import { slide, fade } from 'svelte/transition';
  import { toPng } from 'html-to-image';

  $: lang = $page.params.lang || 'en';
  $: dictionary = getDictionary(lang);
  $: invoiceDict = (dictionary as any)?.tools?.invoiceForge;

  let invoice: Invoice = createEmptyInvoice();
  let showSidebar = true;
  let activeTab: 'editor' | 'clients' | 'history' = 'editor';

  // Clients live query
  let clientsQuery = liveQuery(() => db.invoiceForgeClients.orderBy('name').toArray());
  $: clients = $clientsQuery || [];

  async function saveInvoice() {
    const totals = calculateTotal(invoice.items, invoice.settings);
    await db.invoiceForgeHistory.add({
        data: JSON.parse(JSON.stringify(invoice)), // Deep copy
        invoiceNumber: invoice.meta.number,
        clientName: invoice.client.name,
        total: totals.total,
        currency: invoice.settings.currency,
        createdAt: new Date(),
        starred: 0
    });
    // Optional: show toast
    alert(invoiceDict.actions.saved);
  }

  function loadInvoice(data: any) {
    invoice = JSON.parse(JSON.stringify(data));
    // Close sidebar on mobile if needed, or switch tab
    activeTab = 'editor';
  }

  function resetInvoice() {
    if (confirm('Are you sure you want to clear current invoice?')) {
        invoice = createEmptyInvoice();
    }
  }

  function printInvoice() {
    window.print();
  }

  async function downloadImage() {
    const node = document.getElementById('invoice-preview');
    if (node) {
        try {
            const dataUrl = await toPng(node, { quality: 0.95, backgroundColor: 'white' });
            const link = document.createElement('a');
            link.download = `invoice-${invoice.meta.number}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('oops, something went wrong!', error);
        }
    }
  }

  $: schemaObj1 = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/invoice-forge",
        "isAccessibleForFree": true,
      "name": "Invoice Forge",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": "Invoice Generation, Client Management, PDF Export, Currency Support",
      "description": invoiceDict.description
    };
</script>
<Head
  title={invoiceDict.title}
  description={invoiceDict.description}
  keywords="invoice generator, free invoice maker, pdf invoice, bill generator, receipt maker"
/>


<svelte:head>

  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/invoice-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/invoice-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/invoice-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/invoice-forge"} />
  {@html `<script type="application/ld+json">
    ${JSON.stringify(schemaObj1)}
  </scr` + `ipt>`}


  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": invoiceDict?.q1 || "",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": invoiceDict?.a1 || ""
        }
      },
      {
        "@type": "Question",
        "name": invoiceDict?.q2 || "",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": invoiceDict?.a2 || ""
        }
      },
      {
        "@type": "Question",
        "name": invoiceDict?.q3 || "",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": invoiceDict?.a3 || ""
        }
      }
    ]
  }
  </scr` + `ipt>`}

</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 print:bg-white print:pb-0">

  <!-- Top Bar (Hidden on print) -->
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 print:hidden">
    <div class="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
            <a href="/{lang}" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <ArrowLeft size={20} />
            </a>
            <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hidden sm:block">
                {invoiceDict.title}
            </h1>
        </div>

        <div class="flex items-center gap-2">
            <button on:click={resetInvoice} class="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg min-h-[44px] min-w-[44px]" title={invoiceDict.actions.reset}>
                <RefreshCw size={20} />
            </button>
            <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button on:click={saveInvoice} class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 min-h-[44px] min-w-[44px]">
                <Save size={18} />
                <span class="hidden sm:inline">{invoiceDict.actions.save}</span>
            </button>
            <button on:click={downloadImage} class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 min-h-[44px] min-w-[44px]">
                <ImageIcon size={18} />
                <span class="hidden sm:inline">{invoiceDict.actions.downloadImage}</span>
            </button>
            <button on:click={printInvoice} class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-500/30 min-h-[44px] min-w-[44px]">
                <Printer size={18} />
                <span class="hidden sm:inline">{invoiceDict.actions.downloadPdf}</span>
            </button>
        </div>
    </div>
  </header>

  <!-- Main Content -->
  <div class="max-w-[1600px] mx-auto p-4 flex flex-col lg:flex-row gap-6 items-start h-[calc(100vh-4rem)]">

    <!-- Sidebar / Editor -->
    <div class="w-full lg:w-[450px] shrink-0 flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden print:hidden">
        <!-- Tabs -->
        <div class="flex border-b border-gray-200 dark:border-gray-700">
            <button
                class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 {activeTab === 'editor' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'} min-h-[44px] min-w-[44px]"
                on:click={() => activeTab = 'editor'}
            >
                <Edit3 size={16} />
                Editor
            </button>
            <button
                class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 {activeTab === 'clients' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'} min-h-[44px] min-w-[44px]"
                on:click={() => activeTab = 'clients'}
            >
                <Users size={16} />
                Clients
            </button>
            <button
                class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 {activeTab === 'history' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'} min-h-[44px] min-w-[44px]"
                on:click={() => activeTab = 'history'}
            >
                <FileText size={16} />
                History
            </button>
        </div>

        <!-- Tab Content -->
        <div class="flex-1 overflow-hidden relative">
            {#if activeTab === 'editor'}
                <div class="h-full overflow-y-auto absolute inset-0" in:fade={{ duration: 200 }}>
                    <InvoiceEditor bind:invoice dictionary={invoiceDict} {clients} />
                </div>
            {:else if activeTab === 'clients'}
                <div class="h-full overflow-y-auto p-4 absolute inset-0" in:fade={{ duration: 200 }}>
                    <ClientManager dictionary={invoiceDict} />
                </div>
            {:else if activeTab === 'history'}
                <div class="h-full overflow-y-auto p-4 absolute inset-0" in:fade={{ duration: 200 }}>
                    <HistoryPanel dictionary={invoiceDict} onLoad={loadInvoice} />
                </div>
            {/if}
        </div>
    </div>

    <!-- Preview Area -->
    <div class="flex-1 w-full h-full overflow-y-auto bg-gray-100 dark:bg-gray-900/50 rounded-xl flex items-start justify-center p-4 sm:p-8 print:p-0 print:bg-white print:h-auto print:overflow-visible">
        <InvoicePreview {invoice} dictionary={invoiceDict} />
    </div>

  </div>

  <!-- Guide & FAQ -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:hidden">
      <!-- Guide Section -->
      <section class="mb-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">{invoiceDict.guide.title}</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-10 text-center leading-relaxed max-w-2xl mx-auto">
              {invoiceDict.guide.intro}
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Download class="text-blue-500" size={20} />
                      Local Privacy
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">
                      {invoiceDict.guide.f1.replace('**Local Privacy:** ', '')}
                  </p>
              </div>
              <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <RefreshCw class="text-purple-500" size={20} />
                      Smart Defaults
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">
                      {invoiceDict.guide.f2.replace('**Smart Defaults:** ', '')}
                  </p>
              </div>
              <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Printer class="text-green-500" size={20} />
                      Print Perfect
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">
                      {invoiceDict.guide.f3.replace('**Print Perfect:** ', '')}
                  </p>
              </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
              <h3 class="font-bold text-blue-900 dark:text-blue-100 mb-4">{invoiceDict.guide.tipsTitle}</h3>
              <ul class="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
                  <li class="flex items-start gap-2">
                      <span class="mt-1 block w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                      <span>{invoiceDict.guide.tip1.replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                  </li>
                  <li class="flex items-start gap-2">
                      <span class="mt-1 block w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                      <span>{invoiceDict.guide.tip2.replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                  </li>
                  <li class="flex items-start gap-2">
                      <span class="mt-1 block w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                      <span>{invoiceDict.guide.tip3.replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                  </li>
              </ul>
          </div>
      </section>

      <!-- FAQ Section -->
      <GuideSection {...invoiceDict?.guide} />
  <AdPlaceholder />
  <FAQSection
          title={invoiceDict.faqTitle}
          items={[
              { q: invoiceDict?.q1, a: invoiceDict?.a1 },
              { q: invoiceDict?.q2, a: invoiceDict?.a2 },
              { q: invoiceDict?.q3, a: invoiceDict?.a3 }
          ]}
      />
  </div>
</div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="invoice-forge" currentCategory="dev" />
  </div>
