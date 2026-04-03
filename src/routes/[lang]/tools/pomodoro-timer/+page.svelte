<script lang="ts">
  import Head from '$lib/components/Head.svelte';
  import { onDestroy, onMount } from "svelte";
  import type { PageData } from "./$types";
  import { formatTime } from "$lib/utils";
  import { dictionaries } from "$lib/dictionaries";
  import FAQSection from "$lib/components/FAQSection.svelte";
  import GuideSection from "$lib/components/GuideSection.svelte";

  export let data: PageData;

  type Language = "en" | "ko";
  $: lang = data.lang as Language;
  $: dict = dictionaries[lang]?.tools?.pomodoroTimer || dictionaries.en.tools.pomodoroTimer;

  // Timer State
  let timeLeft = 25 * 60;
  let isRunning = false;
  let mode: "focus" | "short" | "long" = "focus";
  let timerInterval: NodeJS.Timeout | undefined;
  let audioCtx: AudioContext | null = null;

  onMount(() => {
    return () => {
      if (audioCtx) {
        audioCtx.close();
      }
      if (timerInterval) clearInterval(timerInterval);
    };
  });

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playBeep() {
    if (!audioCtx) return;
    try {
      const ctx = audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }

  const MODES = {
    focus: {
      time: 25 * 60,
      key: "focus",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    short: {
      time: 5 * 60,
      key: "shortBreak",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    long: {
      time: 15 * 60,
      key: "longBreak",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  };

  function toggleTimer() {
    initAudio();
    if (isRunning) {
      clearInterval(timerInterval);
      isRunning = false;
    } else {
      const targetTime = Date.now() + timeLeft * 1000;

      timerInterval = setInterval(() => {
        const now = Date.now();
        const diff = Math.ceil((targetTime - now) / 1000);

        if (diff <= 0) {
          timeLeft = 0;
          clearInterval(timerInterval);
          isRunning = false;
          playBeep();
        } else {
          timeLeft = diff;
        }
      }, 1000);
      isRunning = true;
    }
  }

  function setMode(newMode: "focus" | "short" | "long") {
    mode = newMode;
    timeLeft = MODES[newMode].time;
    isRunning = false;
    if (timerInterval) clearInterval(timerInterval);
  }

  function reset() {
    timeLeft = MODES[mode].time;
    isRunning = false;
    if (timerInterval) clearInterval(timerInterval);
  }

  $: faqItems = [
    { q: dictionary.q1, a: dictionary.a1 },
    { q: dictionary.q2, a: dictionary.a2 },
    { q: dictionary.q3, a: dictionary.a3 },
  ];

  $: appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "isAccessibleForFree": true,
    "name": dictionary.title,
    "description": dictionary.description,
    "applicationCategory": "ProductivityApplication",
    "applicationSubCategory": "Time Management",
    "operatingSystem": "Web, iOS, Android, macOS, Windows, Linux",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "keywords": "Pomodoro Timer, Focus Timer, Productivity Tool, Time Management",
    "featureList": "Customizable Timer Intervals, Focus Mode, Audio Notifications, Responsive Design"
  };

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://selfgrowingmicrotool.com/"
    }, {
      "@type": "ListItem",
      "position": 2,
      "name": "Tools",
      "item": "https://selfgrowingmicrotool.com/tools"
    }, {
      "@type": "ListItem",
      "position": 3,
      "name": dictionary.title,
      "item": `https://selfgrowingmicrotool.com/${lang}/tools/pomodoro-timer`
    }]
  };

    $: faqSchema = {
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

  $: schemaList = [appSchema, breadcrumbSchema, faqSchema];
</script>
<Head
  title={dictionary.title}
  description={dictionary.description}
/>


<svelte:head>
                {@html '<script type="application/ld+json">' + JSON.stringify(schemaList) + '</script>'}



</svelte:head>

<div class="max-w-2xl mx-auto text-center space-y-12 py-12 px-4">
  <div class="space-y-4">
    <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">
      {dictionary.title}
    </h1>
    <p class="text-gray-500">
      {dictionary.description}
    </p>
  </div>

  <div
    class="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-12 space-y-12 relative overflow-hidden"
  >
    <!-- Background Decor -->
    <div
      class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
    ></div>

    <!-- Mode Selector -->
    <div
      class="flex flex-wrap justify-center gap-2 p-1 bg-gray-100 rounded-xl w-fit mx-auto"
    >
      {#each Object.keys(MODES) as m}
        {@const modeKey = m as keyof typeof MODES}
        <button
          on:click={() => setMode(modeKey)}
          class="min-h-[44px] min-w-[44px] px-4 py-2 sm:px-6 sm:py-2 rounded-lg text-sm font-medium transition-all {mode ===
          modeKey
            ? 'bg-white text-gray-900 shadow-sm ring-2 ring-indigo-500 ring-offset-1'
            : 'text-gray-500 hover:text-gray-900'}"
        >
          {dict[MODES[modeKey].key]}
        </button>
      {/each}
    </div>

    <!-- Timer Display -->
    <div class="relative" aria-label="Time remaining">
      <div
        class="text-6xl sm:text-8xl md:text-9xl font-mono font-bold tracking-tighter tabular-nums {MODES[
          mode
        ].color} transition-colors duration-500"
      >
        {formatTime(timeLeft)}
      </div>
      <div
        class="text-xs sm:text-sm uppercase tracking-widest text-gray-400 font-semibold mt-4"
      >
        {isRunning
          ? dictionary.running
          : dictionary.paused}
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center gap-6">
      <button
        on:click={toggleTimer}
        class="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all min-h-[44px]"
        aria-label={isRunning ? dictionary.pauseAction : dictionary.startAction}
      >
        {#if isRunning}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-pause"
            ><rect width="4" height="16" x="6" y="4" /><rect
              width="4"
              height="16"
              x="14"
              y="4"
            /></svg
          >
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-play ml-1"
            ><polygon points="6 3 20 12 6 21 6 3" /></svg
          >
        {/if}
      </button>

      <button
        on:click={reset}
        class="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors min-h-[44px]"
        aria-label={dictionary.reset}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-rotate-ccw"
          ><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" /><path
            d="M3 3v9h9"
          /></svg
        >
      </button>
    </div>
  </div>

  <GuideSection {...dictionary.guide} />

  <FAQSection title={dictionary.faqTitle} items={faqItems} />
</div>
