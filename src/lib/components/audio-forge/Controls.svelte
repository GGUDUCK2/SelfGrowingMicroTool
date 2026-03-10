<script lang="ts">
  import { Play, Pause, Square, Mic, ZoomIn, ZoomOut } from 'lucide-svelte';

  export let isPlaying = false;
  export let isRecording = false;
  export let currentTime = 0;
  export let duration = 0;
  export let zoom = 100;
  export let dict: any;

  export let onPlay: () => void;
  export let onPause: () => void;
  export let onStop: () => void;
  export let onRecord: () => void;

  function formatTime(s: number) {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      const ms = Math.floor((s % 1) * 100);
      return `${m}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
</script>

<div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
    <div class="flex items-center gap-2">
        <button
            on:click={isPlaying ? onPause : onPlay}
            class="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
            disabled={isRecording}
            aria-label={isPlaying ? dict.actions.pause : dict.actions.play}
            title={isPlaying ? dict.actions.pause : dict.actions.play}
        >
            {#if isPlaying}
                <Pause class="w-6 h-6" />
            {:else}
                <Play class="w-6 h-6 ml-1" />
            {/if}
        </button>

        <button
            on:click={onStop}
            class="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            disabled={isRecording}
            aria-label={dict.actions.stop}
            title={dict.actions.stop}
        >
            <Square class="w-5 h-5" />
        </button>

        <button
            on:click={onRecord}
            class="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full {isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'} transition-all"
            aria-label={dict.actions.record}
            title={dict.actions.record}
        >
            <Mic class="w-5 h-5" />
        </button>
    </div>

    <div class="font-mono text-xl font-bold text-slate-700 dark:text-slate-200 tabular-nums">
        {formatTime(currentTime)} <span class="text-slate-400 text-sm">/ {formatTime(duration)}</span>
    </div>

    <div class="flex items-center gap-2 text-slate-500">
        <ZoomOut class="w-4 h-4" />
        <input
            type="range"
            min="10"
            max="500"
            bind:value={zoom}
            class="w-32 h-2 min-h-[44px] bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            aria-label="Zoom"
        />
        <ZoomIn class="w-4 h-4" />
    </div>
</div>
