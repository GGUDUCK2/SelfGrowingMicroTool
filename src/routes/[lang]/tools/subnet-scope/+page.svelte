<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { fade, slide } from 'svelte/transition';
  import { getDictionary } from '$lib/dictionaries';
  import { SubnetCalculator, type NetworkInfo, type SubnetResult } from '$lib/utils/subnet-scope/calculator';
  import Visualizer from './Visualizer.svelte';
  import SubnetTable from './SubnetTable.svelte';
  import SubnetPlanner from './SubnetPlanner.svelte';
  import { workspace, saveToHistory, deleteHistoryItem, clearHistory, getHistoryObservable, toggleStar, type ToolHistoryItem } from '$lib/db/workspace';
  import { liveQuery, type Observable } from 'dexie';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let data;
  $: dict = getDictionary(data.lang);

  let input = '192.168.1.0/24';
  let result: NetworkInfo | null = null;
  let subnets: SubnetResult[] = [];
  let newMask = 26; // Default for demo
  let toast: string | null = null;
  let toastTimeout: any;

  // Shortcuts
  function handleKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          analyze();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          input = '';
          result = null;
      }
  }

  function showToast(msg: string) {
      if (toastTimeout) clearTimeout(toastTimeout);
      toast = msg;
      toastTimeout = setTimeout(() => toast = null, 2000);
  }

  function copyText(text: string) {
      if (!text || text === 'N/A') return;
      navigator.clipboard.writeText(text);
      showToast('Copied!');
  }

  function analyze() {
    if (!input) return;
    const res = SubnetCalculator.analyze(input);
    result = res;
    if (res.valid) {
       saveToHistory('subnet-scope', input, null).catch(() => {});

       // Reset newMask default if needed
       if (res.version === 4 && res.subnetMaskLength) {
           if (newMask <= res.subnetMaskLength) {
               newMask = Math.min(res.subnetMaskLength + 2, 30);
           }
       }
    }
    subnets = []; // Reset subnets until generated
  }

  function generateSubnets() {
      if (result && result.valid) {
          subnets = SubnetCalculator.generateSubnets(input, newMask);
      }
  }

  function loadExample(example: string) {
      input = example;
      analyze();
  }

  function share() {
      if (!browser) return;
      const url = new URL(window.location.href);
      url.searchParams.set('input', input);
      if (activeTab !== 'analyze') {
          url.searchParams.set('tab', activeTab);
      }
      navigator.clipboard.writeText(url.toString());
      showToast(dict.tools.subnetScope.linkCopied || 'Link Copied!');
  }

  // History
  let history$: Observable<ToolHistoryItem[]> | undefined;
  $: if (browser) {
      history$ = liveQuery(() => getHistoryObservable('subnet-scope'));
  }

  function restore(item: ToolHistoryItem) {
      if (typeof item.input === 'string') {
          input = item.input;
          analyze();
          activeTab = 'analyze';
      }
  }

  // Initial load
  onMount(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedInput = urlParams.get('input');
      const sharedTab = urlParams.get('tab');

      if (sharedInput) {
          input = sharedInput;
      }

      analyze();

      if (sharedTab && ['analyze', 'subnetting', 'planner', 'history'].includes(sharedTab)) {
          activeTab = sharedTab as any;
      }
  });

  // Tabs
  let activeTab: 'analyze' | 'subnetting' | 'planner' | 'history' = 'analyze';
</script>
<Head
  title={dict.tools.subnetScope.title}
  description={dict.tools.subnetScope.description}
/>


<svelte:window on:keydown={handleKeydown} />

