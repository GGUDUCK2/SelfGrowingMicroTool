<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Play, Square, Minus, Plus, Volume2 } from 'lucide-svelte';
  import type { RhythmSettings } from '$lib/utils/rhythm-forge/types';

  export let settings: RhythmSettings;
  export let dict: any;

  const dispatch = createEventDispatcher();

  let tapTimes: number[] = [];

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

  function adjustBpm(amount: number) {
      settings.bpm = Math.max(30, Math.min(300, settings.bpm + amount));
  }

  function togglePlay() {
      if (settings.isPlaying) {
          dispatch('stop');
      } else {
          dispatch('play');
      }
  }
</script>

<div class="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto p-6">

    <!-- Main Play/Stop -->
    <button
        on:click={togglePlay}
        class="w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-105 active:scale-95 {settings.isPlaying ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30' : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/30'}"
        aria-label={settings.isPlaying ? dict.stop : dict.play}
    >
        {#if settings.isPlaying}
            <Square size={32} fill="currentColor" />
        {:else}
            <Play size={40} fill="currentColor" class="ml-1" />
        {/if}
    </button>

    <!-- BPM Control -->
    <div class="flex flex-col items-center w-full gap-4">
        <div class="flex items-center gap-6">
            <button
                class="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                on:click={() => adjustBpm(-1)}
                aria-label="Decrease BPM"
            >
                <Minus size={24} />
            </button>

            <div class="text-center">
                <div class="text-6xl font-black text-slate-800 dark:text-white tabular-nums tracking-tighter">
                    {settings.bpm}
                </div>
                <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {dict.bpm}
                </div>
            </div>

            <button
                class="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                on:click={() => adjustBpm(1)}
                aria-label="Increase BPM"
            >
                <Plus size={24} />
            </button>
        </div>

        <input
            type="range"
            min="30"
            max="300"
            bind:value={settings.bpm}
            class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            aria-label="BPM Slider"
        />
    </div>

    <!-- Secondary Controls -->
    <div class="flex items-center justify-between w-full max-w-sm gap-4">
        <!-- Tap Tempo -->
        <button
            class="flex-1 py-3 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:border-indigo-500 hover:text-indigo-500 transition-colors active:bg-indigo-50 dark:active:bg-indigo-900/20"
            on:click={handleTap}
            aria-label="Tap Tempo"
        >
            {dict.tap}
        </button>

        <!-- Volume -->
        <div class="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl flex-1 justify-center">
            <Volume2 size={20} class="text-slate-400" />
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                bind:value={settings.volume}
                class="w-20 accent-indigo-500 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none"
                aria-label="Volume"
            />
        </div>
    </div>
</div>
