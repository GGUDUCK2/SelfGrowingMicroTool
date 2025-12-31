<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { dictionaries } from '$lib/dictionaries';
  import { db, type HistoryItem } from '$lib/db';

  export let data;
  $: lang = (data.lang as 'en' | 'ko') || 'en';
  $: dict = dictionaries[lang]?.tools?.compoundInterest || dictionaries.en.tools.compoundInterest;

  // State
  // Initialize from URL if in browser, otherwise defaults
  // We need to parse URL params synchronously if possible or rely on onMount to override before sync kicks in?
  // Actually, we can check $page.url directly during init if we are careful.
  // But $page is a store.

  let principal = 10000;
  let rate = 5;
  let years = 10;
  let contribution = 500;
  let copied = false;
  let initialized = false;

  // History State
  let history: HistoryItem[] = [];

  // Reactive Calculations
  $: results = calculateCompoundInterest(principal, rate, years, contribution);
  $: totalInvested = principal + (contribution * 12 * years);
  $: totalInterest = results[results.length - 1].balance - totalInvested;

  // Chart Helpers
  $: maxBalance = results[results.length - 1].balance;

  // Init from URL
  onMount(async () => {
    const searchParams = $page.url.searchParams;
    if (searchParams.has('p')) principal = Number(searchParams.get('p'));
    if (searchParams.has('r')) rate = Number(searchParams.get('r'));
    if (searchParams.has('y')) years = Number(searchParams.get('y'));
    if (searchParams.has('c')) contribution = Number(searchParams.get('c'));

    // Mark as initialized to allow URL syncing
    initialized = true;

    // Load history
    loadHistory();
  });

  // Sync URL (Shallow)
  $: if (browser && initialized) {
    const url = new URL(window.location.href);
    url.searchParams.set('p', principal.toString());
    url.searchParams.set('r', rate.toString());
    url.searchParams.set('y', years.toString());
    url.searchParams.set('c', contribution.toString());
    // Only replace state if values changed to avoid history spam
    window.history.replaceState({}, '', url);
  }

  function calculateCompoundInterest(p: number, r: number, y: number, c: number) {
    let balance = p;
    const monthlyRate = r / 100 / 12;
    const data = [];
    
    for (let i = 1; i <= y; i++) {
      for (let m = 0; m < 12; m++) {
        balance = (balance + c) * (1 + monthlyRate);
      }
      data.push({ year: i, balance: Math.round(balance) });
    }
    return data;
  }
  
  function formatMoney(amount: number) {
    return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
      style: 'currency',
      currency: lang === 'ko' ? 'KRW' : 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  async function copyLink() {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  async function saveToHistory() {
    await db.history.add({
      toolId: 'compound-interest',
      data: { principal, rate, years, contribution, totalInvested, totalInterest, finalBalance: results[results.length - 1].balance },
      createdAt: new Date()
    });
    await loadHistory();
  }

  async function loadHistory() {
    history = await db.history
      .where('toolId').equals('compound-interest')
      .reverse()
      .sortBy('createdAt');
  }

  async function deleteHistory(id: number) {
    if (id) {
      await db.history.delete(id);
      await loadHistory();
    }
  }

  async function restoreHistory(item: HistoryItem) {
    principal = item.data.principal;
    rate = item.data.rate;
    years = item.data.years;
    contribution = item.data.contribution;
  }

  // JSON-LD
  $: schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": dict.title,
    "description": dict.description,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  $: faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": dict.q1,
        "acceptedAnswer": { "@type": "Answer", "text": dict.a1 }
      },
      {
        "@type": "Question",
        "name": dict.q2,
        "acceptedAnswer": { "@type": "Answer", "text": dict.a2 }
      },
      {
        "@type": "Question",
        "name": dict.q3,
        "acceptedAnswer": { "@type": "Answer", "text": dict.a3 }
      }
    ]
  };
</script>

