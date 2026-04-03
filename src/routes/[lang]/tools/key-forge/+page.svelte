<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { db } from '$lib/db';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { KeyForgeEngine } from '$lib/utils/key-forge/engine';
  import type { GameConfig } from '$lib/utils/key-forge/types';
  import { Keyboard, RotateCcw, Settings, ChevronLeft, Zap } from 'lucide-svelte';

  import TypingArea from '$lib/components/key-forge/TypingArea.svelte';
  import StatsDisplay from '$lib/components/key-forge/StatsDisplay.svelte';
  import VirtualKeyboard from '$lib/components/key-forge/VirtualKeyboard.svelte';
  import SettingsPanel from '$lib/components/key-forge/SettingsPanel.svelte';
  import HistoryPanel from '$lib/components/key-forge/HistoryPanel.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang).tools.keyForge;
  $: common = getDictionary(lang).common;

  let config: GameConfig = {
      mode: 'time',
      language: 'english',
      duration: 30,
      wordCount: 25,
      sound: 'mechanical',
      zen: false
  };

  let engine: KeyForgeEngine;
  let state: any;
  let showKeyboard = true;
  let focused = false;

  onMount(() => {
      engine = new KeyForgeEngine(config);
      const unsubscribe = engine.state.subscribe(s => {
          state = s;
          if (s.isFinished && !s.isRunning && s.endTime && s.startTime) {
              saveResult(s);
          }
      });
      return () => {
          unsubscribe();
          if (engine.timer) clearInterval(engine.timer);
      };
  });

  function handleConfigChange(event: CustomEvent) {
      config = { ...config, ...event.detail };
      engine.setConfig(config);
      focused = true;
  }

  function handleType(event: CustomEvent) {
      engine.type(event.detail);
  }

  function restart() {
      engine.reset();
      focused = true;
  }

  async function saveResult(s: any) {
      // Only save valid runs (> 5 seconds or > 10 chars)
      const duration = (s.endTime - s.startTime) / 1000;
      if (s.wpm > 0 && (duration > 5 || s.input.length > 10)) {
          // Check if we already saved this exact run (dedup by timestamp approx)
          // Actually engine generates new timestamp on finish.
          await db.keyForgeHistory.add({
              wpm: s.wpm,
              accuracy: s.accuracy,
              consistency: s.consistency,
              mode: config.mode,
              language: config.language,
              duration: duration,
              timestamp: new Date(),
              starred: 0
          });
      }
  }

  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "isAccessibleForFree": true,
    "name": dictionary.title,
    "description": dictionary.description,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Real-time WPM tracking",
      "Code syntax practice",
      "Mechanical keyboard sound simulation",
      "Detailed statistics history"
    ]
  };

  $: jsonLd2 = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": dictionary.q1,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dictionary.a1
        }
      },
      {
        "@type": "Question",
        "name": dictionary.q2,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dictionary.a2
        }
      },
      {
        "@type": "Question",
        "name": dictionary.q3,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": dictionary.a3
        }
      }
    ]
  };
</script>
<Head
  title={dictionary.title}
  description={dictionary.description}
  keywords="typing test, wpm test, code typing practice, mechanical keyboard sound, typing speed test, developer typing"
/>


<svelte:head>
                {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>'}

  {@html '<script type="application/ld+json">' + JSON.stringify(jsonLd2) + '</script>'}

</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20 transition-colors duration-300">
  <!-- Header -->
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-all duration-300" class:opacity-0={config.zen && state?.isRunning} class:pointer-events-none={config.zen && state?.isRunning}>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <ChevronLeft size={20} />
        </a>
        <div class="flex items-center space-x-2">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
             <Keyboard size={20} />
          </div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {dictionary.title}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2">
          <button
              on:click={() => config = { ...config, zen: !config.zen }}
              class="p-2 transition-colors rounded-lg flex items-center gap-1 font-medium text-sm {config.zen ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-500'}"
              title={dictionary.zen}
          >
              <Zap size={16} />
              <span class="hidden md:inline">Zen</span>
          </button>
          <button
              on:click={() => showKeyboard = !showKeyboard}
              class="p-2 transition-colors rounded-lg {showKeyboard ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-500'}"
              title={dictionary.keyboard}
          >
              <Keyboard size={20} />
          </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">

      {#if state}
          {#if !state.isRunning || !config.zen}
            <div class="w-full max-w-4xl" transition:fade>
                <SettingsPanel {config} {dict} on:change={handleConfigChange} />
            </div>
          {/if}

          <div class="w-full flex justify-center mb-8 relative group flex-col items-center">
              <StatsDisplay {state} />
          </div>

          <TypingArea
              {state}
              {config}
              bind:focused
              on:type={handleType}
              on:restart={restart}
              on:focus={() => focused = true}
          />

          <div class="mt-8 w-full max-w-4xl flex justify-center gap-4">
              <button
                  on:click={restart}
                  class="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 min-h-[44px]"
              >
                  <RotateCcw size={18} />
                  {dictionary.restart}
              </button>
          </div>

          {#if showKeyboard && (!config.zen || !state.isRunning)}
              <div class="mt-12 w-full max-w-4xl hidden md:block" transition:fade>
                  <VirtualKeyboard activeKey={state.content[state.cursor] || ''} />
              </div>
          {/if}

          <div class="mt-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div class="lg:col-span-8 space-y-8">
                  <GuideSection
                      title={dictionary.guide.title}
                      intro={dictionary.guide.intro}
                      featuresTitle={dictionary.guide.featuresTitle}
                      f1={dictionary.guide.f1}
                      f2={dictionary.guide.f2}
                      f3={dictionary.guide.f3}
                      tipsTitle={dictionary.guide.tipsTitle}
                      tip1={dictionary.guide.tip1}
                      tip2={dictionary.guide.tip2}
                      tip3={dictionary.guide.tip3}
                  />
                  <div class="mt-8">
                      <FAQSection
                          title={dictionary.faqTitle}
                          items={[
                              { q: dictionary.q1, a: dictionary.a1 },
                              { q: dictionary.q2, a: dictionary.a2 },
                              { q: dictionary.q3, a: dictionary.a3 }
                          ]}
                      />
                  </div>
              </div>
              <div class="lg:col-span-4">
                  <HistoryPanel {dict} />
              </div>
          </div>
      {/if}
  </main>
</div>
