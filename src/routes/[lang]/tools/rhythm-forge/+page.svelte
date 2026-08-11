<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { MetronomeEngine } from '$lib/utils/rhythm-forge/audio';
  import type { RhythmSettings, BeatEvent, SoundPack, RhythmForgeDictionary } from '$lib/utils/rhythm-forge/types';
  import { db, type RhythmForgePreset, type RhythmForgeHistory } from '$lib/db';
  import type { RhythmPreset } from '$lib/utils/rhythm-forge/presets';
  import { Activity } from '@lucide/svelte';
  import { SessionTracker } from '$lib/utils/rhythm-forge/session';
  import { decompressState } from '$lib/utils/url-state';

  import Visualizer from '$lib/components/rhythm-forge/Visualizer.svelte';
  import Controls from '$lib/components/rhythm-forge/Controls.svelte';
  import TrainerPanel from '$lib/components/rhythm-forge/TrainerPanel.svelte';
  import RhythmGame from '$lib/components/rhythm-forge/RhythmGame.svelte';
  import SettingsPanel from '$lib/components/rhythm-forge/SettingsPanel.svelte';
  import PresetPanel from '$lib/components/rhythm-forge/PresetPanel.svelte';
  import PlaylistPanel from '$lib/components/rhythm-forge/PlaylistPanel.svelte';
  import SessionStats from '$lib/components/rhythm-forge/SessionStats.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = ((getDictionary(lang) as any)?.tools as any).rhythmForge as RhythmForgeDictionary;
  $: common = getDictionary(lang).common;

  // App State
  let mode: 'metronome' | 'trainer' | 'game' = 'metronome';
  let libraryMode: 'presets' | 'playlists' = 'presets';

  // Initial State
  let settings: RhythmSettings = {
      bpm: 120,
      isPlaying: false,
      volume: 0.75,
      signature: [4, 4],
      polyrhythm: [3, 2],
      polyrhythmEnabled: false,
      soundPack: 'click',
      visualizer: 'circle',
      trainer: {
          enabled: false,
          startBpm: 120,
          endBpm: 160,
          increment: 5,
          interval: 4
      },
      ghost: {
          enabled: false,
          playBars: 3,
          muteBars: 1
      }
  };

  let engine: MetronomeEngine;
  let lastBeat: BeatEvent | null = null;
  const sessionTracker = new SessionTracker();
  let wasPlaying = false;
  let tapTimes: number[] = [];

  function onBeat(event: BeatEvent) {
      lastBeat = event;
  }

  function onBpmChange(newBpm: number) {
      settings.bpm = newBpm;
      // Force reactivity
      settings = { ...settings };
  }

  function handlePlay() {
      settings.isPlaying = true;
  }

  function handleStop() {
      settings.isPlaying = false;
  }

  function handleTap() {
      const now = Date.now();

      // Reset if too long since last tap (2 seconds)
      if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 2000) {
          tapTimes = [];
      }

      tapTimes.push(now);
      if (tapTimes.length > 4) tapTimes.shift(); // Keep last 4

      if (tapTimes.length > 1) {
          // Calculate average interval
          let intervals = [];
          for (let i = 1; i < tapTimes.length; i++) {
              intervals.push(tapTimes[i] - tapTimes[i - 1]);
          }
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          const newBpm = Math.round(60000 / avgInterval);
          if (newBpm >= 30 && newBpm <= 300) {
              settings.bpm = newBpm;
          }
      }
  }

  function handleLoadPreset(event: CustomEvent<RhythmForgePreset | RhythmForgeHistory | RhythmPreset | RhythmSettings>) {
      const preset = event.detail;
      const newSettings = { ...settings };
      newSettings.bpm = preset.bpm;
      newSettings.signature = [...preset.signature];
      if (preset.polyrhythm) {
          newSettings.polyrhythm = [...preset.polyrhythm];
          newSettings.polyrhythmEnabled = true;
      } else {
          newSettings.polyrhythmEnabled = false;
      }
      newSettings.soundPack = preset.soundPack as SoundPack;
      settings = newSettings;
  }

  async function saveHistory() {
      try {
          await db.rhythmForgeHistory.add({
              bpm: settings.bpm,
              signature: [...settings.signature],
              polyrhythm: settings.polyrhythmEnabled && settings.polyrhythm ? [...settings.polyrhythm] : undefined,
              soundPack: settings.soundPack,
              createdAt: new Date()
          });

          // Limit history
          const count = await db.rhythmForgeHistory.count();
          if (count > 20) {
              const keys = await db.rhythmForgeHistory.orderBy('createdAt').limit(count - 20).keys();
              await db.rhythmForgeHistory.bulkDelete(keys);
          }
      } catch (err) {
          console.error('Failed to save history', err);
      }
  }

  // Reactivity for Engine
  $: if (engine) {
      engine.updateSettings(settings);

      if (settings.isPlaying) {
          if (!wasPlaying) {
              engine.start();
              sessionTracker.start();
              wasPlaying = true;
          }
      } else {
          if (wasPlaying) {
              engine.stop();
              const duration = sessionTracker.stop();
              // Only save session if in metronome mode to avoid duplicates with TrainerPanel
              if (duration && mode === 'metronome') {
                  sessionTracker.save(settings, duration);
              }
              wasPlaying = false;
          } else {
              engine.stop();
          }
      }
  }

  onMount(async () => {
      engine = new MetronomeEngine(settings, onBeat, onBpmChange);
      window.addEventListener('keydown', handleKeydown);

      const urlParams = new URLSearchParams(window.location.search);
      const state = urlParams.get('s');
      if (state) {
          try {
              const json = await decompressState(state);
              if (json) {
                  const restored = JSON.parse(json);
                  // Validate and merge
                  settings = { ...settings, ...restored, isPlaying: false }; // Ensure starts paused
              }
          } catch (e) {
              console.error('Failed to restore state', e);
          }
      }
  });

  onDestroy(() => {
      if (engine) engine.dispose();
      if (typeof window !== 'undefined') {
          window.removeEventListener('keydown', handleKeydown);
          if (wasPlaying) {
              const duration = sessionTracker.stop();
              if (duration && mode === 'metronome') {
                  sessionTracker.save(settings, duration);
              }
          }
          saveHistory();
      }
  });

  function handleKeydown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
          e.preventDefault();
          if (mode === 'metronome') {
              settings.isPlaying = !settings.isPlaying;
          }
          // Trainer mode handles its own spacebar separately via window binding in TrainerPanel
          return;
      }

      if (mode === 'metronome') {
          if (e.code === 'ArrowUp') {
              e.preventDefault();
              settings.bpm = Math.min(300, settings.bpm + (e.shiftKey ? 5 : 1));
          } else if (e.code === 'ArrowDown') {
              e.preventDefault();
              settings.bpm = Math.max(30, settings.bpm - (e.shiftKey ? 5 : 1));
          } else if (e.code === 'KeyT') {
              e.preventDefault();
              handleTap();
          } else if (e.code === 'KeyM') {
              e.preventDefault();
              settings.volume = settings.volume > 0 ? 0 : 0.75;
          }
      }
  }

  // SEO Schema
  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/rhythm-forge",
        "isAccessibleForFree": true,
    "name": dict.title,
    "description": dict.description,
    "applicationCategory": "MultimediaApplication",
    "applicationSubCategory": "Music Learning",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
        "Polyrhythm Metronome",
        "Rhythm Library",
        "Practice Analytics",
        "Rhythm Trainer Mode",
        "Visual Beat Indicator",
        "Tap Tempo",
        "Speed Trainer",
        "Ghost Mode (Gap Click)",
        "Web Audio Precision"
    ]
  };
