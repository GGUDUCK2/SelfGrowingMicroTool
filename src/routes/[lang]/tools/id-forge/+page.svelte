<script lang="ts">
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { replaceState } from '$app/navigation';
  import { browser } from '$app/environment';

  import Generator from '$lib/components/id-forge/Generator.svelte';
  import Output from '$lib/components/id-forge/Output.svelte';
  import Analyzer from '$lib/components/id-forge/Analyzer.svelte';
  import Collision from '$lib/components/id-forge/Collision.svelte';
  import History from '$lib/components/id-forge/History.svelte';
  import { generateIds, formatOutput, type GenerationOptions, type IdType } from '$lib/utils/id-forge/id-forge';
  import { db, type IdForgeHistory } from '$lib/db';
  import { getDictionary } from '$lib/dictionaries';
  $: lang = $page.params.lang || 'en';

  let activeTab: 'generate' | 'analyze' | 'collision' = 'generate';
  let generatedOutput = '';
  let generatedIds: string[] = [];
  let currentFormat: GenerationOptions['format'] = 'plain';

  // Get localized dictionary
  $: dict = getDictionary($page.params.lang ?? 'en').tools.idForge;

  // Default Options
  let genOptions: GenerationOptions = {
    type: 'uuid-v4',
    quantity: 1,
    format: 'plain',
    nanoidLength: 21,
    nanoidAlphabet: '',
    namespace: '',
    name: ''
  };

  function isValidFormat(fmt: any): fmt is GenerationOptions['format'] {
      return ['plain', 'hyphens', 'json', 'sql', 'guid', 'csv'].includes(fmt);
  }

  // Sync state from URL on mount
  onMount(() => {
    if (browser) {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') as IdType;
        const quantity = parseInt(urlParams.get('qty') || '0');
        const format = urlParams.get('fmt');
        const nanoLen = parseInt(urlParams.get('len') || '0');
        const tab = urlParams.get('tab');

        if (type) genOptions.type = type;
        if (quantity) genOptions.quantity = quantity;
        if (format && isValidFormat(format)) genOptions.format = format;
        if (nanoLen) genOptions.nanoidLength = nanoLen;

        if (tab === 'analyze' || tab === 'collision') {
            activeTab = tab;
        }

        // Auto-generate if specific intent is detected (e.g. shared link)
        if (type && quantity) {
            handleGenerate(new CustomEvent('generate', { detail: genOptions }));
        }
    }
  });

  // Sync state to URL
  function updateUrl(opts: GenerationOptions) {
      if (!browser) return;
      const url = new URL(window.location.href);
      url.searchParams.set('type', opts.type);
      url.searchParams.set('qty', opts.quantity.toString());
      url.searchParams.set('fmt', opts.format);
      if (opts.nanoidLength) url.searchParams.set('len', opts.nanoidLength.toString());

      replaceState(url.toString(), {});
  }

  function handleTabChange(tab: 'generate' | 'analyze' | 'collision') {
      activeTab = tab;
      if (browser) {
          const url = new URL(window.location.href);
          url.searchParams.set('tab', tab);
          replaceState(url.toString(), {});
      }
  }

  async function handleGenerate(event: CustomEvent<GenerationOptions>) {
    const opts = event.detail;
    currentFormat = opts.format;

    // Sync URL
    updateUrl(opts);

    // Generate
    const ids = generateIds(opts);
    generatedIds = ids;
    generatedOutput = formatOutput(ids, opts.format);

    // Save to History (Debounce or just save?)
    if (browser) {
        try {
            await db.idForgeHistory.add({
                type: opts.type,
                count: opts.quantity,
                sample: ids[0],
                createdAt: new Date(),
                starred: 0
            });

            // Prune old history
            const count = await db.idForgeHistory.where('starred').equals(0).count();
            if (count > 100) {
                const oldest = await db.idForgeHistory.where('starred').equals(0).sortBy('createdAt');
                const toDelete = oldest.slice(0, count - 100);
                const deleteIds = toDelete.map(item => item.id).filter((id): id is number => id !== undefined);
                await db.idForgeHistory.bulkDelete(deleteIds);
            }
        } catch (e) {
            console.error('Failed to save history', e);
        }
    }
  }

  function handleRestore(event: CustomEvent<IdForgeHistory>) {
      const item = event.detail;
      genOptions = {
          ...genOptions,
          type: item.type as any,
          quantity: item.count
      };
      // Trigger generation to provide immediate feedback
      handleGenerate(new CustomEvent('generate', { detail: genOptions }));
  }

  // Keyboard Shortcuts
  function handleKeydown(e: KeyboardEvent) {
      // Ctrl/Cmd + Enter: Generate
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          if (activeTab === 'generate') {
              e.preventDefault();
              handleGenerate(new CustomEvent('generate', { detail: genOptions }));
          }
      }
      // Ctrl/Cmd + K: Clear Output
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          generatedOutput = '';
          generatedIds = [];
      }
      // Esc: Clear Output
       if (e.key === 'Escape' && generatedOutput) {
           e.preventDefault();
           generatedOutput = '';
           generatedIds = [];
       }
  }

  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/id-forge",
        "isAccessibleForFree": true,
    "name": "ID Forge",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": "UUID Generation (v1, v3, v4, v5, v7), ULID Generation, Collision Probability Calculator, ID Analysis, Bulk Generation (JSON/SQL/CSV)",
    "description": dict.description
  };

  $: jsonLd2 = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": dict?.q1,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict?.a1
        }
      },
      {
        "@type": "Question",
        "name": dict?.q2,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict?.a2
        }
      },
      {
        "@type": "Question",
        "name": dict?.q3,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dict?.a3
        }
      }
    ]
  };
