<script lang="ts">
    import { page } from '$app/stores';
    import { dictionaries } from '$lib/dictionaries';
    import Head from '$lib/components/Head.svelte';
    import GuideSection from '$lib/components/GuideSection.svelte';
    import FAQSection from '$lib/components/FAQSection.svelte';
    import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import { fade, fly } from 'svelte/transition';
    import { db, type VCardForgeHistory } from '$lib/db';

    import VCardEditor from '$lib/components/vcard-forge/VCardEditor.svelte';
    import VCardPreview from '$lib/components/vcard-forge/VCardPreview.svelte';
    import VCardHistory from '$lib/components/vcard-forge/VCardHistory.svelte';

    $: lang = $page.params.lang as 'en' | 'ko';
    $: dict = (dictionaries as any)[lang]?.tools?.vcardForge || {};

    let currentData = {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      photoData: '',
      linkedIn: '',
      twitter: '',
      github: ''
    };

    let showHistory = false;

    $: faqItems = dict ? [
      { q: (dict as any)?.q1, a: (dict as any)?.a1 },
      { q: (dict as any)?.q2, a: (dict as any)?.a2 },
      { q: (dict as any)?.q3, a: (dict as any)?.a3 }
    ] : [];

    $: jsonLd = dict ? {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "@id": $page.url.origin + "/" + lang + "/tools/vcard-forge",
          "name": "vCard Forge",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web, iOS, Android, macOS, Windows, Linux",
          "applicationSubCategory": "Contact Management Utility",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "description": (dict as any)?.description,
          "featureList": [
              "vCard 3.0 Generation",
              "QR Code Integration",
              "Live Preview",
              "Base64 Photo Support",
              "Local History"
          ],
          "isAccessibleForFree": true,
          "author": {
              "@type": "Organization",
              "name": "MicroFactory"
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${$page.url.origin}/${lang}`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Tools",
              "item": `${$page.url.origin}/${lang}#tools`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": (dict as any)?.title || 'vCard Forge',
              "item": `${$page.url.origin}/${lang}/tools/vcard-forge`
            }
          ]
        }
      ]
    } : null;

    const canonicalUrl = `${$page.url.origin}/${$page.params.lang}/tools/vcard-forge`;

    function handleDataChange(event: CustomEvent<typeof currentData>) {
      currentData = event.detail;
    }

    async function saveCurrentVCard() {
      if (!currentData.name) return; // Prevent empty saves

      // Simple debounce/deduplication based on name and exact match
      const existing = await db.vcardForgeHistory
          .where('name')
          .equals(currentData.name)
          .reverse()
          .first();

      // Basic heuristic to avoid spamming saves if data hasn't changed much
      if (existing && existing.title === currentData.title && existing.company === currentData.company && existing.email === currentData.email) {
          // You might choose to update instead, but let's just skip duplicate creation
          return;
      }

      await db.vcardForgeHistory.add({
          name: currentData.name,
          title: currentData.title,
          company: currentData.company,
          email: currentData.email,
          phone: currentData.phone,
          website: currentData.website,
          address: currentData.address,
          photoData: currentData.photoData,
          vcardData: '', // This could be stored if we wanted, but it's generated dynamically
          createdAt: new Date().toISOString(),
          starred: 0
      });
    }

    function handleLoad(event: CustomEvent<VCardForgeHistory>) {
      const item = event.detail;
      currentData = {
          name: item.name || '',
          title: item.title || '',
          company: item.company || '',
          email: item.email || '',
          phone: item.phone || '',
          website: item.website || '',
          address: item.address || '',
          photoData: item.photoData || '',
          linkedIn: '', // Assuming these weren't added to history schema previously, fallback to empty
          twitter: '',
          github: ''
      };
      showHistory = false;
    }

    // Keyboard shortcuts
    function handleGlobalKeydown(e: KeyboardEvent) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveCurrentVCard();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            showHistory = !showHistory;
        }
    }
  </script>

  <Head
    title={(dict as any)?.title || 'vCard Forge'}
    description={(dict as any)?.description || 'Create vCards'}
    url={canonicalUrl}
    keywords="vcard generator, qr code contact, digital business card, vcf creator"
  />

  <svelte:window on:keydown={handleGlobalKeydown} />

  <svelte:head>
    <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/vcard-forge"} />
    <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/vcard-forge"} />
    <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/vcard-forge"} />
    <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/vcard-forge"} />
    {#if jsonLd}
      {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(jsonLd)}</scr` + `ipt>`}
    {/if}
  </svelte:head>

  <div class="space-y-8 relative max-w-7xl mx-auto">
    <!-- Header & Tools -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 gap-4">
       <div class="flex items-center gap-3">
           <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
           </div>
           <div>
               <h1 class="text-xl font-bold text-slate-800 dark:text-white">
                   {dict?.title?.split(':')[0] || 'vCard Forge'}
               </h1>
               <p class="text-sm text-slate-500 hidden sm:block truncate max-w-md">
                   {dict?.description}
               </p>
           </div>
       </div>
       <div class="flex gap-2 w-full sm:w-auto">
           <button
                on:click={saveCurrentVCard}
                disabled={!currentData.name}
                class="flex-1 sm:flex-none px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                aria-label="Save vCard"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span class="hidden sm:inline">Save</span>
             </button>
           <button
              on:click={() => showHistory = !showHistory}
              class="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
              aria-label="Toggle History"
           >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="hidden sm:inline">{dict?.history || 'History'}</span>
           </button>
       </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Main Left Column -->
      <div class="lg:col-span-8 space-y-6">
          <VCardEditor {dict} data={currentData} on:change={handleDataChange} />
      </div>

      <!-- Sidebar Right Column -->
      <div class="lg:col-span-4 space-y-6 h-auto lg:h-[calc(100vh-200px)] lg:sticky lg:top-24">
          <VCardPreview {dict} data={currentData} />
      </div>
    </div>

    <!-- Documentation Section -->
    <section class="mt-20">
      <GuideSection
        title={dict?.guide?.title}
        intro={dict?.guide?.intro}
        featuresTitle={dict?.guide?.featuresTitle}
        f1={dict?.guide?.f1}
        f2={dict?.guide?.f2}
        f3={dict?.guide?.f3}
        tipsTitle={dict?.guide?.tipsTitle}
        tip1={dict?.guide?.tip1}
        tip2={dict?.guide?.tip2}
        tip3={dict?.guide?.tip3}
      />
      <div class="mt-12 max-w-4xl mx-auto">
          <AdPlaceholder />
          <FAQSection title={dict?.faqTitle} items={faqItems} />
      </div>
    </section>

    <!-- History Sidebar -->
    {#if showHistory}
      <button
        transition:fade={{ duration: 200 }}
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 w-full h-full cursor-default min-h-[44px]"
        on:click={() => showHistory = false}
        on:keydown={(e) => e.key === 'Escape' && (showHistory = false)}
        aria-label="Close History Overlay"
      ></button>
      <div transition:fly={{ x: 400, duration: 300 }} class="z-50 fixed right-0 top-0 bottom-0 shadow-2xl">
          <VCardHistory {dict} on:close={() => showHistory = false} on:load={handleLoad} />
      </div>
    {/if}
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="vcard-forge" currentCategory="productivity" />
  </div>