<svelte:head>



  {@html `<script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "isAccessibleForFree": true,
      "name": "Subnet Scope",
      "applicationCategory": "DeveloperApplication",
      "applicationSubCategory": "Network Utility",
      "operatingSystem": "Web, iOS, Android, Linux, Windows, macOS",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Calculate, visualize, and plan IPv4/IPv6 subnets with VLSM support.",
      "featureList": [
        "IPv4 & IPv6 CIDR Calculator",
        "Binary Visualization",
        "VLSM Subnet Generator",
        "Private/Public IP Detection",
        "Export Subnet Plan (CSV/JSON)"
      ]
    })}
  </script>`}

  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "${dict.q1}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict.a1}"
        }
      },
      {
        "@type": "Question",
        "name": "${dict.q2}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict.a2}"
        }
      },
      {
        "@type": "Question",
        "name": "${dict.q3}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict.a3}"
        }
      }
    ]
  }
  </script>`}

</svelte:head>

<!-- Toast -->
{#if toast}
<div class="fixed bottom-6 right-6 z-50 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-lg text-sm font-medium animate-bounce" in:fade>
    {toast}
</div>
{/if}

<div class="max-w-6xl mx-auto px-4 py-12 space-y-12">
  <!-- Header -->
  <div class="text-center space-y-4" in:fade={{ duration: 600 }}>
    <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
        {dict.tools.subnetScope.title}
      </span>
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
      {dict.tools.subnetScope.description}
    </p>
  </div>

  <!-- Cloud & Common Presets -->
  <div class="space-y-3 max-w-2xl mx-auto">
      <div class="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{dict.tools.subnetScope.presets.title}</div>
      <div class="flex flex-wrap justify-center gap-2">
          <button on:click={() => loadExample('10.0.0.0/16')} class="px-3 py-1 text-xs min-h-[44px] min-w-[44px] font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors">
              {dict.tools.subnetScope.presets.aws}
          </button>
          <button on:click={() => loadExample('10.0.0.0/16')} class="px-3 py-1 text-xs min-h-[44px] min-w-[44px] font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
              {dict.tools.subnetScope.presets.azure}
          </button>
          <button on:click={() => loadExample('192.168.1.0/24')} class="px-3 py-1 text-xs min-h-[44px] min-w-[44px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              {dict.tools.subnetScope.presets.home}
          </button>
          <button on:click={() => loadExample('172.17.0.0/16')} class="px-3 py-1 text-xs min-h-[44px] min-w-[44px] font-medium bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800 rounded-full hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors">
              {dict.tools.subnetScope.presets.docker}
          </button>
          <button on:click={() => loadExample('10.10.10.0/30')} class="px-3 py-1 text-xs min-h-[44px] min-w-[44px] font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
              {dict.tools.subnetScope.presets.p2p}
          </button>
          <button on:click={() => loadExample('2001:db8::/64')} class="px-3 py-1 text-xs min-h-[44px] min-w-[44px] font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-800 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors">
              IPv6 Site (/64)
          </button>
      </div>
  </div>

  <!-- Main Input -->
  <div class="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-2 md:p-4 border border-slate-100 dark:border-slate-700">
      <div class="flex flex-col md:flex-row gap-4 p-4">
          <input
            type="text"
            bind:value={input}
            on:keydown={(e) => e.key === 'Enter' && analyze()}
            placeholder="e.g. 192.168.1.1/24 or 2001:db8::/64"
            class="flex-1 px-5 py-4 text-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white font-mono"
            aria-label="IP Address or CIDR Input"
          />
          <button
            on:click={analyze}
            class="px-8 py-4 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
            aria-label="Analyze IP"
          >
            {dict.tools.subnetScope.analyze}
          </button>
          <button
             on:click={share}
             class="px-4 py-4 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors"
             aria-label="Share Configuration"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
      </div>
  </div>

  <!-- Navigation -->
  <div class="flex justify-center border-b border-slate-200 dark:border-slate-800">
      <nav class="flex gap-8">
          <button
              class="pb-4 min-h-[44px] text-sm font-medium transition-colors border-b-2 {activeTab === 'analyze' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
              on:click={() => activeTab = 'analyze'}
          >
              Overview & Binary
          </button>
          <button
              class="pb-4 min-h-[44px] text-sm font-medium transition-colors border-b-2 {activeTab === 'subnetting' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
              on:click={() => activeTab = 'subnetting'}
          >
              {dict.tools.subnetScope.subnetting}
          </button>
          <button
              class="pb-4 min-h-[44px] text-sm font-medium transition-colors border-b-2 {activeTab === 'planner' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
              on:click={() => activeTab = 'planner'}
          >
              Network Planner
          </button>
          <button
              class="pb-4 min-h-[44px] text-sm font-medium transition-colors border-b-2 {activeTab === 'history' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
              on:click={() => activeTab = 'history'}
          >
              {dict.tools.subnetScope.history}
          </button>
      </nav>
  </div>

  <!-- Content -->
  <div class="min-h-[400px]">
      {#if result}
        {#if result.valid}
            {#if activeTab === 'analyze'}
                <div class="space-y-8" in:fade>
                    <!-- Visualizer -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{dict.tools.subnetScope.binary}</h3>
                        </div>
                        <Visualizer binary={result.binary || ''} maskLength={result.subnetMaskLength || 0} version={result.version} />
                    </div>

                    <!-- Details Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="card group">
                            <div class="flex justify-between items-start">
                                <span class="label">{dict.tools.subnetScope.network}</span>
                                <button class="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 hover:text-indigo-600 min-h-[44px]" on:click={() => copyText(result?.networkAddress || '')} aria-label="Copy Network Address">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>
                            <div class="value">{result.networkAddress}</div>
                        </div>
                        {#if result.version === 4}
                        <div class="card group">
                            <div class="flex justify-between items-start">
                                <span class="label">{dict.tools.subnetScope.broadcast}</span>
                                <button class="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 hover:text-indigo-600 min-h-[44px]" on:click={() => copyText(result?.broadcastAddress || '')} aria-label="Copy Broadcast Address">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>
                            <div class="value">{result.broadcastAddress}</div>
                        </div>
                        <div class="card group">
                            <div class="flex justify-between items-start">
                                <span class="label">{dict.tools.subnetScope.netmask}</span>
                                <button class="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 hover:text-indigo-600 min-h-[44px]" on:click={() => copyText(result?.subnetMask || '')} aria-label="Copy Netmask">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>
                            <div class="value">{result.subnetMask}</div>
                        </div>
                        {/if}
                        <div class="card group">
                            <div class="flex justify-between items-start">
                                <span class="label">{dict.tools.subnetScope.firstHost}</span>
                                <button class="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 hover:text-indigo-600 min-h-[44px]" on:click={() => copyText(result?.firstHost || '')} aria-label="Copy First Host">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>
                            <div class="value">{result.firstHost}</div>
                        </div>
                        <div class="card group">
                            <div class="flex justify-between items-start">
                                <span class="label">{dict.tools.subnetScope.lastHost}</span>
                                <button class="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 hover:text-indigo-600 min-h-[44px]" on:click={() => copyText(result?.lastHost || '')} aria-label="Copy Last Host">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>
                            <div class="value">{result.lastHost}</div>
                        </div>
                        <div class="card">
                            <span class="label">{dict.tools.subnetScope.hosts}</span>
                            <div class="value">{parseInt(result.totalHosts || '0').toLocaleString()}</div>
                        </div>
                        <div class="card">
                            <span class="label">{dict.tools.subnetScope.type}</span>
                            <div class="flex gap-2">
                                <span class="badge">{result.type}</span>
                                {#if result.isPrivate}<span class="badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Private</span>{/if}
                            </div>
                        </div>
                    </div>
                </div>
            {:else if activeTab === 'subnetting'}
                <div class="space-y-8" in:fade>
                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div class="flex flex-wrap items-end gap-6">
                            <div class="flex-1 min-w-[200px]">
                                <span class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Current Mask: /{result.subnetMaskLength}
                                </span>
                                <div class="text-2xl font-mono text-slate-900 dark:text-white">
                                    {result.address}
                                </div>
                            </div>
                            <div class="flex-1 min-w-[200px]">
                                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {dict.tools.subnetScope.newMask} (/{result.subnetMaskLength ? result.subnetMaskLength + 1 : 0} - /{result.version === 4 ? 32 : 128})
                                    <input
                                        type="number"
                                        bind:value={newMask}
                                        min={result.subnetMaskLength ? result.subnetMaskLength + 1 : 0}
                                        max={result.version === 4 ? 32 : 128}
                                        class="w-full mt-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[44px]"
                                    />
                                </label>
                            </div>
                            <button
                                on:click={generateSubnets}
                                class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors min-h-[44px]"
                            >
                                {dict.tools.subnetScope.generate}
                            </button>
                        </div>
                    </div>

                    <SubnetTable {subnets} dict={dict.tools.subnetScope} commonDict={dict.common} />
                </div>
            {/if}
        {:else}
             <div class="p-12 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                 <p class="text-red-600 dark:text-red-400 font-medium">{result.error}</p>
             </div>
        {/if}
      {/if}

      {#if activeTab === 'planner'}
          <div in:fade>
              <SubnetPlanner dict={dict.tools.subnetScope} />
          </div>
      {/if}

      {#if activeTab === 'history'}
        <div class="space-y-4" in:fade>
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Recent Calculations</h3>
                <button
                    on:click={() => clearHistory('subnet-scope')}
                    class="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                    {dict.tools.subnetScope.clear}
                </button>
            </div>

            {#if $history$ && $history$.length > 0}
                <div class="grid gap-3">
                    {#each $history$ as item}
                        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div>
                                <div class="font-mono text-lg text-indigo-600 dark:text-indigo-400 font-medium">{item.input}</div>
                                <div class="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</div>
                            </div>
                            <div class="flex gap-2">
                                <button
                                    on:click={() => toggleStar(item.id!)}
                                    class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors {item.starred ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}"
                                    aria-label="Toggle Star"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={item.starred ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                </button>
                                <button
                                    on:click={() => restore(item)}
                                    class="px-3 py-1.5 min-h-[44px] text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                                >
                                    {dict.tools.subnetScope.restore}
                                </button>
                                <button
                                    on:click={() => deleteHistoryItem(item.id!)}
                                    aria-label="Delete"
                                    class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="text-center py-12 text-slate-500">
                    No history yet. Start analyzing!
                </div>
            {/if}
        </div>
      {/if}
  </div>

  <!-- Documentation -->
  <article class="prose dark:prose-invert max-w-none mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
      <h2 class="text-3xl font-bold mb-6">{dict.tools.subnetScope.guide.title}</h2>
      <p class="text-lg leading-relaxed text-slate-600 dark:text-slate-400">{dict.tools.subnetScope.guide.intro}</p>

      <div class="grid md:grid-cols-3 gap-8 my-12">
          <div class="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl">
              <h3 class="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-3">IPv4 & IPv6</h3>
              <p class="text-indigo-800 dark:text-indigo-200">Full dual-stack support. Analyze classic 32-bit addresses or modern 128-bit IPv6 addresses with equal ease.</p>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl">
              <h3 class="text-xl font-bold text-purple-900 dark:text-purple-300 mb-3">Visual Learning</h3>
              <p class="text-purple-800 dark:text-purple-200">Understand the binary nature of subnetting. The color-coded visualizer shows exactly where the network ends and the host begins.</p>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl">
              <h3 class="text-xl font-bold text-blue-900 dark:text-blue-300 mb-3">VLSM Planning</h3>
              <p class="text-blue-800 dark:text-blue-200">Variable Length Subnet Masking is complex. Use our generator to verify your subnet divisions before deploying.</p>
          </div>
      </div>

      <h3 class="text-2xl font-bold mt-12 mb-6">{dict.tools.subnetScope.faqTitle}</h3>
      <div class="space-y-6">
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h4 class="font-bold text-lg mb-2">{dict.tools.subnetScope.q1}</h4>
          <p class="text-slate-600 dark:text-slate-400">{dict.tools.subnetScope.a1}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h4 class="font-bold text-lg mb-2">{dict.tools.subnetScope.q2}</h4>
          <p class="text-slate-600 dark:text-slate-400">{dict.tools.subnetScope.a2}</p>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h4 class="font-bold text-lg mb-2">{dict.tools.subnetScope.q3}</h4>
          <p class="text-slate-600 dark:text-slate-400">{dict.tools.subnetScope.a3}</p>
      </div>
      </div>
  </article>
</div>

<style>
    .card {
        @apply bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md;
    }
    .card .label {
        @apply block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2;
    }
    .card .value {
        @apply text-lg font-mono font-semibold text-slate-900 dark:text-white break-all;
    }
    .badge {
        @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300;
    }
</style>
