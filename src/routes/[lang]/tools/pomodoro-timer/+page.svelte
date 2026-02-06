<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { PageData } from "./$types";
  import { formatTime } from "$lib/utils";
  import { dictionaries } from "$lib/dictionaries";
  import FAQSection from "$lib/components/FAQSection.svelte";

  export let data: PageData;

  type Language = "en" | "ko";
  $: lang = data.lang as Language;
  $: dict = dictionaries[lang]?.tools?.pomodoroTimer || dictionaries.en.tools.pomodoroTimer;

  // Timer State
  let timeLeft = 25 * 60;
  let isRunning = false;
  let mode: "focus" | "short" | "long" = "focus";
  let timerInterval: NodeJS.Timeout | undefined;

  onMount(() => {
    // No-op for now, audio is handled via Web Audio API on demand
  });

  function playBeep() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
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

      setTimeout(() => {
        ctx.close();
      }, 600);
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
    if (isRunning) {
      clearInterval(timerInterval);
    } else {
      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
        } else {
          clearInterval(timerInterval);
          isRunning = false;
          // Play notification sound
          playBeep();
        }
      }, 1000);
    }
    isRunning = !isRunning;
  }

  function setMode(newMode: "focus" | "short" | "long") {
    mode = newMode;
    timeLeft = MODES[newMode].time;
    isRunning = false;
    clearInterval(timerInterval);
  }

  function reset() {
    timeLeft = MODES[mode].time;
    isRunning = false;
    clearInterval(timerInterval);
  }

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
  });

  $: faqItems = [
    { q: dict.q1, a: dict.a1 },
    { q: dict.q2, a: dict.a2 },
    { q: dict.q3, a: dict.a3 },
  ];

  $: appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": dict.title,
    "description": dict.description,
    "applicationCategory": "ProductivityApplication",
    "applicationSubCategory": "Time Management",
    "operatingSystem": ["Web", "iOS", "Android", "macOS", "Windows", "Linux"],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Customizable Timer Intervals",
      "Focus, Short Break, and Long Break Modes",
      "Audio Notifications",
      "Responsive Design"
    ]
  };

  $: faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
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
      "name": dict.title,
      "item": `https://selfgrowingmicrotool.com/${lang}/tools/pomodoro-timer`
    }]
  };

  $: schemaList = [appSchema, faqSchema, breadcrumbSchema];
</script>

<svelte:head>
  <title>{dict.title} - MicroFactory</title>
  <meta name="description" content={dict.description} />
  <link rel="canonical" href={`https://selfgrowingmicrotool.com/${lang}/tools/pomodoro-timer`} />
  <meta property="og:title" content={dict.title} />
  <meta property="og:description" content={dict.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={`https://selfgrowingmicrotool.com/${lang}/tools/pomodoro-timer`} />
  {@html `<script type="application/ld+json">${JSON.stringify(schemaList)}</script>`}
</svelte:head>

<div class="max-w-2xl mx-auto text-center space-y-12 py-12 px-4">
  <div class="space-y-4">
    <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">
      {dict.title}
    </h1>
    <p class="text-gray-500">
      {dict.description}
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
          class="px-4 py-2 sm:px-6 sm:py-2 rounded-lg text-sm font-medium transition-all {mode ===
          modeKey
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-900'}"
        >
          {dict[MODES[modeKey].key]}
        </button>
      {/each}
    </div>

    <!-- Timer Display -->
    <div class="relative">
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
          ? dict.running
          : dict.paused}
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center gap-6">
      <button
        on:click={toggleTimer}
        class="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
        aria-label={isRunning ? dict.pauseAction : dict.startAction}
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
        class="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        aria-label={dict.reset}
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

  <FAQSection title={dict.faqTitle} items={faqItems} />
</div>
