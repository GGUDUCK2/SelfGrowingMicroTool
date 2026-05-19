<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { getDictionary } from '$lib/dictionaries';
  import MetaEditor from '$lib/components/seo-forge/MetaEditor.svelte';
  import SocialEditor from '$lib/components/seo-forge/SocialEditor.svelte';
  import JsonLdEditor from '$lib/components/seo-forge/JsonLdEditor.svelte';
  import PreviewCard from '$lib/components/seo-forge/PreviewCard.svelte';
  import AuditPanel from '$lib/components/seo-forge/AuditPanel.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { db, type SeoHistory } from '$lib/db';
  import { defaultMetaTags, generateHtml, generateJsonLd, parseHtml, seoTemplates, type MetaTags, type JsonLdData } from '$lib/utils/seo';
  import { page } from '$app/stores';
  import { liveQuery } from 'dexie';
  $: lang = $page.params.lang || 'en';

  // Get Dictionary
  $: dictionary = getDictionary($page.params.lang || 'en');
  $: dict = dictionary.tools.seoForge;

  // State
  let activeTab: 'meta' | 'social' | 'jsonld' | 'history' = 'meta';
  let tags: MetaTags = { ...defaultMetaTags };
  let jsonLdData: JsonLdData = {
    type: 'Website',
    name: '',
    url: '',
    description: ''
  };
  let showToast = false;
  let toastMessage = '';
  let projectName = '';
  let historyFilter = '';

  // Prism State
  let Prism: any = null;
  let highlightedCode = '';

  onMount(() => {
    const init = async () => {
      // Dynamic import for Prism to avoid SSR issues
      const prismModule = await import('prismjs');
      Prism = prismModule.default;

      // Use standard imports or dynamic with casting if needed
      // Prism plugins often don't have types exported nicely
      await import('prismjs/components/prism-json');
      await import('prismjs/components/prism-markup');
      await import('prismjs/themes/prism-tomorrow.css');

      updateHighlight();
    };

    init();
    loadFromUrl();
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  // Derived
  $: generatedHtml = generateHtml(tags);
  $: generatedJsonLd = generateJsonLd(jsonLdData);
  $: {
    generatedHtml;
    generatedJsonLd;
    activeTab;
    if (Prism) updateHighlight();
  }

  function updateHighlight() {
     if (!Prism) return;
     try {
        highlightedCode = activeTab === 'jsonld'
          ? Prism.highlight(generatedJsonLd, Prism.languages.json, 'json')
          : Prism.highlight(generatedHtml, Prism.languages.markup, 'markup');
     } catch (e) {
        console.warn('Prism highlight failed', e);
        highlightedCode = activeTab === 'jsonld' ? generatedJsonLd : generatedHtml;
     }
  }

  // History
  let history = liveQuery(() => db.seoHistory.orderBy('createdAt').reverse().limit(50).toArray());

  $: filteredHistory = $history ? $history.filter(item => {
      if (!historyFilter) return true;
      return item.projectName === historyFilter;
  }) : [];

  $: uniqueProjects = $history ? Array.from(new Set($history.map(h => h.projectName).filter(Boolean))) : [];

  // Magic Paste
  let showMagicPaste = false;
  let magicInput = '';

  function triggerToast(msg: string) {
    toastMessage = msg;
    showToast = true;
    setTimeout(() => showToast = false, 2000);
  }

  function handleMagicPaste() {
    if (!magicInput) return;
    try {
        // Basic heuristic: if it starts with <, treat as HTML, else treat as URL (mock)
        if (magicInput.trim().startsWith('<')) {
            const parsed = parseHtml(magicInput);
            tags = { ...tags, ...parsed } as MetaTags;
            // Auto-fill JSON-LD basics if empty
            if (!jsonLdData.name) jsonLdData.name = tags.title;
            if (!jsonLdData.description) jsonLdData.description = tags.description;
            if (!jsonLdData.url) jsonLdData.url = tags.url;
            showMagicPaste = false;
            triggerToast('Imported successfully!');
        } else {
             triggerToast("URL fetching requires a backend proxy. Please paste the HTML source code instead.");
        }
    } catch (e) {
        console.error(e);
        triggerToast("Failed to parse input.");
    }
  }

  // Actions
  async function saveToHistory() {
    try {
      // Limit check
      const count = await db.seoHistory.count();
      if (count >= 100) {
          const oldest = await db.seoHistory.orderBy('createdAt').limit(count - 99).keys();
          await db.seoHistory.bulkDelete(oldest);
      }

      await db.seoHistory.add({
        title: tags.title,
        description: tags.description,
        url: tags.url,
        ogImage: tags.ogImage,
        jsonLdType: jsonLdData.type,
        projectName: projectName,
        createdAt: new Date()
      });
      triggerToast(dict.actions.saved);
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  }

  function restoreHistory(item: SeoHistory) {
     tags = {
         ...defaultMetaTags,
         title: item.title,
         description: item.description,
         url: item.url,
         ogImage: item.ogImage || '',
         ogTitle: item.title, // infer
         ogDesc: item.description // infer
     };
     jsonLdData.type = item.jsonLdType || 'Website';
     if (item.projectName) projectName = item.projectName;
     activeTab = 'meta';
     triggerToast(dict.actions.restore);
  }

  async function deleteHistory(id: number | undefined) {
      if (id) await db.seoHistory.delete(id);
  }

  async function clearHistory() {
      await db.seoHistory.clear();
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    triggerToast(dict.actions.copied);
  }

  function downloadHtml() {
      const blob = new Blob([generatedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meta-tags.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast(dict.actions.export);
  }

  async function shareLink() {
      // Encode state to Base64
      const state = {
          t: tags,
          j: jsonLdData
      };
      const jsonStr = JSON.stringify(state);
      // Use proper unicode handling without deprecated escape/unescape
      const encoded = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        }));

      const url = new URL(window.location.href);
      url.searchParams.set('s', encoded);
      const shareUrl = url.toString();

      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'SEO Forge Project',
                  text: 'Check out my meta tags configuration on SEO Forge!',
                  url: shareUrl
              });
              triggerToast('Shared successfully!');
          } catch (err) {
              // Fallback if user cancels or fails
              console.log('Share canceled or failed', err);
              navigator.clipboard.writeText(shareUrl);
              triggerToast(dict.actions.share);
          }
      } else {
          navigator.clipboard.writeText(shareUrl);
          triggerToast(dict.actions.share);
      }
  }

  // Load from URL
  function loadFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      const encoded = urlParams.get('s');
      if (encoded) {
          try {
              // Decode Unicode
              const jsonStr = decodeURIComponent(Array.prototype.map.call(atob(encoded), function(c: string) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));

              const state = JSON.parse(jsonStr);
              if (state.t) tags = { ...defaultMetaTags, ...state.t };
              if (state.j) jsonLdData = state.j;
              // Clean URL
              window.history.replaceState({}, '', window.location.pathname);
              triggerToast(dict.actions.restore);
          } catch (e) {
              console.error('Failed to load shared state', e);
          }
      }
  }

  function handleFix(event: CustomEvent) {
      const { field, value } = event.detail;
      if (field === 'title') tags.title = value;
      if (field === 'description') tags.description = value;
  }

  function applyTemplate(key: string) {
      if (seoTemplates[key]) {
          tags = { ...tags, ...seoTemplates[key] };
          triggerToast(`Applied ${key} template`);
      }
  }

  // Shortcuts
  function handleKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          saveToHistory();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
          // If text is selected, let default copy happen
          if (window.getSelection()?.toString()) return;

          e.preventDefault();
          copyToClipboard(activeTab === 'jsonld' ? generatedJsonLd : generatedHtml);
      }
  }

  $: jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/seo-forge",
        "isAccessibleForFree": true,
        "name": "SEO Forge",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Web",
        "description": dict.description,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Real-time Social Previews",
          "JSON-LD Schema Generator",
          "Meta Tag Analysis",
          "Smart Templates"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `https://selfgrowingmicrotool.com/${$page.params.lang}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tools",
            "item": `https://selfgrowingmicrotool.com/${$page.params.lang}/tools`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": dict.title,
            "item": `https://selfgrowingmicrotool.com/${$page.params.lang}/tools/seo-forge`
          }
        ]
      }
    ]
  });

  $: faqJsonLd = JSON.stringify({
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
  });
