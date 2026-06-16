<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  $: lang = $page.params.lang || 'en';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import { db } from '$lib/db';
  import { getColorData, getHarmonies, simulateVision } from '$lib/components/color-master/color-utils';
  import type { HarmonyType, VisionType } from '$lib/types/color-master';
  import { colord } from 'colord';
  import ColorWheel from '$lib/components/color-master/ColorWheel.svelte';
  import PaletteDisplay from '$lib/components/color-master/PaletteDisplay.svelte';
  import A11yChecker from '$lib/components/color-master/A11yChecker.svelte';
  import UIPreview from '$lib/components/color-master/UIPreview.svelte';
  import ExportPanel from '$lib/components/color-master/ExportPanel.svelte';
  import HistoryPanel from '$lib/components/color-master/HistoryPanel.svelte';
  import ImageExtractor from '$lib/components/color-master/ImageExtractor.svelte';
  import ContrastGrid from '$lib/components/color-master/ContrastGrid.svelte';
  import GradientGenerator from '$lib/components/color-master/GradientGenerator.svelte';
  import ScaleGenerator from '$lib/components/color-master/ScaleGenerator.svelte';
  import { getDictionary } from '$lib/dictionaries';
  import type { ScaleStep } from '$lib/types/color-master';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import Head from '$lib/components/Head.svelte';
  import Button from '$lib/components/Button.svelte';

  // --- Props ---

  const HARMONY_TYPES: HarmonyType[] = ['complementary', 'analogous', 'triadic', 'tetradic', 'split-complementary', 'monochromatic'];
  const VISION_TYPES: VisionType[] = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];

  // --- State ---
  let baseColor = '#6366f1';
  let harmonyType: HarmonyType = 'complementary';
  let visionType: VisionType = 'none';
  let showShortcuts = false;
  let currentScale: ScaleStep[] = [];

  $: dict = getDictionary(($page.params.lang || "en"));
  $: t = dict.tools.colorMaster;

  $: schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/color-master",
        "isAccessibleForFree": true,
    "name": t.title,
    "description": t.description,
    "operatingSystem": "Web, iOS, Android, macOS, Windows, Linux",
    "applicationCategory": "DesignApplication",
    "applicationSubCategory": "Color Palette Generator",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      t.guide.f1.replace(/\*\*(.*?)\*\*/g, '$1'),
      t.guide.f2.replace(/\*\*(.*?)\*\*/g, '$1'),
      t.guide.f3.replace(/\*\*(.*?)\*\*/g, '$1'),
      t.guide.f4.replace(/\*\*(.*?)\*\*/g, '$1')
    ]
  };

  $: howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${t.title}`,
    "step": [
      {
        "@type": "HowToStep",
        "name": "Choose Base Color",
        "text": "Select your base color using the color wheel or paste a hex code.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Select Harmony",
        "text": "Choose a color harmony rule to generate a matching palette.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Export",
        "text": "Copy the color codes or export your entire palette for your design.",
        "position": 3
      }
    ]
  };

  $: faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": dict?.q1,
        "acceptedAnswer": { "@type": "Answer", "text": dict?.a1 }
      },
      {
        "@type": "Question",
        "name": dict?.q2,
        "acceptedAnswer": { "@type": "Answer", "text": dict?.a2 }
      },
      {
        "@type": "Question",
        "name": dict?.q3,
        "acceptedAnswer": { "@type": "Answer", "text": dict?.a3 }
      }
    ]
  };

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://selfgrowingmicrotool.com/${($page.params.lang || "en")}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": `https://selfgrowingmicrotool.com/${($page.params.lang || "en")}#tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": t.title,
        "item": `https://selfgrowingmicrotool.com/${($page.params.lang || "en")}/tools/color-master`
      }
    ]
  };

  // --- Derived State ---
  $: harmonies = getHarmonies(baseColor, harmonyType);
  $: displayedHarmonies = visionType === 'none'
      ? harmonies
      : harmonies.map(c => getColorData(simulateVision(c.hex, visionType)));
  $: displayedBaseColor = visionType === 'none'
      ? baseColor
      : simulateVision(baseColor, visionType);

  // --- Effects ---

  // URL Sync
  onMount(() => {
    const urlParams = $page.url.searchParams;
    const colorParam = urlParams.get('c');
    const typeParam = urlParams.get('t');
    const visionParam = urlParams.get('v');

    if (colorParam) baseColor = '#' + colorParam;
    if (typeParam && HARMONY_TYPES.includes(typeParam as HarmonyType)) {
      harmonyType = typeParam as HarmonyType;
    }
    if (visionParam && VISION_TYPES.includes(visionParam as VisionType)) {
      visionType = visionParam as VisionType;
    }

    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKeydown);
    }
  });

  function updateUrl() {
    if (!browser) return;
    const url = new URL(window.location.href);
    url.searchParams.set('c', baseColor.replace('#', ''));
    url.searchParams.set('t', harmonyType);
    if (visionType !== 'none') {
        url.searchParams.set('v', visionType);
    } else {
        url.searchParams.delete('v');
    }
    window.history.replaceState({}, '', url);
  }

  // Debounced Save
  let saveTimeout: ReturnType<typeof setTimeout>;
  function handleColorChange(e: CustomEvent<string>) {
    baseColor = e.detail;
    updateUrl();

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveToHistory();
    }, 2000);
  }

  function handleTypeChange(type: typeof harmonyType) {
    harmonyType = type;
    updateUrl();
    saveToHistory();
  }

  async function saveToHistory() {
    try {
      // Check if similar entry exists recently to avoid spamming history
      const lastEntry = await db.colorHistory.orderBy('createdAt').last();
      if (lastEntry && lastEntry.baseColor === baseColor && lastEntry.paletteType === harmonyType) {
        return;
      }

      await db.colorHistory.add({
        baseColor,
        paletteType: harmonyType,
        createdAt: new Date(),
        starred: 0
      });

      // Prune history to keep only max 100 items (excluding starred items)
      // We want to keep all starred items + 100 recent non-starred items
      const count = await db.colorHistory.where('starred').equals(0).count();
      if (count > 100) {
        // Delete oldest non-starred items
        const oldest = await db.colorHistory.where('starred').equals(0).orderBy('createdAt').limit(count - 100).keys();
        await db.colorHistory.bulkDelete(oldest as number[]);
      }

    } catch (err) {
      console.error('Failed to save history', err);
    }
  }

  function loadHistory(e: CustomEvent<{ baseColor: string; paletteType: typeof harmonyType }>) {
    baseColor = e.detail.baseColor;
    harmonyType = e.detail.paletteType;
    updateUrl();
  }

  function randomize() {
    baseColor = colord({
      h: Math.random() * 360,
      s: Math.random() * 100,
      l: Math.random() * 60 + 20 // Keep it somewhat visible
    }).toHex();

    harmonyType = HARMONY_TYPES[Math.floor(Math.random() * HARMONY_TYPES.length)];

    updateUrl();
    saveToHistory();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.code === 'Space') {
      e.preventDefault();
      randomize();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault();
      navigator.clipboard.writeText(baseColor);
      // Optional: Show toast
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveToHistory();
    } else if (e.key === 'Escape') {
      visionType = 'none';
      if (showShortcuts) showShortcuts = false;
    } else if (e.key === '?') {
        showShortcuts = !showShortcuts;
    }
  }

  function closeShortcuts() {
      showShortcuts = false;
  }
