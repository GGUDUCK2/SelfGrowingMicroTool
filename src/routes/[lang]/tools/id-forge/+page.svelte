<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { page } from '$app/stores';
  import Generator from '$lib/components/id-forge/Generator.svelte';
  import Output from '$lib/components/id-forge/Output.svelte';
  import Analyzer from '$lib/components/id-forge/Analyzer.svelte';
  import Collision from '$lib/components/id-forge/Collision.svelte';
  import History from '$lib/components/id-forge/History.svelte';
  import { generateIds, formatOutput, type GenerationOptions } from '$lib/utils/id-forge/id-forge';
  import { db } from '$lib/db';

  let activeTab: 'generate' | 'analyze' | 'collision' = 'generate';
  let generatedOutput = '';
  let currentFormat: GenerationOptions['format'] = 'plain';

  // Default Options
  let genOptions: GenerationOptions = {
    type: 'uuid-v4',
    quantity: 1,
    format: 'plain',
    nanoidLength: 21
  };

  async function handleGenerate(event: CustomEvent<GenerationOptions>) {
    const opts = event.detail;
    currentFormat = opts.format;

    // Generate
    const ids = generateIds(opts);
    generatedOutput = formatOutput(ids, opts.format);

    // Save to History
    await db.idForgeHistory.add({
        type: opts.type,
        count: opts.quantity,
        sample: ids[0],
        createdAt: new Date(),
        starred: 0
    });
  }
</script>

<svelte:head>
  <title>ID Forge: UUID, ULID, NanoID Generator & Analyzer</title>
  <meta name="description" content="Generate and analyze UUIDs (v1-v7), ULIDs, CUIDs, and NanoIDs. Includes collision probability calculator and developer tools." />
  <meta name="keywords" content="uuid generator, ulid generator, nanoid generator, guid, uuid v7, collision calculator" />

  <!-- JSON-LD for SoftwareApplication -->
  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ID Forge",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": "UUID Generation (v1, v3, v4, v5, v7), ULID Generation, Collision Probability Calculator, ID Analysis",
    "description": "A professional-grade identifier generation suite for developers."
  }
  </script>`}
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-12 space-y-12">
  <!-- Header -->
  <div class="text-center space-y-4">
    <div class="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
        <svg class="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
    </div>
    <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
      ID <span class="text-indigo-600 dark:text-indigo-400">Forge</span>
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
      The definitive architect for Unique Identifiers. Generate, Analyze, and Validate with precision.
    </p>
  </div>

  <!-- Main Tool Interface -->
  <div class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-800 p-1">
    <!-- Tabs -->
    <div class="flex p-1 space-x-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
        {#each ['generate', 'analyze', 'collision'] as tab}
            <button
                on:click={() => activeTab = tab}
                class="flex-1 py-3 text-sm font-bold rounded-xl transition-all {activeTab === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
            >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
        {/each}
    </div>

    <!-- Content Area -->
    <div class="p-4 md:p-8 min-h-[400px]">
        {#if activeTab === 'generate'}
            <div in:fade class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <Generator options={genOptions} on:generate={handleGenerate} />
                    <History />
                </div>
                <div class="space-y-6">
                    <Output output={generatedOutput} format={currentFormat} />
                </div>
            </div>
        {:else if activeTab === 'analyze'}
            <div in:fade class="max-w-2xl mx-auto">
                <Analyzer />
            </div>
        {:else if activeTab === 'collision'}
            <div in:fade class="max-w-3xl mx-auto">
                <Collision />
            </div>
        {/if}
    </div>
  </div>

  <!-- Documentation / SEO Content -->
  <div class="prose prose-slate dark:prose-invert max-w-none">
    <h2>Why ID Forge?</h2>
    <p>
      In modern distributed systems, choosing the right identifier strategy is critical. ID Forge provides a unified interface for the most robust standards available today, from the classic UUID v4 to the modern, time-sortable UUID v7 and ULID.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose my-8">
        <div class="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 class="text-lg font-bold mb-2">UUID v7 (The New Standard)</h3>
            <p class="text-slate-600 dark:text-slate-300 text-sm">
                Combines a Unix timestamp with random bits. It's time-sortable, making it index-friendly for databases like PostgreSQL and MySQL, avoiding the fragmentation issues of v4.
            </p>
        </div>
        <div class="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 class="text-lg font-bold mb-2">ULID</h3>
            <p class="text-slate-600 dark:text-slate-300 text-sm">
                Universally Unique Lexicographically Sortable Identifier. Uses Crockford's Base32 encoding for URL safety and compactness (26 chars).
            </p>
        </div>
    </div>

    <h2>Frequently Asked Questions</h2>
    <div class="space-y-6 not-prose">
        <details class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <summary class="flex items-center justify-between p-6 cursor-pointer font-medium">
                <span>When should I use NanoID over UUID?</span>
                <span class="transition-transform group-open:rotate-180">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
            </summary>
            <div class="px-6 pb-6 text-slate-600 dark:text-slate-300">
                NanoID is perfect for frontend-generated IDs (like short URLs or component keys) where you need a compact string. It's safe to use in URLs and is significantly smaller than a UUID. However, for primary database keys, UUID v7 or ULID is often preferred for sorting performance.
            </div>
        </details>

        <details class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <summary class="flex items-center justify-between p-6 cursor-pointer font-medium">
                <span>Is UUID v4 still good?</span>
                <span class="transition-transform group-open:rotate-180">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
            </summary>
            <div class="px-6 pb-6 text-slate-600 dark:text-slate-300">
                Yes, UUID v4 (completely random) is excellent for general purpose use where sorting is not required. However, inserting millions of random v4 UUIDs into a B-Tree index (like in SQL databases) can cause performance degradation due to page splitting.
            </div>
        </details>
    </div>
  </div>
</div>