<svelte:head>
  <title>{dict.title} - Web Factory</title>
  <meta name="description" content={dict.description} />
  {@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
</svelte:head>

<div class="max-w-5xl mx-auto py-12 space-y-12 px-4">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-bold text-gray-900">{dict.title}</h1>
    <p class="text-gray-500 max-w-2xl mx-auto">{dict.description}</p>

    <!-- Share Button -->
    <div class="flex justify-center">
      <button
        on:click={copyLink}
        class="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors text-sm font-medium"
      >
        {#if copied}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
          {dict.linkCopied}
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
          {dict.copyLink}
        {/if}
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Input Form -->
    <div class="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-fit space-y-6">
      <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sliders-horizontal text-indigo-600"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" y1="2" y2="6"/><line x1="8" y1="10" y2="14"/><line x1="16" y1="18" y2="22"/></svg>
        {dict.config}
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.initialInvestment}
            <div class="relative font-normal mt-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input type="number" bind:value={principal} class="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
            </div>
          </label>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.monthlyContribution}
            <div class="relative font-normal mt-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input type="number" bind:value={contribution} class="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
            </div>
          </label>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.interestRate}
            <div class="relative font-normal mt-1">
               <input type="number" step="0.1" bind:value={rate} class="w-full pl-4 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" />
               <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </label>
          <input type="range" min="1" max="20" step="0.1" bind:value={rate} class="w-full mt-2 accent-indigo-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" aria-label={dict.interestRate} />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.yearsToGrow}
            <div class="flex items-center gap-4 font-normal mt-1">
              <input type="range" min="1" max="50" bind:value={years} class="flex-1 accent-indigo-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              <span class="font-bold text-indigo-600 w-12 text-right">{years}</span>
            </div>
          </label>
        </div>

        <button
          on:click={saveToHistory}
          class="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {dict.save}
        </button>
      </div>
    </div>

    <!-- Results Display -->
    <div class="lg:col-span-2 space-y-8">
       <!-- Summary Cards -->
       <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div class="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
           <div class="text-indigo-600 text-sm font-semibold mb-1 uppercase tracking-wide">{dict.futureBalance}</div>
           <div class="text-2xl lg:text-3xl font-bold text-gray-900">{formatMoney(results[results.length - 1].balance)}</div>
         </div>
         <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
           <div class="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wide">{dict.totalInvested}</div>
           <div class="text-xl font-bold text-gray-900">{formatMoney(totalInvested)}</div>
         </div>
         <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
           <div class="text-emerald-600 text-sm font-semibold mb-1 uppercase tracking-wide">{dict.totalInterest}</div>
           <div class="text-xl font-bold text-emerald-600">+{formatMoney(totalInterest)}</div>
         </div>
       </div>
       
       <!-- Chart -->
       <div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 min-h-[300px] relative">
         <h3 class="text-lg font-semibold text-gray-900 mb-6">{dict.growthChart}</h3>
         
         <div class="h-[200px] w-full flex items-end gap-1">
           {#each results as result, i}
             <div 
               class="flex-1 bg-indigo-500 hover:bg-indigo-600 transition-colors rounded-t-sm relative group cursor-pointer"
               style="height: {(result.balance / maxBalance) * 100}%"
             >
               <!-- Tooltip -->
               <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                 Year {result.year}: {formatMoney(result.balance)}
               </div>
             </div>
           {/each}
         </div>
         <div class="flex justify-between mt-2 text-xs text-gray-400">
           <span>Year 1</span>
           <span>Year {years}</span>
         </div>
       </div>

       <!-- History Section -->
       {#if history.length > 0}
       <div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100" transition:slide>
         <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-history"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/><path d="M3 3v9h9"/><path d="M12 7v5l4 2"/></svg>
           {dict.history}
         </h3>
         <div class="space-y-3">
           {#each history as item (item.id)}
             <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
               <button class="text-left cursor-pointer flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1" on:click={() => restoreHistory(item)}>
                 <div class="font-medium text-gray-900">{formatMoney(item.data.finalBalance)}</div>
                 <div class="text-sm text-gray-500">
                   {formatMoney(item.data.principal)} + {formatMoney(item.data.contribution)}/mo @ {item.data.rate}%
                 </div>
                 <div class="text-xs text-gray-400 mt-1">{item.createdAt.toLocaleString()}</div>
               </button>
               <button
                 on:click={() => item.id && deleteHistory(item.id)}
                 class="p-2 text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
                 aria-label={dict.delete}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
               </button>
             </div>
           {/each}
         </div>
       </div>
       {/if}

       <!-- FAQ Section -->
       <div class="bg-indigo-900 text-white p-8 rounded-2xl shadow-lg">
         <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-help-circle"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
           {dict.faqTitle}
         </h3>
         <div class="space-y-6">
           <div>
             <h4 class="font-semibold text-indigo-200 mb-2">{dict.q1}</h4>
             <p class="text-indigo-100 text-sm leading-relaxed">{dict.a1}</p>
           </div>
           <div>
             <h4 class="font-semibold text-indigo-200 mb-2">{dict.q2}</h4>
             <p class="text-indigo-100 text-sm leading-relaxed">{dict.a2}</p>
           </div>
           <div>
             <h4 class="font-semibold text-indigo-200 mb-2">{dict.q3}</h4>
             <p class="text-indigo-100 text-sm leading-relaxed">{dict.a3}</p>
           </div>
         </div>
       </div>

    </div>
  </div>
</div>