</script>

<svelte:head>
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(schema)}</scr` + `ipt>`}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(howToSchema)}</scr` + `ipt>`}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</scr` + `ipt>`}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</scr` + `ipt>`}
</svelte:head>

<Head
  title={t.title}
  description={t.description}
  keywords={t.keywords}
/>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 relative">

  <!-- Header -->
  <div class="text-center space-y-4">
    <div class="inline-flex items-center gap-3 relative group">
        <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pb-2">
        Lumina
        </h1>
        <Button
          on:click={() => showShortcuts = !showShortcuts}
          class="lg:hidden flex-shrink-0 !rounded-full !px-3"
          ariaLabel={t.shortcuts}
          title={t.shortcuts}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </Button>
        <div class="absolute -top-6 -right-32 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {t.press} '?' {t.shortcutsHelp}
            </div>
        </div>
    </div>
    <p class="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
      {t.description}
    </p>
  </div>

  {#if showShortcuts}
    <div
        transition:fade
        class="fixed inset-0 z-50 flex items-center justify-center"
    >
        <button
            class="absolute inset-0 w-full h-full bg-black/50 backdrop-blur-sm border-none cursor-default min-h-[44px] min-w-[44px]"
            on:click={closeShortcuts}
            on:keydown={(e) => e.key === 'Escape' && closeShortcuts()}
            aria-label="Close shortcuts"
        ></button>
        <div
            class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 relative z-10"
            role="dialog"
            tabindex="-1"
            aria-labelledby="shortcuts-title"
        >
            <h3 id="shortcuts-title" class="text-xl font-bold mb-4 dark:text-white">{t.shortcutsHelp}</h3>
            <ul class="space-y-2">
                <li class="flex justify-between">
                    <span class="text-slate-600 dark:text-slate-400">{t.random}</span>
                    <kbd class="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono border dark:border-slate-600">Space</kbd>
                </li>
                <li class="flex justify-between">
                    <span class="text-slate-600 dark:text-slate-400">{t.copyHex}</span>
                    <kbd class="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono border dark:border-slate-600">Ctrl+C</kbd>
                </li>
                <li class="flex justify-between">
                    <span class="text-slate-600 dark:text-slate-400">{t.save}</span>
                    <kbd class="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono border dark:border-slate-600">Ctrl+S</kbd>
                </li>
                <li class="flex justify-between">
                    <span class="text-slate-600 dark:text-slate-400">{t.reset}</span>
                    <kbd class="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono border dark:border-slate-600">Esc</kbd>
                </li>
            </ul>
             <Button class="mt-6 w-full justify-center min-h-[44px] min-w-[44px]" variant="primary" on:click={closeShortcuts}>Close</Button>
        </div>
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-12 gap-8">

    <!-- Left Column: Controls -->
    <div class="md:col-span-5 lg:col-span-4 space-y-8">
      <div class="relative">
          <ColorWheel color={baseColor} {t} on:change={handleColorChange} />
          <Button
            class="absolute top-2 right-2 !rounded-full !px-3 !py-3 hover:scale-110 shadow-md text-indigo-500 border-indigo-100 dark:border-indigo-900 min-h-[44px] min-w-[44px]"
            on:click={randomize}
            title={t.inspire}
            ariaLabel={t.inspire}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </Button>
      </div>

      <!-- Harmony Selector -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t.harmony}</h3>
        <div class="grid grid-cols-2 gap-3">
          {#each HARMONY_TYPES as type}
            <Button
              class="justify-center {harmonyType === type ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : ''} min-h-[44px] min-w-[44px]"
              on:click={() => handleTypeChange(type)}
            >
              {t.harmonies[type]}
            </Button>
          {/each}
        </div>
      </div>

      <!-- Vision Simulator -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t.visionSimulator}</h3>
        <select
          bind:value={visionType}
          class="w-full p-3 min-h-[44px] text-base bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
        >
          <option value="none">{t.normal}</option>
          <option value="protanopia">{t.protanopia}</option>
          <option value="deuteranopia">{t.deuteranopia}</option>
          <option value="tritanopia">{t.tritanopia}</option>
          <option value="achromatopsia">{t.achromatopsia}</option>
        </select>
        {#if visionType !== 'none'}
          <p class="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
            Simulating how your palette appears to users with {visionType}.
          </p>
        {/if}
      </div>

      <!-- New Feature: Image Extractor -->
      <ImageExtractor {t} on:colorSelected={(e) => {
        baseColor = e.detail;
        updateUrl();
        saveToHistory();
      }} />

      <HistoryPanel {t} on:load={loadHistory} />
    </div>

    <!-- Right Column: Results -->
    <div class="md:col-span-7 lg:col-span-8 space-y-8">

      <!-- Palette Display -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <PaletteDisplay colors={displayedHarmonies} {t} title="{t.harmonies[harmonyType]} Palette" />
      </div>

      <!-- New Feature: Contrast Grid -->
      <ContrastGrid colors={displayedHarmonies} {t} />

      <ScaleGenerator baseColor={displayedBaseColor} {t} on:scaleChange={(e) => currentScale = e.detail} />

      <GradientGenerator baseColor={displayedBaseColor} colors={displayedHarmonies} {t} />

      <A11yChecker color={displayedBaseColor} {t} />

      <UIPreview primaryColor={displayedBaseColor} {t} />

      <ExportPanel baseColor={baseColor} palette={harmonies} scale={currentScale} {t} />

    </div>
  </div>

  <!-- Documentation -->
  <article class="prose prose-indigo dark:prose-invert max-w-none bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[44px] min-w-[44px]">
    <section class="mb-12">
      <h2 class="text-3xl font-bold mb-6">{t.guide.title}</h2>
      <p class="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
        {@html t.guide.intro.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600 dark:text-indigo-400">$1</strong>')}
      </p>
    </section>

    <div class="grid md:grid-cols-2 gap-12 mb-12">
      <section>
        <h3 class="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          {t.guide.featuresTitle}
        </h3>
        <ul class="space-y-3 list-none pl-0">
          {#each [t.guide.f1, t.guide.f2, t.guide.f3, t.guide.f4] as feature}
            <li class="flex gap-3 text-slate-600 dark:text-slate-300">
              <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
              <span>{@html feature.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white">$1</strong>')}</span>
            </li>
          {/each}
        </ul>
      </section>

      <section>
        <h3 class="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          {t.guide.technicalTitle}
        </h3>
        <ul class="space-y-3 list-none pl-0">
          {#each [t.guide.tech1, t.guide.tech2, t.guide.tech3] as tech}
            <li class="flex gap-3 text-slate-600 dark:text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>{@html tech}</span>
            </li>
          {/each}
        </ul>
      </section>
    </div>

    <section class="mb-12 bg-indigo-50 dark:bg-slate-700/30 rounded-2xl p-6 border border-indigo-100 dark:border-slate-600">
      <h3 class="flex items-center gap-2 text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        {t.guide.tipsTitle}
      </h3>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-600">
          <p class="text-indigo-800 dark:text-indigo-200 font-medium mb-2">Pro Tip</p>
          <p class="text-slate-600 dark:text-slate-300 text-sm">{t.guide.tip1}</p>
        </div>
        <ul class="space-y-3 list-none pl-0">
          {#each [t.guide.tip2, t.guide.tip3, t.guide.tip4] as tip}
            <li class="flex gap-3 text-slate-600 dark:text-slate-300 text-sm">
              <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
              <span>{@html tip.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white">$1</strong>')}</span>
            </li>
          {/each}
        </ul>
      </div>
    </section>

  </article>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <GuideSection {...t?.guide} />
    <AdPlaceholder />
    <FAQSection
      title={t.faqTitle}
      items={[
        { q: dict?.q1, a: dict?.a1 },
        { q: dict?.q2, a: dict?.a2 },
        { q: dict?.q3, a: dict?.a3 }
      ]}
    />
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools {lang} currentSlug="color-master" currentCategory="design" />
  </div>
</div>
