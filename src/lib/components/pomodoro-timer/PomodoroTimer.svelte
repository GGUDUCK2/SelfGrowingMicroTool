<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { db } from "$lib/db";
  import { formatTime } from "$lib/utils";


  export let dict: any;


  // Timer State
  let timeLeft = 25 * 60;
  let isRunning = false;
  let mode: "focus" | "short" | "long" = "focus";
  let timerInterval: NodeJS.Timeout | undefined;
  let audioCtx: AudioContext | null = null;
  let history: { id?: number; data: any; createdAt: Date }[] = [];

  onMount(() => {
    loadHistory();
    window.addEventListener("keydown", handleKeydown);
    return () => {
      if (audioCtx) {
        audioCtx.close();
      }
      if (timerInterval) clearInterval(timerInterval);
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  async function loadHistory() {
    try {
      const items = await db.pomodoroHistory
        .orderBy('createdAt')
        .reverse()
        .toArray();

      history = items.map(item => ({
        id: item.id,
        createdAt: item.createdAt,
        data: {
          mode: item.mode,
          duration: item.duration,
          starred: item.starred
        }
      }));
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }

  async function saveToHistory(completedMode: string, durationMinutes: number) {
    try {
      await db.pomodoroHistory.add({
        mode: completedMode,
        duration: durationMinutes,
        createdAt: new Date(),
        starred: 0
      });
      await loadHistory();
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  }

  async function deleteHistory(id: number) {
    try {
      await db.pomodoroHistory.delete(id);
      await loadHistory();
    } catch (error) {
      console.error("Failed to delete history:", error);
    }
  }

  function restoreHistory(item: any) {
    // maybe set mode based on restored item
    if (item.data.mode === 'focus' || item.data.mode === 'short' || item.data.mode === 'long') {
      setMode(item.data.mode as any);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    // Don't trigger if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      toggleTimer();
    } else if (e.key.toLowerCase() === "r") {
      e.preventDefault();
      reset();
    } else if (e.key === "1") {
      e.preventDefault();
      setMode("focus");
    } else if (e.key === "2") {
      e.preventDefault();
      setMode("short");
    } else if (e.key === "3") {
      e.preventDefault();
      setMode("long");
    }
  }

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
          saveToHistory(mode, MODES[mode].time / 60);

          // Smart default logic:
          if (mode === "focus") {
              setMode("short");
          } else {
              setMode("focus");
          }
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

</script>

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
          ? dict.running
          : dict.paused}
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center gap-6">
      <button
        on:click={toggleTimer}
        class="h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all min-h-[44px] min-w-[44px]"
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
        class="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors min-h-[44px] min-w-[44px]"
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

  <div class="mt-8 text-sm text-gray-500 hidden md:block">
      Pro Tip: Press <kbd class="px-2 py-1 bg-gray-100 rounded-md border text-xs">Space</kbd> to toggle, <kbd class="px-2 py-1 bg-gray-100 rounded-md border text-xs">R</kbd> to reset, <kbd class="px-2 py-1 bg-gray-100 rounded-md border text-xs">1-3</kbd> for modes.
  </div>

  {#if history.length > 0}
      <div transition:fade class="mt-12">
        <div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                class="lucide lucide-history"
            >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
                <path d="M3 3v9h9" />
                <path d="M12 7v5l4 2" />
            </svg>
            Recent Activities
            </h3>
            <div class="space-y-3">
            {#each history as item (item.id)}
                <div
                class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                <button
                    class="text-left cursor-pointer flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 min-h-[44px]"
                    on:click={() => restoreHistory(item)}
                >
                    <div class="font-medium text-gray-900 capitalize">
                      {dict[MODES[item.data.mode as keyof typeof MODES]?.key] || item.data.mode} - {item.data.duration} min
                    </div>
                    <div class="text-xs text-gray-400 mt-1">
                      {item.createdAt.toLocaleString()}
                    </div>
                </button>
                <button
                    on:click={() => item.id && deleteHistory(item.id)}
                    class="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
                    aria-label="Delete"
                >
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-trash-2"
                    >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                </button>
                </div>
            {/each}
            </div>
        </div>
      </div>
  {/if}

</div>
