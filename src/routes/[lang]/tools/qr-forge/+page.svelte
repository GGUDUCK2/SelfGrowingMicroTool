<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import QRConfig from '$lib/components/qr-forge/QRConfig.svelte';
  import QRPreview from '$lib/components/qr-forge/QRPreview.svelte';
  import QRHistory from '$lib/components/qr-forge/QRHistory.svelte';
  import type { QRState } from '$lib/utils/qr-forge/types';
  import { db } from '$lib/db/qr-forge';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { Save, History } from '@lucide/svelte';
  import { fade } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';

  $: lang = $page.params.lang || 'en';
  $: dictionary = getDictionary(lang);
  $: t = dictionary.tools.qrForge || {
      title: "QR Forge: Pro Code Generator",
      description: "The definitive tool to generate, analyze, and customize QR codes."
  };

  $: faqItems = [
    { q: t.q1 || 'Do these QR codes expire?', a: t.a1 || 'No. The QR codes generated here contain the data directly (Static QR Code). They do not rely on any redirect service, so they will work forever.' },
    { q: t.q2 || 'Is it safe for WiFi passwords?', a: t.a2 || 'Yes. The generation happens locally on your device. Your WiFi password is never transmitted over the internet.' },
    { q: t.q3 || 'What is Error Correction?', a: t.a3 || 'Error correction allows the QR code to be readable even if part of it is damaged or covered. Level H allows up to 30% damage recovery, but makes the code denser.' }
  ];

  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/qr-forge",
        "isAccessibleForFree": true,
    "name": "QR Forge",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "url": $page.url.href,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": "Generate QR Codes for URL, WiFi, VCard, Crypto, Email, SMS. Add logos and custom frames.",
    "description": "Professional client-side QR code generator with customization and privacy focus."
  };

  $: breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://selfgrowingmicrotool.com/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": `https://selfgrowingmicrotool.com/${lang}/tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "QR Forge",
        "item": $page.url.href
      }
    ]
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
<Head
  title={t.title}
  description={t.description}
  url={"https://selfgrowingmicrotool.com/" + lang + "/tools/qr-forge"}
  image="https://selfgrowingmicrotool.com/og/default.png"
  keywords="qr code generator, wifi qr code, vcard qr code, crypto qr code, free qr generator, no expiry qr code"
/>

<svelte:head>
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</scr` + `ipt>`}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</scr` + `ipt>`}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":t?.q1||"","acceptedAnswer":{"@type":"Answer","text":t?.a1||""}},{"@type":"Question","name":t?.q2||"","acceptedAnswer":{"@type":"Answer","text":t?.a2||""}},{"@type":"Question","name":t?.q3||"","acceptedAnswer":{"@type":"Answer","text":t?.a3||""}}]})}</scr` + `ipt>`}
</svelte:head>

