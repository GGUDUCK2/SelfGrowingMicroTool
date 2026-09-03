<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { dictionaries } from '$lib/dictionaries';
    import Head from '$lib/components/Head.svelte';
    import GuideSection from '$lib/components/GuideSection.svelte';
    import FAQSection from '$lib/components/FAQSection.svelte';
    import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import { fade, fly } from 'svelte/transition';
    import { saveToHistory } from '$lib/db/workspace';

    import VCardEditor from '$lib/components/vcard-forge/VCardEditor.svelte';
    import VCardPreview from '$lib/components/vcard-forge/VCardPreview.svelte';
    import VCardHistory from '$lib/components/vcard-forge/VCardHistory.svelte';

    $: lang = $page.params.lang as 'en' | 'ko';

    $: dict = (dictionaries as unknown as Record<string, Record<string, Record<string, string>>>)[lang]?.tools?.vcardForge || {};

    const initialData: VCardForgeData = {
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
      github: '',
      qrFgColor: '#0f172a',
      qrBgColor: '#ffffff',
      format: '3.0'
    };

    interface VCardForgeData {
      [key: string]: string;
      name: string;
      title: string;
      company: string;
      email: string;
      phone: string;
      website: string;
      address: string;
      photoData: string;
      linkedIn: string;
      twitter: string;
      github: string;
      qrFgColor: string;
      qrBgColor: string;
      format: string;
    }

    let currentData: VCardForgeData = { ...initialData };

    let showHistory = false;

        $: faqItems = dict ? [
      { q: dict?.q1, a: dict?.a1 },
      { q: dict?.q2, a: dict?.a2 },
      { q: dict?.q3, a: dict?.a3 }
    ] : [];

        $: jsonLd = dict ? {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "name": "vCard Forge",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web, iOS, Android, macOS, Windows, Linux",
          "applicationSubCategory": "Contact Management Utility",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "@id": $page.url.origin + "/" + lang + "/tools/vcard-forge",
          "description": dict?.description,
          "featureList": [
              "vCard 3.0 & 4.0 Generation",
              "QR Code Integration",
              "Smart Signature Auto-Extractor",
              "Raw VCF Viewer",
              "Custom QR Colors",
              "Live Preview",
              "Base64 Photo Support",
              "Local History",
              "Actionable Profile Next Steps",
              "1-Click Visual Themes"
          ],
          "isAccessibleForFree": true,
          "author": {
              "@type": "Organization",
              "name": "MicroFactory"
          }
        }
      ]
    } : null;


    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to generate a vCard",
      "description": "Step-by-step guide to generating a professional vCard with a QR code.",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Enter Details",
          "text": "Fill out the contact details in the editor form, including name, email, and phone number."
        },
        {
          "@type": "HowToStep",
          "name": "Preview and Style",
          "text": "Review the generated business card in the preview panel and customize the QR code colors."
        },
        {
          "@type": "HowToStep",
          "name": "Export",
          "text": "Download the .vcf file, save the QR code as PNG or SVG, or copy the vCard data to your clipboard."
        }
      ]
    };

    const canonicalUrl = `${$page.url.origin}/${$page.params.lang}/tools/vcard-forge`;

    let saveTimeout: ReturnType<typeof setTimeout>;

    function handleDataChange(event: CustomEvent<VCardForgeData>) {
      currentData = event.detail;
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
          if (currentData.name) saveCurrentVCard();
      }, 1500);
    }

    async function saveCurrentVCard() {
      if (!currentData.name) return;
      await saveToHistory('vcard-forge', currentData, null);
    }


    function handleLoad(event: CustomEvent<{ input: VCardForgeData }>) {
      const item = event.detail.input;
      currentData = {
          name: item.name || '',
          title: item.title || '',
          company: item.company || '',
          email: item.email || '',
          phone: item.phone || '',
          website: item.website || '',
          address: item.address || '',
          photoData: item.photoData || '',
          linkedIn: item.linkedIn || '',
          twitter: item.twitter || '',
          github: item.github || '',
          qrFgColor: item.qrFgColor || '#0f172a',
          qrBgColor: item.qrBgColor || '#ffffff',
          format: item.format || '3.0'
      };
      showHistory = false;
    }

    function handleClearForm() {
      currentData = { ...initialData };
    }

    const smartExamples = [
        {
            name: 'Alex Developer',
            title: 'Senior SvelteKit Engineer',
            company: 'MicroFactory Inc.',
            email: 'alex@example.com',
            phone: '+1 555-0198',
            website: 'https://microfactory.io',
            address: '123 Innovation Way\nSilicon Valley, CA',
            photoData: '',
            linkedIn: 'https://linkedin.com/in/alexdev',
            twitter: 'https://twitter.com/alexdev',
            github: 'https://github.com/alexdev',
            qrFgColor: '#4f46e5',
            qrBgColor: '#e0e7ff',
            format: '3.0'
        },
        {
            name: 'Sarah Designer',
            title: 'UX/UI Lead',
            company: 'Creative Studio',
            email: 'sarah@design.co',
            phone: '+44 20 7123 4567',
            website: 'https://design.co',
            address: '45 Creative Lane\nLondon, UK',
            photoData: '',
            linkedIn: 'https://linkedin.com/in/sarahdesign',
            twitter: '',
            github: '',
            qrFgColor: '#db2777',
            qrBgColor: '#fce7f3',
            format: '3.0'
        },
        {
            name: 'Michael Founder',
            title: 'CEO',
            company: 'StartupX',
            email: 'michael@startupx.com',
            phone: '+1 415-555-0000',
            website: 'https://startupx.com',
            address: '99 Startup Blvd\nSan Francisco, CA',
            photoData: '',
            linkedIn: 'https://linkedin.com/in/michaelfounder',
            twitter: 'https://twitter.com/startupx',
            github: '',
            qrFgColor: '#0f172a',
            qrBgColor: '#f8fafc',
            format: '3.0'
        }
    ];


    onMount(() => {
        const dataParam = $page.url.searchParams.get('data');
        if (dataParam) {
            try {
                const decoded = JSON.parse(decodeURIComponent(atob(dataParam)));
                currentData = { ...initialData, ...decoded };
            } catch (e) {
                console.error('Failed to parse vCard data from URL', e);
            }
        }
    });

    function loadExample(index = 0) {
      currentData = { ...smartExamples[index] };
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => saveCurrentVCard(), 500);
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
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            handleClearForm();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            loadExample();
        }
    }
  </script>

  <Head
    title={dict?.title || 'vCard Forge'}
    description={dict?.description || 'Create vCards'}
    url={canonicalUrl}
    keywords="vcard generator, qr code contact, digital business card, vcf creator"
  />

  <svelte:window on:keydown={handleGlobalKeydown} />

  <svelte:head>

    <meta property="og:title" content={dict?.title || 'vCard Forge'} />
    <meta property="og:description" content={dict?.description || 'Create vCards'} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={dict?.title || 'vCard Forge'} />
    <meta name="twitter:description" content={dict?.description || 'Create vCards'} />

    <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/vcard-forge"} />
    <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/vcard-forge"} />
    <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/vcard-forge"} />
    <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/vcard-forge"} />
    {#if jsonLd}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</scr` + `ipt>`}
    {/if}
  {#if howToSchema}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(howToSchema).replace(/</g, '\\u003c')}</scr` + `ipt>`}
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
       <div class="flex flex-wrap gap-2 w-full sm:w-auto">
           <div class="relative group flex-1 sm:flex-none">
             <button class="w-full px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation min-h-[44px] min-w-[44px]"
                aria-label="Load Smart Example"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span class="hidden lg:inline">{dict?.example || 'Smart Example'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
             </button>
             <div class="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button on:click={() => loadExample(0)} class="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 min-h-[44px] min-w-[44px]">1. Tech Executive</button>
                <button on:click={() => loadExample(1)} class="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 min-h-[44px] min-w-[44px]">2. Creative Designer</button>
                <button on:click={() => loadExample(2)} class="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 min-h-[44px] min-w-[44px]">3. Startup Founder</button>
             </div>
           </div>
           <button on:click={saveCurrentVCard}
                disabled={!currentData.name}
                class="flex-1 sm:flex-none px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px] min-w-[44px]"
                aria-label="Save vCard"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span class="hidden sm:inline">Save</span>
             </button>
           <button on:click={() => showHistory = !showHistory}
              class="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation min-h-[44px] min-w-[44px]"
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
          <VCardEditor {dict} data={currentData} on:change={handleDataChange} on:clear={handleClearForm} />
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
      <div class="mt-12 max-w-7xl mx-auto">
          <AdPlaceholder />
          <FAQSection title={dict?.faqTitle} items={faqItems} />
      </div>
    </section>

    <!-- History Sidebar -->
    {#if showHistory}
      <button transition:fade={{ duration: 200 }}
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 w-full h-full cursor-default min-h-[44px] min-w-[44px]"
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
