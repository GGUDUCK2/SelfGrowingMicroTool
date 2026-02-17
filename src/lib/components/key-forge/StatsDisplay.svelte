<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { KeyForgeState } from '$lib/utils/key-forge/types';

  export let state: KeyForgeState;

  let points = "";

  $: if (state.isFinished && state.startTime && state.endTime && state.keystrokes.length > 0) {
      const totalDuration = (state.endTime - state.startTime) / 1000;

      const data = state.keystrokes.map((t, i) => {
         if (i === 0) return { x: 0, y: 0 };
         const time = (t - state.startTime!) / 1000;
         // Rolling WPM (last 10 chars) for smoother graph? Or cumulative?
         // Cumulative WPM: (chars / 5) / (time / 60)
         const wpm = (i / 5) / (time / 60);
         return { x: time, y: wpm };
      }).filter(p => p.x > 0 && isFinite(p.y));

      const maxWpm = Math.max(...data.map(d => d.y), 100);

      points = data.map(d => {
          const x = (d.x / totalDuration) * 100;
          const y = 100 - ((d.y / maxWpm) * 100);
          return `${x},${y}`;
      }).join(' ');
  }
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-8">
    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center transform hover:scale-105 transition-transform duration-200">
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">WPM</span>
        <span class="text-4xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{state.wpm}</span>
        <span class="text-xs text-slate-400 mt-1">Raw: {state.rawWpm}</span>
    </div>
    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center transform hover:scale-105 transition-transform duration-200">
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Accuracy</span>
        <span class="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{state.accuracy}%</span>
        <span class="text-xs text-slate-400 mt-1">Target: 100%</span>
    </div>
    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center transform hover:scale-105 transition-transform duration-200">
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Consistency</span>
        <span class="text-4xl font-black text-amber-600 dark:text-amber-400 tabular-nums">{state.consistency}%</span>
        <span class="text-xs text-slate-400 mt-1">Std Dev</span>
    </div>
    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center transform hover:scale-105 transition-transform duration-200">
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Time</span>
        <span class="text-4xl font-black text-red-600 dark:text-red-400 tabular-nums">
            {state.mode === 'time' ? state.timeRemaining : Math.round((Date.now() - (state.startTime || Date.now())) / 1000)}s
        </span>
        <span class="text-xs text-slate-400 mt-1">Errors: {state.errors}</span>
    </div>
</div>

{#if state.isFinished && points}
    <div class="w-full max-w-4xl bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8" transition:fade>
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Session Performance
        </h3>
        <div class="h-48 relative w-full overflow-hidden">
             <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <defs>
                     <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                         <stop offset="0%" stop-color="currentColor" class="text-indigo-500" stop-opacity="0.5" />
                         <stop offset="100%" stop-color="currentColor" class="text-indigo-500" stop-opacity="0" />
                     </linearGradient>
                 </defs>
                 <path d={`M0,100 ${points} L100,100 Z`} fill="url(#gradient)" />
                 <path d={`M0,100 ${points}`} fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-500" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
             </svg>
        </div>
        <div class="flex justify-between text-xs text-slate-400 mt-2">
            <span>Start</span>
            <span>Duration: {((state.endTime - state.startTime) / 1000).toFixed(1)}s</span>
            <span>Finish</span>
        </div>
    </div>
{/if}