<div class="min-h-screen bg-slate-900 text-slate-50 pb-20">
  <!-- Hero -->
  <div class="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 border-b border-slate-800 pb-12 pt-12 px-4">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4 tracking-tight">
        {t.title}
      </h1>
      <p class="text-xl text-slate-400 max-w-2xl leading-relaxed">
        {t.description}
      </p>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

      <!-- Left: Config -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
             <div class="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800/50">
                <h2 class="font-semibold text-slate-200">Configuration</h2>
                <div class="flex space-x-2 w-full sm:w-auto">
                    <button
                        on:click={saveToHistory}
                        class="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-4 py-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 rounded-lg text-sm transition-colors border border-indigo-500/30 min-h-[44px] min-w-[44px]"
                        title="Save to History (Ctrl+S)"
                    >
                        <Save size={16} />
                        <span>{saveStatus || (t.save || 'Save')}</span>
                    </button>
                    <button
                        on:click={() => showHistory = !showHistory}
                        class="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg text-sm transition-colors border border-slate-600 min-h-[44px]"
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
            <h2>{t.guide?.title || 'Why QR Forge? The Definitive Guide to Professional QR Code Generation'}</h2>
            <p>{t.guide?.intro || 'QR Forge is the ultimate, professional-grade tool engineered for generating high-quality, permanent QR codes directly within your browser. In an era where digital connectivity is paramount, having a reliable, secure, and privacy-focused QR code generator is essential for businesses, marketers, and individuals alike. Unlike many online tools that track your data or redirect your links through third-party servers, QR Forge operates entirely on the client side. This means your data never leaves your device, ensuring absolute privacy and security. Furthermore, the QR codes generated here are static and permanent. They do not expire, they do not require a subscription, and they will continue to work flawlessly for as long as the underlying data remains valid.'}</p>

            <h3>{t.guide?.featuresTitle || 'Deep Functionality & Core Features'}</h3>
            <p>{t.guide?.featuresDesc || 'Our tool is built upon a robust architecture designed to handle a multitude of use cases with precision and speed.'}</p>
            <ul>
                <li><strong>{t.guide?.f1_title || 'Uncompromising Privacy (Client-Side Generation):'}</strong> {t.guide?.f1_desc || 'Security is our top priority. Every single QR code is generated locally in your web browser utilizing advanced WebAssembly and HTML5 Canvas technologies. At no point is your sensitive information—be it a WiFi password, a cryptocurrency address, or personal contact details—transmitted to our servers. This zero-trust model guarantees that your data remains yours alone.'}</li>
                <li><strong>{t.guide?.f2_title || 'Universal Data Formats:'}</strong> {t.guide?.f2_desc || 'QR Forge goes far beyond simple URLs. We support a comprehensive suite of data formats designed for modern needs. Generate VCard 3.0 codes for seamless contact sharing, WiFi network codes that allow instant connection without typing complex passwords, standardized cryptocurrency payment requests (Bitcoin, Ethereum, etc.), and pre-formatted Email or SMS templates.'}</li>
                <li><strong>{t.guide?.f3_title || 'Professional-Grade Customization:'}</strong> {t.guide?.f3_desc || 'A QR code should not just be functional; it should be visually integrated into your brand. Control the exact hexadecimal values of the foreground and background colors. Adjust the margin (quiet zone) to ensure scannability in dense layouts. Most importantly, control the Error Correction Level (L, M, Q, H) to determine how much damage the code can sustain while remaining readable—crucial for printing on textured surfaces or embedding logos.'}</li>
                <li><strong>{t.guide?.f4_title || 'High-Resolution Export & SVGs:'}</strong> {t.guide?.f4_desc || 'Download your generated QR codes in crisp, high-resolution PNG format for general web and print use, or export them as infinitely scalable Vector Graphics (SVG). SVGs are perfect for professional design workflows in Adobe Illustrator or Figma, ensuring your QR codes look razor-sharp on everything from business cards to massive billboards.'}</li>
                <li><strong>{t.guide?.f5_title || 'Bulk Generation (Matrix Mode):'}</strong> {t.guide?.f5_desc || 'Need to generate hundreds of unique QR codes for an event, inventory management, or a marketing campaign? Our Bulk Generation tool allows you to paste a list of URLs or text strings and instantly render a grid of QR codes, drastically reducing manual workload and improving operational efficiency.'}</li>
            </ul>

            <h3>{t.guide?.archTitle || 'The Architecture of Scannability'}</h3>
            <p>{t.guide?.archDesc || 'Understanding how QR codes work can help you deploy them more effectively. A Quick Response (QR) code is a two-dimensional matrix barcode capable of storing significantly more data than a standard UPC barcode. The data is encoded using specific patterns of squares (modules). Key architectural components include:'}</p>
            <ul>
                <li><strong>Finder Patterns:</strong> The three large squares in the corners allow scanners to detect the orientation and boundaries of the code instantly.</li>
                <li><strong>Alignment Patterns:</strong> Smaller squares found in larger QR codes that help the scanner compensate for distortion when scanned at an angle or on a curved surface.</li>
                <li><strong>Timing Patterns:</strong> Alternating black and white modules connecting the finder patterns, defining the coordinate system of the grid.</li>
                <li><strong>Quiet Zone:</strong> The essential blank margin surrounding the code. Without a sufficient quiet zone (minimum 4 modules), scanners may fail to distinguish the code from its surroundings.</li>
            </ul>

            <h3>{t.guide?.tipsTitle || 'Advanced Pro Tips for Maximum Reliability'}</h3>
            <p>{t.guide?.tipsDesc || 'To ensure your QR codes scan instantly for 100% of your users, follow these professional guidelines:'}</p>
            <ul>
                <li>{t.guide?.tip1 || '<strong>Mastering Error Correction:</strong> Error correction uses the Reed-Solomon algorithm to add redundancy. Level L (Low) allows ~7% data recovery and creates the simplest, cleanest looking code. Level H (High) allows up to 30% recovery, making the code much denser. Always use Level H if you are placing a logo in the center of the code, or if the code will be printed on a surface that might get scratched or dirty (like a shipping label or outdoor poster).'}</li>
                <li>{t.guide?.tip2 || '<strong>The Contrast Rule:</strong> Never invert the colors (e.g., white code on a black background) unless absolutely necessary, as older barcode scanners and some budget smartphone cameras cannot read inverted codes. Ensure a high contrast ratio between the foreground (dark) and background (light) colors. Avoid using pale colors for the data modules.'}</li>
                <li>{t.guide?.tip3 || '<strong>Sizing Matters:</strong> The minimum recommended scanning distance is typically 10 times the width of the QR code. For a code printed on a business card (e.g., 1 inch / 2.5 cm wide), the optimal scanning distance is roughly 10 inches. If you are printing a code on a billboard meant to be scanned from 30 feet away, the code needs to be at least 3 feet wide.'}</li>
                <li>{t.guide?.tip4 || '<strong>Test Exhaustively:</strong> Before committing a QR code to a large print run, always test it using multiple devices (iOS native camera, Android Google Lens, and dedicated scanning apps) under various lighting conditions. Print a test copy at the exact final size to verify scannability.'}</li>
                <li>{t.guide?.tip5 || '<strong>Data Density Optimization:</strong> The more data you put into a QR code, the denser the matrix becomes, making it harder to scan at small sizes. If you need to share a very long URL, consider using a reliable URL shortener first (though be aware this introduces a dependency on the shortening service). For VCards, only include essential contact information to keep the code clean.'}</li>
            </ul>

            <h3>{t.guide?.historyTitle || 'Persistent Local Workspace (IndexedDB)'}</h3>
            <p>{t.guide?.historyDesc || 'QR Forge is designed for productivity. We utilize Dexie.js, a robust wrapper around the browser native IndexedDB, to provide a persistent local workspace. Every time you generate a complex QR code—perhaps a meticulously styled WiFi credential or a detailed VCard—you can save it to your history. This log is stored securely on your device, allowing you to reload previous configurations instantly, rename projects for organization, and maintain a seamless workflow without ever needing to create an account or log in to a remote server.'}</p>

                        <hr class="border-slate-700 my-8"/>

            <div class="not-prose mt-8">
              <GuideSection {...t?.guide} />
              <AdPlaceholder />
              <FAQSection title={t.faqTitle || 'Frequently Asked Questions'} items={faqItems} />
            </div>
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="lg:col-span-1 lg:sticky lg:top-8">
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

  <div class="mt-12 mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <RelatedTools {lang} currentSlug="qr-forge" currentCategory="dev" />
  </div>