</script>
<Head
  title={`${mode === 'game' ? (dict.game?.title || 'Rhythm Game') : (settings.isPlaying ? `▶ ${settings.bpm} BPM` : dict.title)}`}
  description={dict.description}
  keywords="metronome, polyrhythm generator, online metronome, rhythm trainer, music tools, tap tempo, bpm calculator, gap click, speed trainer, timing accuracy, drum practice"
/>


<svelte:head>


  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/rhythm-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/rhythm-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/rhythm-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/rhythm-forge"} />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</scr` + `ipt>`}

  {@html `<script type="application/ld+json">
  ${JSON.stringify()}</scr` + `ipt>`}

</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20 transition-colors duration-300">

  <!-- Main Workspace -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      <!-- Header -->
      <div class="text-center space-y-4">
          <div class="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-2">
              <Activity class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              {dict.title.split(':')[0]}
          </h1>
          <p class="text-lg text-slate-600 dark:text-slate-400 max-w-7xl mx-auto">
              {dict.description}
          </p>
      </div>

      <!-- Tool Interface -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <!-- Left Column: Visualizer & Controls -->
          <div class="lg:col-span-7 space-y-8">
              <!-- Mode Switcher -->
              <div class="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl">
                  <button class="flex-1 py-3 rounded-xl font-bold text-sm transition-all {mode === 'metronome' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'} min-h-[44px] min-w-[44px]"
                      on:click={() => mode = 'metronome'}
                  >
                      Metronome
                  </button>
                  <button class="flex-1 py-3 rounded-xl font-bold text-sm transition-all {mode === 'trainer' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'} min-h-[44px] min-w-[44px]"
                      on:click={() => mode = 'trainer'}
                  >
                      {dict.rhythmTrainer?.title || 'Rhythm Trainer'}
                  </button>
                  <button class="flex-1 py-3 rounded-xl font-bold text-sm transition-all {mode === 'game' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'} min-h-[44px] min-w-[44px]"
                      on:click={() => mode = 'game'}
                  >
                      {dict.game?.title || 'Rhythm Game'}
                  </button>
              </div>

              <!-- Visualizer -->
              <Visualizer engine={engine as any} lastBeat={lastBeat as any} settings={settings as any} mode={(mode === 'game' ? 'trainer' : mode) as any} />

              <!-- Controls or Trainer -->
              {#if mode === 'metronome'}
                  <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
                      <Controls
                          bind:settings
                          {...(dict as any)}
                          on:play={handlePlay}
                          on:stop={handleStop}
                          on:tap={handleTap}
                      />
                  </div>
              {:else if mode === 'trainer'}
                  <TrainerPanel {engine} bind:settings {...(dict as any)} />
              {:else if mode === 'game'}
                  <RhythmGame engine={engine as any} bind:settings dict={dict as any} />
              {/if}
          </div>

          <!-- Right Column: Settings & Presets -->
          <div class="lg:col-span-5 space-y-8">
              <SessionStats {...(dict as any)} />
              <SettingsPanel bind:settings {...(dict as any)} />

              <div class="bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl flex">
                  <button class="flex-1 py-2 rounded-xl font-bold text-sm transition-all {libraryMode === 'presets' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'} min-h-[44px] min-w-[44px]"
                      on:click={() => libraryMode = 'presets'}
                  >
                      {dict.libraryMode?.presets || 'Presets & Library'}
                  </button>
                  <button class="flex-1 py-2 rounded-xl font-bold text-sm transition-all {libraryMode === 'playlists' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'} min-h-[44px] min-w-[44px]"
                      on:click={() => libraryMode = 'playlists'}
                  >
                      {dict.libraryMode?.playlists || 'Setlists / Playlists'}
                  </button>
              </div>

              {#if libraryMode === 'presets'}
                  <PresetPanel {settings} {...(dict as any)} on:load={handleLoadPreset} />
              {:else}
                  <PlaylistPanel settings={settings as any} dict={dict as any} on:load={handleLoadPreset} />
              {/if}
          </div>
      </div>

      <!-- Documentation -->
      <div class="mt-20 border-t border-slate-200 dark:border-slate-800 pt-12">
          <GuideSection {...dict.guide} />
          <div class="mt-12">
              <AdPlaceholder />
  <FAQSection
                  title={dict.faqTitle}
                  items={[
                      { q: (dict as any)?.q1, a: (dict as any)?.a1 },
                      { q: (dict as any)?.q2, a: (dict as any)?.a2 },
                      { q: (dict as any)?.q3, a: (dict as any)?.a3 }
                  ]}
              />
          </div>
      </div>
    <div class="mt-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="rhythm-forge" currentCategory="music" />
  </div>
</main>
</div>