</script>
<Head
  title={`${tags.title ? `${tags.title} | ` : ''}${dict.title}`}
  description={dict.description}
  keywords="seo, meta tags, open graph, json-ld, preview, social media, metadata, generator"
/>


<div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pb-20">

  <!-- Toast -->
  {#if showToast}
      <div transition:fade class="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg shadow-xl font-medium text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {toastMessage}
      </div>
  {/if}

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
          <div class="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto" role="tablist">
            <button
                role="tab"
                aria-selected={activeTab === 'meta'}
                class="px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap {activeTab === 'meta' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-500'} min-h-[44px] min-w-[44px]"
                on:click={() => activeTab = 'meta'}
            >
                {dict.tabs.meta}
            </button>
            <button
                role="tab"
                aria-selected={activeTab === 'social'}
                class="px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap {activeTab === 'social' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-500'} min-h-[44px] min-w-[44px]"
                on:click={() => activeTab = 'social'}
            >
                {dict.tabs.social}
            </button>
            <button
                role="tab"
                aria-selected={activeTab === 'jsonld'}
                class="px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap {activeTab === 'jsonld' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-500'} min-h-[44px] min-w-[44px]"
                on:click={() => activeTab = 'jsonld'}
            >
                {dict.tabs.jsonld}
            </button>
            <button
                role="tab"
                aria-selected={activeTab === 'history'}
                class="px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap {activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-500'} min-h-[44px] min-w-[44px]"
                on:click={() => activeTab = 'history'}
            >
                {dict.tabs.history}
            </button>
          </div>

          <!-- Content -->
          <div class="p-6">
             <!-- Toolbar -->
             <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
                 <!-- Templates Dropdown -->
                 <div class="relative group">
                     <button type="button" class="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 min-h-[44px] min-w-[44px]">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-template"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>
                         {dict.templates.title}
                     </button>
                     <div class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 hidden group-hover:block z-10">
                         <button on:click={() => applyTemplate('blog')} class="min-h-[44px] block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600">{dict.templates.blog}</button>
                         <button on:click={() => applyTemplate('product')} class="min-h-[44px] block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600">{dict.templates.product}</button>
                         <button on:click={() => applyTemplate('portfolio')} class="min-h-[44px] block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600">{dict.templates.portfolio}</button>
                         <button on:click={() => applyTemplate('landing')} class="min-h-[44px] block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600">{dict.templates.landing}</button>
                     </div>
                 </div>

                 <div class="flex gap-2">
                     <button
                        on:click={() => showMagicPaste = !showMagicPaste}
                        aria-label={dict.actions.magicPaste}
                        type="button"
                        class="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2 11 5"/></svg>
                        {dict.actions.magicPaste}
                     </button>
                     <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg px-2">
                         <input
                             type="text"
                             bind:value={projectName}
                             placeholder={dict.actions.projectPlaceholder}
                             class="bg-transparent border-none text-xs w-32 focus:ring-0 text-slate-700 dark:text-slate-200 min-h-[44px]"
                         />
                         <button
                            on:click={saveToHistory}
                            aria-label={dict.actions.save}
                            type="button"
                            class="px-4 py-2 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1 my-1 min-h-[44px] min-w-[44px]"
                            title="Ctrl+S"
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>
                            {dict.actions.save}
                         </button>
                     </div>
                 </div>
             </div>

             {#if showMagicPaste}
                <div class="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800" transition:slide>
                    <h3 class="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-2">Import from Source</h3>
                    <textarea
                        bind:value={magicInput}
                        placeholder="Paste raw HTML <head> content here..."
                        class="w-full h-32 p-3 text-xs font-mono bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                        aria-label="Raw HTML Input"
                    ></textarea>
                    <div class="flex justify-end gap-2">
                        <button on:click={() => showMagicPaste = false} class="min-h-[44px] min-w-[44px] px-3 py-1 text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                        <button on:click={handleMagicPaste} class="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 min-h-[44px] min-w-[44px]">Import</button>
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
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <h3 class="font-bold text-sm">Saved Projects</h3>
                            <div class="flex items-center gap-2">
                                {#if uniqueProjects.length > 0}
                                    <select
                                        bind:value={historyFilter}
                                        class="text-xs border rounded p-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-white"
                                        aria-label={dict.actions.projectFilter}
                                    >
                                        <option value="">All Projects</option>
                                        {#each uniqueProjects as proj}
                                            <option value={proj}>{proj}</option>
                                        {/each}
                                    </select>
                                {/if}
                                <button on:click={clearHistory} class="text-xs text-red-500 hover:text-red-600 underline min-h-[44px] min-w-[44px]">{dict.actions.clear}</button>
                            </div>
                        </div>

                         {#if $history}
                             {#if filteredHistory.length === 0}
                                <div class="text-center text-slate-500 py-12">No history found.</div>
                             {:else}
                                 {#each filteredHistory as item (item.id)}
                                     <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                                         <div class="overflow-hidden">
                                             <div class="font-medium text-sm truncate flex items-center gap-2">
                                                {item.title || 'Untitled'}
                                                {#if item.projectName}
                                                    <span class="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300">{item.projectName}</span>
                                                {/if}
                                             </div>
                                             <div class="text-xs text-slate-500 truncate">{item.url || 'No URL'}</div>
                                         </div>
                                         <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button aria-label={dict.actions.restore} on:click={() => restoreHistory(item)} class="min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded text-indigo-600" title={dict.actions.restore}>
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12"/><path d="M3 3v9h9"/></svg>
                                             </button>
                                             <button aria-label={dict.actions.delete} on:click={() => deleteHistory(item.id)} class="min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded text-red-500" title={dict.actions.delete}>
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
                <div class="flex items-center gap-4">
                    <span>Output Code</span>
                    <span class="text-xs font-normal text-slate-500 hidden sm:inline-block">
                        <span class="bg-slate-200 dark:bg-slate-700 rounded px-1.5 py-0.5 text-[10px] mr-1">Ctrl+S</span> Save
                        <span class="bg-slate-200 dark:bg-slate-700 rounded px-1.5 py-0.5 text-[10px] mx-1">Ctrl+C</span> Copy
                    </span>
                </div>
                <div class="flex gap-2">
                    <button
                        on:click={shareLink}
                        aria-label="Share Link"
                        type="button"
                        class="min-h-[44px] min-w-[44px] px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors min-h-[44px] min-w-[44px]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                        {dict.actions.share}
                    </button>
                    <button
                        on:click={downloadHtml}
                        aria-label="Download HTML"
                        type="button"
                        class="min-h-[44px] min-w-[44px] px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors min-h-[44px] min-w-[44px]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        {dict.actions.export}
                    </button>
                    <button
                      on:click={() => copyToClipboard(activeTab === 'jsonld' ? generatedJsonLd : generatedHtml)}
                      aria-label="Copy Code"
                      type="button"
                      class="min-h-[44px] px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                       {dict.actions.copyHtml}
                    </button>
                </div>
             </div>
             <div class="p-4 bg-slate-900 overflow-x-auto">
                 <pre class="text-xs font-mono text-white whitespace-pre-wrap">{@html highlightedCode}</pre>
             </div>
        </div>
      </div>

      <!-- Preview Column (Right) -->
      <div class="lg:col-span-5 space-y-6">
          <div class="sticky top-6">
             <!-- Audit Panel -->
             <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
                 <AuditPanel {tags} on:fix={handleFix} />
             </div>

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
   <div class="max-w-6xl mx-auto px-4 mt-24">
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

      <div class="max-w-4xl mx-auto mt-12">
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


  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
    <RelatedTools {lang} currentSlug="seo-forge" currentCategory="marketing" />
  </div>
</div>

<svelte:head>

  <!-- Twitter -->

  <!-- Canonical -->

  {@html '<script type="application/ld+json">' + faqJsonLd + '</script>'}

  {@html '<script type="application/ld+json">' + jsonLd + '</script>'}

</svelte:head>
