<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { getDictionary } from '$lib/dictionaries';
  import MetaEditor from '$lib/components/seo-forge/MetaEditor.svelte';
  import SocialEditor from '$lib/components/seo-forge/SocialEditor.svelte';
  import JsonLdEditor from '$lib/components/seo-forge/JsonLdEditor.svelte';
  import PreviewCard from '$lib/components/seo-forge/PreviewCard.svelte';
  import { db } from '$lib/db';
  import { defaultMetaTags, generateHtml, generateJsonLd, parseHtml, type MetaTags, type JsonLdData } from '$lib/utils/seo';
  import { page } from '$app/stores';
  import { liveQuery } from 'dexie';

  // Get Dictionary
  $: dictionary = getDictionary($page.params.lang || 'en');
  $: dict = dictionary.tools.seoForge;
  $: commonDict = dictionary.common;

  // State
  let activeTab: 'meta' | 'social' | 'jsonld' | 'history' = 'meta';
  let tags: MetaTags = { ...defaultMetaTags };
  let jsonLdData: JsonLdData = {
    type: 'Website',
    name: '',
    url: '',
    description: ''
  };

  // Derived
  $: generatedHtml = generateHtml(tags);
  $: generatedJsonLd = generateJsonLd(jsonLdData);

  // History
  let history = liveQuery(() => db.seoHistory.orderBy('createdAt').reverse().limit(50).toArray());

  // Magic Paste
  let showMagicPaste = false;
  let magicInput = '';

  function handleMagicPaste() {
    if (!magicInput) return;
    try {
        // Basic heuristic: if it starts with <, treat as HTML, else treat as URL (mock)
        if (magicInput.trim().startsWith('<')) {
            const parsed = parseHtml(magicInput);
            tags = { ...tags, ...parsed };
            // Auto-fill JSON-LD basics if empty
            if (!jsonLdData.name) jsonLdData.name = tags.title;
            if (!jsonLdData.description) jsonLdData.description = tags.description;
            if (!jsonLdData.url) jsonLdData.url = tags.url;
            showMagicPaste = false;
        } else {
             // Mock URL fetch for now as we can't do real CORS requests easily without a proxy
             // In a real app we'd fetch the URL via a server endpoint
             alert("URL fetching requires a backend proxy. Please paste the HTML source code instead.");
        }
    } catch (e) {
        console.error(e);
        alert("Failed to parse input.");
    }
  }

  // Actions
  async function saveToHistory() {
    try {
      await db.seoHistory.add({
        title: tags.title,
        description: tags.description,
        url: tags.url,
        ogImage: tags.ogImage,
        jsonLdType: jsonLdData.type,
        createdAt: new Date(),
        starred: 0
      });
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  }

  function restoreHistory(item: any) {
     tags = {
         ...defaultMetaTags,
         title: item.title,
         description: item.description,
         url: item.url,
         ogImage: item.ogImage,
         ogTitle: item.title, // infer
         ogDesc: item.description // infer
     };
     jsonLdData.type = item.jsonLdType || 'Website';
     activeTab = 'meta';
  }

  async function deleteHistory(id: number) {
      await db.seoHistory.delete(id);
  }

  async function clearHistory() {
      await db.seoHistory.clear();
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    // Could show a toast here
  }
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pb-20">

  <!-- Header -->
  <div class="bg-indigo-600 text-white py-12 px-4 shadow-lg">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl md:text-4xl font-bold mb-4">{dict.title}</h1>
      <p class="text-indigo-100 text-lg max-w-2xl">{dict.description}</p>
    </div>
  </div>

  <div class="max-w-6xl mx-auto px-4 -mt-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Editor Column (Left) -->
      <div class="lg:col-span-7 space-y-6">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">

          <!-- Tabs -->
          <div class="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            <button
                class="px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap {activeTab === 'meta' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-500'}"
                on:click={() => activeTab = 'meta'}
            >
                {dict.tabs.meta}
            </button>
            <button
                class="px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap {activeTab === 'social' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-500'}"
                on:click={() => activeTab = 'social'}
            >
                {dict.tabs.social}
            </button>
            <button
                class="px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap {activeTab === 'jsonld' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-500'}"
                on:click={() => activeTab = 'jsonld'}
            >
                {dict.tabs.jsonld}
            </button>
            <button
                class="px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap {activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-500'}"
                on:click={() => activeTab = 'history'}
            >
                {dict.tabs.history}
            </button>
          </div>

          <!-- Content -->
          <div class="p-6">
             <!-- Toolbar -->
             <div class="flex justify-end mb-4 gap-2">
                 <button
                    on:click={() => showMagicPaste = !showMagicPaste}
                    class="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2 11 5"/></svg>
                    {dict.actions.magicPaste}
                 </button>
                 <button
                    on:click={saveToHistory}
                    class="px-3 py-1.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>
                    {dict.actions.save}
                 </button>
             </div>

             {#if showMagicPaste}
                <div class="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800" transition:slide>
                    <h3 class="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-2">Import from Source</h3>
                    <textarea
                        bind:value={magicInput}
                        placeholder="Paste raw HTML <head> content here..."
                        class="w-full h-32 p-3 text-xs font-mono bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                    ></textarea>
                    <div class="flex justify-end gap-2">
                        <button on:click={() => showMagicPaste = false} class="px-3 py-1 text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                        <button on:click={handleMagicPaste} class="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">Import</button>
                    </div>
                </div>
             {/if}

             {#if activeTab === 'meta'}
                <div transition:fade>
                    <MetaEditor bind:tags dictionary={dict} on:change={() => {}} />
                </div>
             {:else if activeTab === 'social'}
                <div transition:fade>
                     <SocialEditor bind:tags dictionary={dict} on:change={() => {}} />
                </div>
             {:else if activeTab === 'jsonld'}
                 <div transition:fade>
                    <JsonLdEditor bind:data={jsonLdData} dictionary={dict} on:change={() => {}} />
                 </div>
             {:else if activeTab === 'history'}
                <div transition:fade>
                    <div class="space-y-3">
                         {#if $history}
                             {#if $history.length === 0}
                                <div class="text-center text-slate-500 py-12">No history yet. Start creating!</div>
                             {:else}
                                 <div class="flex justify-end">
                                     <button on:click={clearHistory} class="text-xs text-red-500 hover:text-red-600 underline">{dict.actions.clear}</button>
                                 </div>
                                 {#each $history as item (item.id)}
                                     <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                                         <div class="overflow-hidden">
                                             <div class="font-medium text-sm truncate">{item.title || 'Untitled'}</div>
                                             <div class="text-xs text-slate-500 truncate">{item.url || 'No URL'}</div>
                                         </div>
                                         <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button on:click={() => restoreHistory(item)} class="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded text-indigo-600" title={dict.actions.restore}>
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12"/><path d="M3 3v9h9"/></svg>
                                             </button>
                                             <button on:click={() => deleteHistory(item.id!)} class="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded text-red-500" title={dict.actions.delete}>
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                             </button>
                                         </div>
                                     </div>
                                 {/each}
                             {/if}
                         {/if}
                    </div>
                </div>
             {/if}
          </div>
        </div>

        <!-- Code Output -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden mt-8">
             <div class="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-sm flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <span>Output Code</span>
                <button
                  on:click={() => copyToClipboard(activeTab === 'jsonld' ? generatedJsonLd : generatedHtml)}
                  class="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                   Copy
                </button>
             </div>
             <div class="p-4 bg-slate-900 overflow-x-auto">
                 <pre class="text-xs font-mono text-green-400 whitespace-pre-wrap">{activeTab === 'jsonld' ? generatedJsonLd : generatedHtml}</pre>
             </div>
        </div>
      </div>

      <!-- Preview Column (Right) -->
      <div class="lg:col-span-5 space-y-6">
          <div class="sticky top-6">
             <div class="flex items-center gap-2 mb-4">
                 <h2 class="text-xl font-bold text-slate-800 dark:text-white">Live Preview</h2>
                 <span class="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">Realtime</span>
             </div>
             <PreviewCard {tags} dictionary={dict} />
          </div>
      </div>

    </div>
  </div>

  <!-- FAQ / Guide Section -->
   <div class="max-w-4xl mx-auto px-4 mt-24">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm">
         <h2 class="text-2xl font-bold mb-6">{dict.guide.title}</h2>
         <div class="prose dark:prose-invert max-w-none">
             <p class="text-lg text-slate-600 dark:text-slate-300 mb-6">{dict.guide.intro}</p>

             <h3 class="text-xl font-bold mt-8 mb-4">{dict.guide.featuresTitle}</h3>
             <ul class="space-y-2">
                 <li>{@html dict.guide.f1.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600 dark:text-indigo-400">$1</strong>')}</li>
                 <li>{@html dict.guide.f2.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600 dark:text-indigo-400">$1</strong>')}</li>
                 <li>{@html dict.guide.f3.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600 dark:text-indigo-400">$1</strong>')}</li>
             </ul>

             <h3 class="text-xl font-bold mt-8 mb-4">{dict.guide.tipsTitle}</h3>
             <div class="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <ul class="space-y-3">
                    <li class="flex gap-3">
                        <span class="text-indigo-500">💡</span>
                        <span>{@html dict.guide.tip1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
                    </li>
                    <li class="flex gap-3">
                        <span class="text-indigo-500">💡</span>
                        <span>{@html dict.guide.tip2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
                    </li>
                    <li class="flex gap-3">
                        <span class="text-indigo-500">💡</span>
                        <span>{@html dict.guide.tip3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>
                    </li>
                </ul>
             </div>
         </div>

         <!-- FAQ -->
         <h2 class="text-2xl font-bold mt-12 mb-6">{dict.faqTitle}</h2>
         <div class="space-y-4">
             <details class="group bg-slate-50 dark:bg-slate-700/30 rounded-lg open:bg-white dark:open:bg-slate-700/50 open:shadow-sm transition-all duration-200">
                 <summary class="flex justify-between items-center font-medium cursor-pointer list-none p-4">
                     <span>{dict.q1}</span>
                     <span class="transition group-open:rotate-180">
                         <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                     </span>
                 </summary>
                 <div class="text-slate-600 dark:text-slate-400 mt-0 px-4 pb-4">
                     {dict.a1}
                 </div>
             </details>
             <details class="group bg-slate-50 dark:bg-slate-700/30 rounded-lg open:bg-white dark:open:bg-slate-700/50 open:shadow-sm transition-all duration-200">
                 <summary class="flex justify-between items-center font-medium cursor-pointer list-none p-4">
                     <span>{dict.q2}</span>
                     <span class="transition group-open:rotate-180">
                         <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                     </span>
                 </summary>
                 <div class="text-slate-600 dark:text-slate-400 mt-0 px-4 pb-4">
                     {dict.a2}
                 </div>
             </details>
             <details class="group bg-slate-50 dark:bg-slate-700/30 rounded-lg open:bg-white dark:open:bg-slate-700/50 open:shadow-sm transition-all duration-200">
                 <summary class="flex justify-between items-center font-medium cursor-pointer list-none p-4">
                     <span>{dict.q3}</span>
                     <span class="transition group-open:rotate-180">
                         <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                     </span>
                 </summary>
                 <div class="text-slate-600 dark:text-slate-400 mt-0 px-4 pb-4">
                     {dict.a3}
                 </div>
             </details>
         </div>
      </div>
   </div>
</div>

<svelte:head>
  <title>{dict.title} - MicroTools Factory</title>
  <meta name="description" content={dict.description} />
  <meta name="keywords" content={dict.guide.tipsTitle} />

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SEO Forge",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "description": "{dict.description}",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": "{dict.q1}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{dict.a1}"
      }
    }, {
      "@type": "Question",
      "name": "{dict.q2}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{dict.a2}"
      }
    }, {
      "@type": "Question",
      "name": "{dict.q3}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{dict.a3}"
      }
    }]
  }
  </script>
</svelte:head>
