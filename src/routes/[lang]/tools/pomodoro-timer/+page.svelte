<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fade, scale } from "svelte/transition";
  import type { PageData } from "./$types";

  export let data: PageData;

  type Language = "en" | "ko";
  $: lang = data.lang as Language;

  // Timer State
  let timeLeft = 25 * 60;
  let isRunning = false;
  let mode: "focus" | "short" | "long" = "focus";
  let timerInterval: NodeJS.Timeout | undefined;

  const MODES = {
    focus: {
      time: 25 * 60,
      label: { en: "Focus", ko: "집중" },
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    short: {
      time: 5 * 60,
      label: { en: "Short Break", ko: "짧은 휴식" },
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    long: {
      time: 15 * 60,
      label: { en: "Long Break", ko: "긴 휴식" },
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  };

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

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
          // 알림 소리 재생 등
          new Audio("/notification.mp3").play().catch(() => {});
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
</script>

<div class="max-w-2xl mx-auto text-center space-y-12 py-12">
  <div class="space-y-4">
    <h1 class="text-4xl font-bold text-gray-900">
      {lang === "ko" ? "뽀모도로 타이머" : "Pomodoro Timer"}
    </h1>
    <p class="text-gray-500">
      {lang === "ko"
        ? "25분 집중하고 5분 쉬는 효율적인 시간 관리"
        : "Boost productivity with the 25/5 technique"}
    </p>
  </div>

  <div
    class="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 space-y-12 relative overflow-hidden"
  >
    <!-- Background Decor -->
    <div
      class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
    ></div>

    <!-- Mode Selector -->
    <div
      class="flex justify-center gap-2 p-1 bg-gray-100 rounded-xl w-fit mx-auto"
    >
      {#each Object.keys(MODES) as m}
        {@const modeKey = m as keyof typeof MODES}
        <button
          on:click={() => setMode(modeKey)}
          class="px-6 py-2 rounded-lg text-sm font-medium transition-all {mode ===
          modeKey
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-900'}"
        >
          {MODES[modeKey].label[lang]}
        </button>
      {/each}
    </div>

    <!-- Timer Display -->
    <div class="relative">
      <div
        class="text-9xl font-mono font-bold tracking-tighter tabular-nums {MODES[
          mode
        ].color} transition-colors duration-500"
      >
        {formatTime(timeLeft)}
      </div>
      <div
        class="text-sm uppercase tracking-widest text-gray-400 font-semibold mt-4"
      >
        {isRunning
          ? lang === "ko"
            ? "집중 중..."
            : "RUNNING"
          : lang === "ko"
            ? "일시정지"
            : "PAUSED"}
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center gap-6">
      <button
        on:click={toggleTimer}
        class="h-16 w-16 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
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
        class="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        aria-label="Reset"
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
</div>
