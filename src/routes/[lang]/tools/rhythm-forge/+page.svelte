<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { MetronomeEngine } from '$lib/utils/rhythm-forge/audio';
  import type { RhythmSettings, BeatEvent } from '$lib/utils/rhythm-forge/types';
  import type { RhythmForgePreset } from '$lib/db';
  import { Activity } from 'lucide-svelte';

  import Visualizer from '$lib/components/rhythm-forge/Visualizer.svelte';
  import Controls from '$lib/components/rhythm-forge/Controls.svelte';
  import SettingsPanel from '$lib/components/rhythm-forge/SettingsPanel.svelte';
  import PresetPanel from '$lib/components/rhythm-forge/PresetPanel.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang).tools.rhythmForge;
  $: common = getDictionary(lang).common;

  // Initial State
  let settings: RhythmSettings = {
      bpm: 120,
      isPlaying: false,
      volume: 0.75,
      signature: [4, 4],
      polyrhythm: [3, 2],
      polyrhythmEnabled: false,
      soundPack: 'click',
      visualizer: 'circle'
  };

  let engine: MetronomeEngine;
  let lastBeat: BeatEvent | null = null;

  function onBeat(event: BeatEvent) {
      lastBeat = event;
  }

  function handlePlay() {
      settings.isPlaying = true;
  }

  function handleStop() {
      settings.isPlaying = false;
  }

  function handleLoadPreset(event: CustomEvent<RhythmForgePreset>) {
      const preset = event.detail;
      // Use spread to trigger reactivity
      const newSettings = { ...settings };
      newSettings.bpm = preset.bpm;
      newSettings.signature = [...preset.signature];
      if (preset.polyrhythm) {
          newSettings.polyrhythm = [...preset.polyrhythm];
          newSettings.polyrhythmEnabled = true;
      } else {
          newSettings.polyrhythmEnabled = false;
      }
      newSettings.soundPack = preset.soundPack as any;
      settings = newSettings;
  }

  // Reactivity for Engine
  $: if (engine) {
      engine.updateSettings(settings);
      if (settings.isPlaying) {
          engine.start();
      } else {
          engine.stop();
      }
  }

  onMount(() => {
      engine = new MetronomeEngine(settings, onBeat);
      window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
      if (engine) engine.stop();
      if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKeydown);
  });

  function handleKeydown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
          e.preventDefault();
          settings.isPlaying = !settings.isPlaying;
      }
  }

  // SEO Schema
  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": dict.title,
    "description": dict.description,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
        "Polyrhythm Metronome",
        "Visual Beat Indicator",
        "Tap Tempo",
        "Custom Time Signatures",
        "Web Audio Precision"
    ]
  };
</script>

<svelte:head>
  <title>{dict.title} - MicroFactory</title>
  <meta name="description" content={dict.description} />
  <meta name="keywords" content="metronome, polyrhythm generator, online metronome, rhythm trainer, music tools, tap tempo, bpm calculator" />

  <meta property="og:title" content={dict.title} />
  <meta property="og:description" content={dict.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={`https://web-factory.vercel.app/${lang}/tools/rhythm-forge`} />

  {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20 transition-colors duration-300">

  <!-- Main Workspace -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <!-- Header -->
      <div class="text-center space-y-4">
          <div class="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-2">
              <Activity class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              {dict.title.split(':')[0]}
          </h1>
          <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {dict.description}
          </p>
      </div>

      <!-- Tool Interface -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <!-- Left Column: Visualizer & Controls -->
          <div class="lg:col-span-7 space-y-8">
              <!-- Visualizer -->
              <Visualizer {lastBeat} {settings} />

              <!-- Controls -->
              <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
                  <Controls
                      bind:settings
                      {dict}
                      on:play={handlePlay}
                      on:stop={handleStop}
                  />
              </div>
          </div>

          <!-- Right Column: Settings & Presets -->
          <div class="lg:col-span-5 space-y-8">
              <SettingsPanel bind:settings {dict} />
              <PresetPanel {settings} {dict} on:load={handleLoadPreset} />
          </div>
      </div>

      <!-- Documentation -->
      <div class="mt-20 border-t border-slate-200 dark:border-slate-800 pt-12">
          <GuideSection {...dict.guide} />
          <div class="mt-12">
              <FAQSection
                  title={dict.faqTitle}
                  items={[
                      { q: dict.q1, a: dict.a1 },
                      { q: dict.q2, a: dict.a2 },
                      { q: dict.q3, a: dict.a3 }
                  ]}
              />
          </div>
      </div>
  </main>
</div>
