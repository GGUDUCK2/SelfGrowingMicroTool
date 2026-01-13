<script lang="ts">
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import QRConfig from '$lib/components/qr-forge/QRConfig.svelte';
  import QRPreview from '$lib/components/qr-forge/QRPreview.svelte';
  import QRHistory from '$lib/components/qr-forge/QRHistory.svelte';
  import type { QRState } from '$lib/utils/qr-forge/types';
  import { db } from '$lib/db/qr-forge';
  import { Save, History } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';

  $: lang = $page.params.lang || 'en';
  $: dictionary = getDictionary(lang);
  $: t = dictionary.tools.qrForge || {
      title: "QR Forge: Pro Code Generator",
      description: "The definitive tool to generate, analyze, and customize QR codes."
  };

  let state: QRState = {
    type: 'url',
    url: '',
    design: {
        colorDark: '#000000',
        colorLight: '#ffffff',
        errorCorrectionLevel: 'M',
        margin: 4,
        scale: 4,
        logoSize: 0.2,
        frame: 'none'
    },
    createdAt: Date.now()
  };

  let showHistory = false;
  let saveStatus = '';

  const saveToHistory = async () => {
      try {
          // Clone and remove ID to ensure new entry
          const { id, ...rest } = state;
          const entry = { ...rest, createdAt: Date.now() };
          await db.history.add(entry);
          saveStatus = t.feedback?.saved || 'Saved!';
          setTimeout(() => saveStatus = '', 2000);
      } catch (e) {
          console.error(e);
      }
  };

  const loadState = (s: QRState) => {
      // Deep copy to avoid binding issues with history object
      state = JSON.parse(JSON.stringify(s));
      // Ensure design defaults if missing in old history
      if (!state.design) {
          state.design = {
            colorDark: '#000000',
            colorLight: '#ffffff',
            errorCorrectionLevel: 'M',
            margin: 4,
            scale: 4
          };
      }
      // Ensure new props
      if (!state.design.logoSize) state.design.logoSize = 0.2;
      if (!state.design.frame) state.design.frame = 'none';

      showHistory = false;
  };

  const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          saveToHistory();
      }
  };

  onMount(() => {
      if (typeof window !== 'undefined') {
          window.addEventListener('keydown', handleKeydown);
      }
  });

  onDestroy(() => {
      if (typeof window !== 'undefined') {
          window.removeEventListener('keydown', handleKeydown);
      }
  });
</script>

<svelte:head>
  <title>{t.title} | MicroFactory</title>
  <meta name="description" content={t.description} />
  <meta name="keywords" content="qr code generator, wifi qr code, vcard qr code, crypto qr code, free qr generator, no expiry qr code" />
  <meta property="og:title" content={t.title} />
  <meta property="og:description" content={t.description} />
  <meta property="og:type" content="website" />
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "QR Forge",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": "Generate QR Codes for URL, WiFi, VCard, Crypto, Email, SMS. Add logos and custom frames.",
      "description": "Professional client-side QR code generator with customization and privacy focus."
    })}
  </script>
</svelte:head>

