<script lang="ts">
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import UploadZone from '$lib/components/icon-forge/UploadZone.svelte';
  import PreviewGallery from '$lib/components/icon-forge/PreviewGallery.svelte';
  import ConfigEditor from '$lib/components/icon-forge/ConfigEditor.svelte';
  import ExportManager from '$lib/components/icon-forge/ExportManager.svelte';
  import SnippetPanel from '$lib/components/icon-forge/SnippetPanel.svelte';
  import HistoryPanel from '$lib/components/icon-forge/HistoryPanel.svelte';
  import type { IconConfig } from '$lib/utils/icon-forge/processor';
  import { db, type IconForgeProject } from '$lib/db';
  import { Save, Check } from 'lucide-svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  // Dynamic dictionary loading
  $: dict = getDictionary($page.params.lang);
  $: t = dict.tools.iconForge;

  $: faqItems = [
    { q: t?.q1, a: t?.a1 },
    { q: t?.q2, a: t?.a2 },
    { q: t?.q3, a: t?.a3 }
  ];

  $: breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://selfgrowingmicrotool.com/${$page.params.lang || 'en'}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": `https://selfgrowingmicrotool.com/${$page.params.lang || 'en'}/tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Icon Forge",
        "item": $page.url.href
      }
    ]
  };

  let file: File | null = null;
  let config: IconConfig = {
    background: '#ffffff',
    padding: 0,
    radius: 0,
    transparent: true
  };
  let isSaving = false;
  let justSaved = false;

  function handleUpload(event: CustomEvent<File>) {
    file = event.detail;
  }

  function handleConfigChange(event: CustomEvent<IconConfig>) {
    config = event.detail;
  }

  async function saveProject() {
    if (!file) return;
    isSaving = true;
    try {
      await db.iconForgeProjects.add({
        name: file.name,
        config: { ...config },
        blob: file,
        createdAt: new Date(),
        starred: 0
      });
      justSaved = true;
      setTimeout(() => justSaved = false, 2000);
    } catch (e) {
      console.error('Failed to save', e);
    } finally {
      isSaving = false;
    }
  }

  function handleRestore(event: CustomEvent<IconForgeProject>) {
    const project = event.detail;
    if (project.blob && project.config) {
      file = project.blob as File; // Cast blob to File (Dexie stores it as Blob/File)
      config = project.config;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (file) {
        saveProject();
      }
    }
  }

  function parseFeature(text: string) {
    if (!text) return { title: '', desc: '' };
    if (text.includes(':')) {
      const parts = text.split(':');
      return {
        title: parts[0].replace(/\*\*/g, '').trim(),
        desc: parts.slice(1).join(':').replace(/\*\*/g, '').trim()
      };
    }
    return { title: text.replace(/\*\*/g, ''), desc: '' };
  }
</script>
<Head
  title={`${t.title} - ${t.category || 'Design'}`}
  description={t.description}
  keywords="favicon generator, pwa icon, maskable icon, app icon generator, ios icon generator, android icon generator, svg to ico"
/>


<svelte:window on:keydown={handleKeydown} />

<svelte:head>

  <!-- Twitter -->


  {@html `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/${lang}/tools/icon-forge",
        "isAccessibleForFree": true,
      "name": "Icon Forge",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "${t.description}",
      "featureList": [
        "Generate ICO, PNG, and SVG favicons",
        "Create PWA Manifest JSON",
        "Real-time preview for iOS, Android, and Windows",
        "Smart Maskable Icon Safe Zone Visualization",
        "Magic Palette Color Extraction",
        "Client-side processing (Privacy First)"
      ]
    }
  </script>`}
  {@html '<script type="application/ld+json">' + JSON.stringify(breadcrumb) + '</script>'}

  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "${dict?.q1}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict?.a1}"
        }
      },
      {
        "@type": "Question",
        "name": "${dict?.q2}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict?.a2}"
        }
      },
      {
        "@type": "Question",
        "name": "${dict?.q3}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dict?.a3}"
        }
      }
    ]
  }
  </script>`}

</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" in:fade={{ duration: 300 }}>
  <div class="text-center mb-12">
    <div class="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-xl mb-4 shrink-0">
      <svg class="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
    </div>
    <h1 class="text-3xl font-bold text-slate-50 sm:text-4xl mb-4">{t.title}</h1>
    <p class="text-lg text-slate-400 max-w-2xl mx-auto">{t.description}</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <!-- Main Workspace -->
    <div class="lg:col-span-8 space-y-8">

        <!-- Upload -->
        {#if !file}
            <UploadZone {t} on:upload={handleUpload} />
        {:else}
            <!-- Toolbar -->
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-slate-200">Preview</h3>
                <button
                    class="text-sm text-slate-400 hover:text-indigo-400 transition-colors min-h-[44px] min-w-[44px]"
                    on:click={() => file = null}
                >
                    {t.upload.reupload}
                </button>
            </div>

            <!-- Preview Gallery -->
            <PreviewGallery {file} {config} {t} />
        {/if}

        <!-- Documentation -->
        <div class="prose prose-invert max-w-none mt-16 pt-16 border-t border-slate-700/50">
            <h2 class="text-2xl font-bold text-slate-50 mb-6">{t.guide.title}</h2>
            <p class="text-slate-400 leading-relaxed mb-8">{t.guide.intro}</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {#each [t.guide.f1, t.guide.f2, t.guide.f3] as f}
                {@const feature = parseFeature(f)}
                <div class="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
                  <p class="text-sm text-slate-400">
                      <span class="block text-lg font-semibold text-slate-200 mb-2">
                          {feature.title}
                      </span>
                      {feature.desc}
                  </p>
                </div>
              {/each}
            </div>

            <h3 class="text-xl font-bold text-slate-50 mb-4">{t.guide.tipsTitle}</h3>
            <ul class="space-y-3 mb-12 list-disc list-inside text-slate-400">
               <li>{@html t.guide.tip1}</li>
               <li>{@html t.guide.tip2}</li>
               <li>{@html t.guide.tip3}</li>
            </ul>

            <FAQSection title={t.faqTitle} items={faqItems} />
        </div>
    </div>

    <!-- Sidebar -->
    <div class="lg:col-span-4 space-y-6 sticky top-8 self-start">
        {#if file}
            <div class="space-y-6">
                <!-- Config -->
                <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 shadow-lg">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-medium text-slate-50 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                            {t.config.title}
                        </h3>
                        <button
                            class="p-2 rounded-lg transition-colors {justSaved ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400'} min-h-[44px] min-w-[44px]"
                            title={t.history.save}
                            on:click={saveProject}
                            disabled={isSaving}
                        >
                            {#if justSaved}
                                <Check class="w-4 h-4" />
                            {:else}
                                <Save class="w-4 h-4" />
                            {/if}
                        </button>
                    </div>
                    <ConfigEditor bind:config {file} {t} on:change={handleConfigChange} />
                </div>

                <!-- Export -->
                <ExportManager {file} {config} {t} />

                <!-- Snippets -->
                <SnippetPanel {file} {config} {t} />
            </div>
        {/if}

        <!-- History -->
        <HistoryPanel {t} on:restore={handleRestore} />
    </div>
  </div>


  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
    <RelatedTools {lang} currentSlug="icon-forge" currentCategory="design" />
  </div>
</div>
