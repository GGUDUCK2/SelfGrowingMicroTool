<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import { db } from '$lib/db';
  import { getColorData, getHarmonies, simulateVision, type ColorData } from '$lib/components/color-master/color-utils';
  import ColorWheel from '$lib/components/color-master/ColorWheel.svelte';
  import PaletteDisplay from '$lib/components/color-master/PaletteDisplay.svelte';
  import A11yChecker from '$lib/components/color-master/A11yChecker.svelte';
  import ExportPanel from '$lib/components/color-master/ExportPanel.svelte';
  import HistoryPanel from '$lib/components/color-master/HistoryPanel.svelte';
  import { getDictionary } from '$lib/dictionaries';

  // --- Props ---
  export let data;

  // --- State ---
  let baseColor = '#6366f1';
  let harmonyType: 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'split-complementary' | 'monochromatic' = 'complementary';
  let visionType: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' = 'none';

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
  });

  function updateUrl() {
    if (!browser) return;
    const url = new URL(window.location.href);
    url.searchParams.set('c', baseColor.replace('#', ''));
    url.searchParams.set('t', harmonyType);
    window.history.replaceState({}, '', url);
  }

  // Debounced Save
  let saveTimeout: NodeJS.Timeout;
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
      await db.colorHistory.add({
        baseColor,
        paletteType: harmonyType,
        createdAt: new Date()
      });
    } catch (err) {
      console.error('Failed to save history', err);
    }
  }

  function loadHistory(e: CustomEvent<any>) {
    baseColor = e.detail.baseColor;
    harmonyType = e.detail.paletteType;
    updateUrl();
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
      }
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

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

  <!-- Header -->
  <div class="text-center space-y-4">
    <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      Lumina
    </h1>
    <p class="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
      {t.description}
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

    <!-- Left Column: Controls -->
    <div class="lg:col-span-4 space-y-8">
      <ColorWheel color={baseColor} {t} on:change={handleColorChange} />

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
          class="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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

      <HistoryPanel {t} on:load={loadHistory} />
    </div>

    <!-- Right Column: Results -->
    <div class="lg:col-span-8 space-y-8">

      <!-- Palette Display -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <PaletteDisplay colors={displayedHarmonies} {t} title="{t.harmonies[harmonyType]} Palette" />
      </div>

      <A11yChecker color={displayedBaseColor} {t} />

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