<div class="min-h-screen bg-slate-900 text-slate-50 pb-20">
  <!-- Hero -->
  <div class="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 border-b border-slate-800 pb-12 pt-12 px-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4 tracking-tight">
        {t.title}
      </h1>
      <p class="text-xl text-slate-400 max-w-2xl leading-relaxed">
        {t.description}
      </p>
    </div>
  </div>

  <div class="max-w-6xl mx-auto px-4 -mt-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Left: Config -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
             <div class="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <h2 class="font-semibold text-slate-200">Configuration</h2>
                <div class="flex space-x-2">
                    <button
                        on:click={saveToHistory}
                        class="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 rounded-lg text-sm transition-colors border border-indigo-500/30"
                        title="Save to History (Ctrl+S)"
                    >
                        <Save size={16} />
                        <span>{saveStatus || (t.save || 'Save')}</span>
                    </button>
                    <button
                        on:click={() => showHistory = !showHistory}
                        class="flex items-center space-x-1 px-3 py-1.5 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg text-sm transition-colors border border-slate-600"
                    >
                        <History size={16} />
                        <span>{t.history || 'History'}</span>
                    </button>
                </div>
             </div>

             {#if showHistory}
                <div transition:fade class="p-4 border-b border-slate-700 bg-slate-800/80">
                    <QRHistory {dictionary} onLoad={loadState} />
                </div>
             {/if}

             <div class="p-6">
                <QRConfig bind:state {dictionary} />
             </div>
        </div>

        <!-- Documentation / Guide -->
        <div class="prose prose-invert prose-slate max-w-none bg-slate-800/50 p-8 rounded-xl border border-slate-700/50">
            <h2>{t.guide?.title || 'Why QR Forge?'}</h2>
            <p>{t.guide?.intro || 'QR Forge is the definitive tool for generating high-quality, permanent QR codes directly in your browser.'}</p>

            <h3>{t.guide?.featuresTitle || 'Key Features'}</h3>
            <ul>
                <li><strong>{t.guide?.f1_title || 'Privacy First:'}</strong> {t.guide?.f1_desc || '100% Client-side generation. No data is ever sent to a server.'}</li>
                <li><strong>{t.guide?.f2_title || 'Universal Formats:'}</strong> {t.guide?.f2_desc || 'Support for WiFi, VCard 3.0, Crypto, and more.'}</li>
                <li><strong>{t.guide?.f3_title || 'Pro Customization:'}</strong> {t.guide?.f3_desc || 'Control error correction levels, margins, and colors.'}</li>
            </ul>

            <h3>{t.guide?.tipsTitle || 'Pro Tips'}</h3>
            <ul>
                <li>{t.guide?.tip1 || 'Use "High" error correction if you plan to add a logo or print on damaged surfaces.'}</li>
                <li>{t.guide?.tip2 || 'WiFi QR codes work natively on iOS and Android. Just scan to join.'}</li>
                <li>{t.guide?.tip3 || 'Always test your QR code with a phone camera before printing.'}</li>
            </ul>

            <hr class="border-slate-700 my-8"/>

            <h3>{t.faqTitle || 'Frequently Asked Questions'}</h3>

            <div class="space-y-4">
                <div>
                    <h4 class="font-bold text-slate-200">{t.q1 || 'Do these QR codes expire?'}</h4>
                    <p class="text-slate-400">{t.a1 || 'No. The QR codes generated here contain the data directly (Static QR Code). They do not rely on any redirect service, so they will work forever.'}</p>
                </div>
                <div>
                    <h4 class="font-bold text-slate-200">{t.q2 || 'Is it safe for WiFi passwords?'}</h4>
                    <p class="text-slate-400">{t.a2 || 'Yes. The generation happens locally on your device. Your WiFi password is never transmitted over the internet.'}</p>
                </div>
                 <div>
                    <h4 class="font-bold text-slate-200">{t.q3 || 'What is Error Correction?'}</h4>
                    <p class="text-slate-400">{t.a3 || 'Error correction allows the QR code to be readable even if part of it is damaged or covered. Level H allows up to 30% damage recovery, but makes the code denser.'}</p>
                </div>
            </div>
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="lg:col-span-1">
         <QRPreview {state} {dictionary} />

         <div class="mt-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-sm text-slate-400">
            <h4 class="font-semibold text-slate-300 mb-2">Technical Specs</h4>
            <ul class="space-y-2">
                <li class="flex justify-between">
                    <span>Library</span>
                    <span class="text-slate-200 font-mono">node-qrcode</span>
                </li>
                 <li class="flex justify-between">
                    <span>Render</span>
                    <span class="text-slate-200 font-mono">HTML5 Canvas</span>
                </li>
                 <li class="flex justify-between">
                    <span>Formats</span>
                    <span class="text-slate-200 font-mono">PNG, SVG</span>
                </li>
                 <li class="flex justify-between">
                    <span>Max Version</span>
                    <span class="text-slate-200 font-mono">40 (auto)</span>
                </li>
            </ul>
         </div>
      </div>
    </div>
  </div>
</div>
