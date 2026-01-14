<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { getDictionary } from '$lib/dictionaries';
  import { SubnetCalculator, type NetworkInfo, type SubnetResult } from '$lib/utils/subnet-scope/calculator';
  import Visualizer from './Visualizer.svelte';
  import SubnetTable from './SubnetTable.svelte';
  import { workspace, saveToHistory, deleteHistoryItem, clearHistory, getHistoryObservable } from '$lib/db/workspace';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let data;
  $: dict = getDictionary(data.lang);

  let input = '192.168.1.0/24';
  let result: NetworkInfo | null = null;
  let subnets: SubnetResult[] = [];
  let newMask = 26; // Default for demo

  // Reactive analysis
  // We don't want to analyze on every keystroke if it's invalid, but let's try to be responsive.
  // Debouncing might be good, but calculation is fast.

  function analyze() {
    if (!input) return;
    const res = SubnetCalculator.analyze(input);
    result = res;
    if (res.valid) {
       // Save to history (debounced or on valid)
       // Let's save only when user explicitly hits "Enter" or "Analyze" button, OR we can save valid results.
       // For this tool, saving every valid calculation might be noisy. Let's add a "Save" button or just save on valid result after a delay.
       // Let's save on successful analysis if it's different from last?
       // Let's just save manually or on specific action. "History" tab usually implies auto-save in this suite.
       // I'll add a saveToHistory call.
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

  // History
  let history$: any;
  $: if (browser) {
      history$ = liveQuery(() => getHistoryObservable('subnet-scope').toArray());
  }

  function restore(item: any) {
      input = item.input;
      analyze();
  }

  // Initial load
  onMount(() => {
      analyze();
  });

  // Tabs
  let activeTab: 'analyze' | 'subnetting' | 'history' = 'analyze';
</script>

<svelte:head>
  <title>{dict.tools.subnetScope.title}</title>
  <meta name="description" content={dict.tools.subnetScope.description} />
</svelte:head>

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

  <!-- Main Input -->
  <div class="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-2 md:p-4 border border-slate-100 dark:border-slate-700">
      <div class="flex flex-col md:flex-row gap-4 p-4">
          <input
            type="text"
            bind:value={input}
            on:keydown={(e) => e.key === 'Enter' && analyze()}
            placeholder="e.g. 192.168.1.1/24 or 2001:db8::/64"
            class="flex-1 px-5 py-4 text-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white font-mono"
          />
          <button
            on:click={analyze}
            class="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            {dict.tools.subnetScope.analyze}
          </button>
      </div>
  </div>

  <!-- Navigation -->
  <div class="flex justify-center border-b border-slate-200 dark:border-slate-800">
      <nav class="flex gap-8">
          <button
              class="pb-4 text-sm font-medium transition-colors border-b-2 {activeTab === 'analyze' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
              on:click={() => activeTab = 'analyze'}
          >
              Overview & Binary
          </button>
          <button
              class="pb-4 text-sm font-medium transition-colors border-b-2 {activeTab === 'subnetting' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
              on:click={() => activeTab = 'subnetting'}
          >
              {dict.tools.subnetScope.subnetting}
          </button>
          <button
              class="pb-4 text-sm font-medium transition-colors border-b-2 {activeTab === 'history' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
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
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">{dict.tools.subnetScope.binary}</h3>
                        <Visualizer binary={result.binary || ''} maskLength={result.subnetMaskLength || 0} version={result.version} />
                    </div>

                    <!-- Details Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="card">
                            <span class="label">{dict.tools.subnetScope.network}</span>
                            <div class="value">{result.networkAddress}</div>
                        </div>
                        {#if result.version === 4}
                        <div class="card">
                            <span class="label">{dict.tools.subnetScope.broadcast}</span>
                            <div class="value">{result.broadcastAddress}</div>
                        </div>
                        <div class="card">
                            <span class="label">{dict.tools.subnetScope.netmask}</span>
                            <div class="value">{result.subnetMask}</div>
                        </div>
                        {/if}
                        <div class="card">
                            <span class="label">{dict.tools.subnetScope.firstHost}</span>
                            <div class="value">{result.firstHost}</div>
                        </div>
                        <div class="card">
                            <span class="label">{dict.tools.subnetScope.lastHost}</span>
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
                                    {dict.tools.subnetScope.newMask} (/{result.subnetMaskLength + 1} - /{result.version === 4 ? 32 : 128})
                                    <input
                                        type="number"
                                        bind:value={newMask}
                                        min={result.subnetMaskLength ? result.subnetMaskLength + 1 : 0}
                                        max={result.version === 4 ? 32 : 128}
                                        class="w-full mt-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </label>
                            </div>
                            <button
                                on:click={generateSubnets}
                                class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
                            >
                                {dict.tools.subnetScope.generate}
                            </button>
                        </div>
                    </div>

                    <SubnetTable {subnets} {dict} />
                </div>
            {/if}
        {:else}
             <div class="p-12 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                 <p class="text-red-600 dark:text-red-400 font-medium">{result.error}</p>
             </div>
        {/if}
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
                                    on:click={() => restore(item)}
                                    class="px-3 py-1.5 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                                >
                                    {dict.tools.subnetScope.restore}
                                </button>
                                <button
                                    on:click={() => deleteHistoryItem(item.id)}
                                    aria-label="Delete"
                                    class="p-2 text-slate-400 hover:text-red-500 transition-colors"
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
          {#each ['q1', 'q2', 'q3'] as q}
            <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h4 class="font-bold text-lg mb-2">{dict.tools.subnetScope[q]}</h4>
                <p class="text-slate-600 dark:text-slate-400">{dict.tools.subnetScope['a' + q.slice(1)]}</p>
            </div>
          {/each}
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
