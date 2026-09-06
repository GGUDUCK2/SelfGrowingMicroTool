<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import { db } from '$lib/db';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { KeyForgeEngine } from '$lib/utils/key-forge/engine';
  import type { GameConfig } from '$lib/utils/key-forge/types';
  import { Keyboard, RotateCcw, Settings, ChevronLeft, Zap } from '@lucide/svelte';

  import TypingArea from '$lib/components/key-forge/TypingArea.svelte';
  import StatsDisplay from '$lib/components/key-forge/StatsDisplay.svelte';
  import VirtualKeyboard from '$lib/components/key-forge/VirtualKeyboard.svelte';
  import SettingsPanel from '$lib/components/key-forge/SettingsPanel.svelte';
  import HistoryPanel from '$lib/components/key-forge/HistoryPanel.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = (getDictionary(lang) as any)?.tools?.keyForge;
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
        "@id": $page.url.origin + "/" + lang + "/tools/key-forge",
        "isAccessibleForFree": true,
    "name": dict.title,
    "description": dict.description,
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



  $: howToSchema = {
    "@context": "https://schema.org",

    "@type": "HowTo",
    "name": "How to use Key Forge",
    "description": "Step-by-step guide to using the Key Forge tool.",
    "step": [
        {
            "@type": "HowToStep",
            "name": "Configure Tool",
            "text": "Adjust the settings or input your data according to your requirements."
        },
        {
            "@type": "HowToStep",
            "name": "Process Data",
            "text": "Review the live preview or click the generate/process button."
        },
        {
            "@type": "HowToStep",
            "name": "Export Result",
            "text": "Copy or download the final output."
        }
    ]

  };

</script>
<Head
  title={dict.title}
  description={dict.description}
  keywords="typing test, wpm test, code typing practice, mechanical keyboard sound, typing speed test, developer typing"
/>


<svelte:head>
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/key-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/key-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/key-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/key-forge"} />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</scr` + `ipt>`}

  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(howToSchema).replace(/</g, '\\u003c')}</scr` + `ipt>`}
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20 transition-colors duration-300">
  <!-- Header -->
  <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-all duration-300" class:opacity-0={config.zen && state?.isRunning} class:pointer-events-none={config.zen && state?.isRunning}>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -ml-2 rounded-lg">
          <ChevronLeft size={20} />
        </a>
        <div class="flex items-center space-x-2">
          <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
             <Keyboard size={20} />
          </div>
          <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {dict.title}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2">
          <button on:click={() => config = { ...config, zen: !config.zen }}
              class="p-2 transition-colors rounded-lg flex items-center gap-1 font-medium text-sm {config.zen ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-500'} min-h-[44px] min-w-[44px]"
              title={dict.zen}
          >
              <Zap size={16} />
              <span class="hidden md:inline">Zen</span>
          </button>
          <button on:click={() => showKeyboard = !showKeyboard}
              class="p-2 transition-colors rounded-lg {showKeyboard ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-500'} min-h-[44px] min-w-[44px]"
              title={dict.keyboard}
          >
              <Keyboard size={20} />
          </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center space-y-12">

      {#if state}
          {#if !state.isRunning || !config.zen}
            <div class="w-full max-w-7xl" transition:fade>
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

          <div class="mt-8 w-full max-w-7xl flex justify-center gap-4">
              <button on:click={restart}
                  class="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 min-h-[44px] min-w-[44px]"
              >
                  <RotateCcw size={18} />
                  {dict.restart}
              </button>
          </div>

          {#if showKeyboard && (!config.zen || !state.isRunning)}
              <div class="mt-12 w-full max-w-7xl hidden md:block" transition:fade>
                  <VirtualKeyboard activeKey={state.content[state.cursor] || ''} />
              </div>
          {/if}

          <div class="mt-20 w-full grid lg:grid-cols-12 gap-8">
              <div class="lg:col-span-8 space-y-8">
                  <GuideSection
                      title={dict.guide.title}
                      intro={dict.guide.intro}
                      featuresTitle={dict.guide.featuresTitle}
                      f1={dict.guide.f1}
                      f2={dict.guide.f2}
                      f3={dict.guide.f3}
                      tipsTitle={dict.guide.tipsTitle}
                      tip1={dict.guide.tip1}
                      tip2={dict.guide.tip2}
                      tip3={dict.guide.tip3}
                  />
                  <div class="mt-8">
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
              <div class="lg:col-span-4">
                  <HistoryPanel {dict} />
              </div>
          </div>
      {/if}

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="key-forge" currentCategory="dev" />
  </div>
</main>
</div>