</script>
<Head
  title={dict.title}
  description={dict.description}
  keywords="uuid generator, ulid generator, nanoid generator, guid, uuid v7, collision calculator, id generator"
/>


<svelte:window on:keydown={handleKeydown} />

<svelte:head>



  <!-- JSON-LD for SoftwareApplication -->
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}

  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd2) + '</scr' + 'ipt>'}

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
      {dict.description}
    </p>
  </div>

  <!-- Main Tool Interface -->
  <div class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-800 p-1">
    <!-- Tabs -->
    <div class="flex p-1 space-x-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
        {#each ['generate', 'analyze', 'collision'] as tab}
            <button class="min-h-[44px] min-w-[44px] flex-1 py-3 text-sm font-bold rounded-xl transition-all {activeTab === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}" on:click={() => handleTabChange(tab)}
            >
                {dict.tabs[tab] || tab}
            </button>
        {/each}
    </div>

    <!-- Content Area -->
    <div class="p-4 md:p-8 min-h-[400px]">
        {#if activeTab === 'generate'}
            <div in:fade class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <Generator bind:options={genOptions} on:generate={handleGenerate} />

                    <!-- Shortcuts Helper -->
                    <div class="text-xs text-slate-400 flex items-center justify-between px-2">
                        <span>{dict.shortcuts}: <kbd class="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Cmd/Ctrl + Enter</kbd> {dict.generate}</span>
                        <span><kbd class="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Cmd/Ctrl + K</kbd> {dict.buttons.delete || 'Clear'}</span>
                    </div>

                    <History on:restore={handleRestore} />
                </div>
                <div class="space-y-6">
                    <Output output={generatedOutput} format={currentFormat} ids={generatedIds} />
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
    <h2>{dict.guide.title}</h2>
    <p>
      {dict.guide.intro}
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose my-8">
        <div class="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 class="text-lg font-bold mb-2">UUID v7</h3>
            <p class="text-slate-600 dark:text-slate-300 text-sm">
                {dict.faqTitle === 'ID Forge FAQ' ? "Combines a Unix timestamp with random bits. It's time-sortable, making it index-friendly for databases like PostgreSQL and MySQL, avoiding the fragmentation issues of v4." : "Time-sortable UUID."}
            </p>
        </div>
        <div class="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 class="text-lg font-bold mb-2">ULID</h3>
            <p class="text-slate-600 dark:text-slate-300 text-sm">
                 {dict.faqTitle === 'ID Forge FAQ' ? "Universally Unique Lexicographically Sortable Identifier. Uses Crockford's Base32 encoding for URL safety and compactness (26 chars)." : "URL-safe sortable ID."}
            </p>
        </div>
    </div>

    <h2>{dict.faqTitle}</h2>
    <div class="space-y-6 not-prose">
        <details class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <summary class="flex items-center justify-between p-6 cursor-pointer font-medium">
                <span>{dict?.q1}</span>
                <span class="transition-transform group-open:rotate-180">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
            </summary>
            <div class="px-6 pb-6 text-slate-600 dark:text-slate-300">
                {dict?.a1}
            </div>
        </details>

        <details class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <summary class="flex items-center justify-between p-6 cursor-pointer font-medium">
                <span>{dict?.q2}</span>
                <span class="transition-transform group-open:rotate-180">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
            </summary>
            <div class="px-6 pb-6 text-slate-600 dark:text-slate-300">
                {dict?.a2}
            </div>
        </details>

        <details class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <summary class="flex items-center justify-between p-6 cursor-pointer font-medium">
                <span>{dict?.q3}</span>
                <span class="transition-transform group-open:rotate-180">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
            </summary>
            <div class="px-6 pb-6 text-slate-600 dark:text-slate-300">
                {dict?.a3}
            </div>
        </details>
    </div>
  </div>


  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
    <GuideSection {...dict?.guide} />
  <AdPlaceholder />
  <FAQSection
      title={dict?.faqTitle}
      items={[
        { q: dict?.q1, a: dict?.a1 },
        { q: dict?.q2, a: dict?.a2 },
        { q: dict?.q3, a: dict?.a3 }
      ]}
    />
  <RelatedTools {lang} currentSlug="id-forge" currentCategory="dev" />
  </div>
</div>
