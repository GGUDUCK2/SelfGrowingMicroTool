<script lang="ts">
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
  import { getDictionary } from '$lib/dictionaries';

  // --- Props ---
  export let data;

  // --- State ---
  let baseColor = '#6366f1';
  let harmonyType: HarmonyType = 'complementary';
  let visionType: VisionType = 'none';
  let showShortcuts = false;

  $: dict = getDictionary(data.lang);
  $: t = dict.tools.colorMaster;

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

    if (colorParam) baseColor = '#' + colorParam;
    if (typeParam) harmonyType = typeParam as any;

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

    const types = ['complementary', 'analogous', 'triadic', 'tetradic', 'split-complementary', 'monochromatic'] as const;
    harmonyType = types[Math.floor(Math.random() * types.length)];

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
  <title>{t.title} | {dict.home.title}</title>
  <meta name="description" content="{t.description}" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Lumina: Color & A11y Master",
      "operatingSystem": "Web",
      "applicationCategory": "DesignApplication",
      "offers": {
        "@type": "Offer",
        "price": "0"
      },
      "featureList": [
        "Algorithmic Harmony Generation",
        "Real-time WCAG Accessibility Checking",
        "Color Blindness Vision Simulation",
        "Code Export (CSS, Tailwind, SCSS, JSON)",
        "Image Color Extraction",
        "Contrast Matrix Grid"
      ]
    }
  </script>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "{t.faqTitle}",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "{t.q1} {t.a1}"
          }
        },
        {
          "@type": "Question",
          "name": "{t.q2}",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "{t.a2}"
          }
        }
      ]
    }
  </script>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 relative">

  <!-- Header -->
  <div class="text-center space-y-4">
    <div class="inline-block relative group">
        <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pb-2">
        Lumina
        </h1>
        <div class="absolute -top-6 -right-12 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                Press '?' for shortcuts
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        role="presentation"
        on:click={closeShortcuts}
        on:keydown={(e) => e.key === 'Escape' && closeShortcuts()}
    >
        <div
            class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4"
            role="dialog"
            tabindex="-1"
            aria-labelledby="shortcuts-title"
            on:click|stopPropagation
            on:keydown|stopPropagation
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
             <button class="mt-6 w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors" on:click={closeShortcuts}>Close</button>
        </div>
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

    <!-- Left Column: Controls -->
    <div class="lg:col-span-4 space-y-8">
      <div class="relative">
          <ColorWheel color={baseColor} {t} on:change={handleColorChange} />
          <button
            class="absolute top-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md hover:scale-110 transition-transform text-indigo-500 border border-indigo-100 dark:border-indigo-900"
            on:click={randomize}
            title={t.inspire}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
      </div>

      <!-- Harmony Selector -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t.harmony}</h3>
        <div class="grid grid-cols-2 gap-2">
          {#each ['complementary', 'analogous', 'triadic', 'tetradic', 'split-complementary', 'monochromatic'] as type}
            <button
              class="px-3 py-2 text-sm rounded-lg border transition-all {harmonyType === type ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'}"
              on:click={() => handleTypeChange(type)}
            >
              {t.harmonies[type]}
            </button>
          {/each}
        </div>
      </div>

      <!-- Vision Simulator -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t.visionSimulator}</h3>
        <select
          bind:value={visionType}
          class="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
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
    <div class="lg:col-span-8 space-y-8">

      <!-- Palette Display -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <PaletteDisplay colors={displayedHarmonies} {t} title="{t.harmonies[harmonyType]} Palette" />
      </div>

      <!-- New Feature: Contrast Grid -->
      <ContrastGrid colors={displayedHarmonies} {t} />

      <GradientGenerator baseColor={displayedBaseColor} colors={displayedHarmonies} {t} />

      <A11yChecker color={displayedBaseColor} {t} />

      <UIPreview primaryColor={displayedBaseColor} {t} />

      <ExportPanel baseColor={baseColor} palette={harmonies} {t} />

    </div>
  </div>

  <!-- Documentation -->
  <article class="prose dark:prose-invert max-w-none bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
    <h2>{t.guide.title}</h2>
    <p>
      {@html t.guide.intro.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
    </p>

    <h3>{t.guide.featuresTitle}</h3>
    <ul>
      <li>{@html t.guide.f1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>
      <li>{@html t.guide.f2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>
      <li>{@html t.guide.f3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>
      <li>{@html t.guide.f4.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>
    </ul>

    <h3>{t.guide.tipsTitle}</h3>
    <blockquote>
      <p>{t.guide.tip1}</p>
    </blockquote>
    <ul>
      <li>{@html t.guide.tip2.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>
      <li>{@html t.guide.tip3.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>
      <li>{@html t.guide.tip4.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>
    </ul>

    <h3>{t.guide.technicalTitle}</h3>
    <ul>
      <li>{@html t.guide.tech1}</li>
      <li>{@html t.guide.tech2}</li>
      <li>{@html t.guide.tech3}</li>
    </ul>

    <h3>{t.faqTitle}</h3>
    <dl>
      <dt><strong>{t.q1}</strong></dt>
      <dd>{t.a1}</dd>

      <dt><strong>{t.q2}</strong></dt>
      <dd>{t.a2}</dd>
    </dl>
  </article>

</div>
