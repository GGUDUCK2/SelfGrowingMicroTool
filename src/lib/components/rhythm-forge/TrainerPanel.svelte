<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { MetronomeEngine } from '$lib/utils/rhythm-forge/audio';
  import { Play, Square, Target, Activity, Trophy } from 'lucide-svelte';
  import { db } from '$lib/db';
  import type { RhythmSettings, RhythmForgeDictionary } from '$lib/utils/rhythm-forge/types';

  export let engine: MetronomeEngine;
  export let settings: RhythmSettings;
  export let dict: RhythmForgeDictionary;

  let isTraining = false;
  let feedback: { text: string; color: string; delta: number } = { text: '', color: 'text-slate-400', delta: 0 };
  let stats = {
      hits: 0,
      misses: 0,
      perfect: 0,
      totalOffset: 0,
      streak: 0,
      bestStreak: 0
  };
  let sessionStart: number = 0;

  function startTraining() {
      isTraining = true;
      resetStats();
      sessionStart = Date.now();
      if (!settings.isPlaying) {
          engine.start(); // Auto-start engine
      }
      // Force settings update to ensure playing state is synced
      settings.isPlaying = true;
  }

  function stopTraining() {
      if (isTraining) {
          saveSession();
      }
      isTraining = false;
      feedback = { text: '', color: 'text-slate-400', delta: 0 };
  }

  function resetStats() {
      stats = { hits: 0, misses: 0, perfect: 0, totalOffset: 0, streak: 0, bestStreak: 0 };
  }

  async function saveSession() {
      if (stats.hits + stats.misses < 5) return; // Ignore short sessions

      const duration = (Date.now() - sessionStart) / 1000;
      const accuracy = stats.hits + stats.misses > 0
        ? Math.round((stats.perfect + (stats.hits - stats.perfect) * 0.5) / (stats.hits + stats.misses) * 100)
        : 0;
      const avgOffset = stats.hits > 0 ? Math.round(stats.totalOffset / stats.hits) : 0;

      try {
          await db.rhythmForgeSessions.add({
              bpm: settings.bpm,
              duration,
              accuracy,
              avgOffset,
              createdAt: new Date()
          });
      } catch (e) {
          console.error('Failed to save session', e);
      }
  }

  function handleTap() {
      if (!isTraining || !engine) return;

      const result = engine.getNearestBeatDelta();
      if (!result) return;

      const absDelta = Math.abs(result.delta);
      const isEarly = result.delta < 0;

      // Type assertion for optional chaining if needed
      const trainerDict = (dict as any).rhythmTrainer;

      if (absDelta < 25) {
          feedback = { text: trainerDict?.perfect || 'Perfect!', color: 'text-emerald-500', delta: result.delta };
          stats.perfect++;
          stats.hits++;
          stats.streak++;
          stats.totalOffset += absDelta;
      } else if (absDelta < 60) {
          feedback = { text: trainerDict?.great || 'Great', color: 'text-blue-500', delta: result.delta };
          stats.hits++;
          stats.streak++;
          stats.totalOffset += absDelta;
      } else if (absDelta < 120) {
          feedback = { text: isEarly ? (trainerDict?.early || 'Early') : (trainerDict?.late || 'Late'), color: 'text-amber-500', delta: result.delta };
          stats.hits++;
          stats.streak = 0;
          stats.totalOffset += absDelta;
      } else {
          feedback = { text: trainerDict?.miss || 'Miss', color: 'text-rose-500', delta: result.delta };
          stats.misses++;
          stats.streak = 0;
      }

      if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
  }

  function handleKeydown(e: KeyboardEvent) {
      if (isTraining && e.code === 'Space') {
          e.preventDefault();
          handleTap();
      }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
    <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <Target class="text-indigo-500" />
            {(dict as any).rhythmTrainer?.title || 'Rhythm Trainer'}
        </h3>

        <button
            class="px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 {isTraining ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30'}"
            on:click={isTraining ? stopTraining : startTraining}
        >
            {#if isTraining}
                <Square size={18} fill="currentColor" />
                {(dict as any).rhythmTrainer?.stop || 'Stop'}
            {:else}
                <Play size={18} fill="currentColor" />
                {(dict as any).rhythmTrainer?.start || 'Start Training'}
            {/if}
        </button>
    </div>

    {#if isTraining}
        <div class="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <!-- Feedback Display -->
            <div class="h-32 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                {#if feedback.text}
                    {#key stats.hits + stats.misses}
                        <div class="text-4xl font-black {feedback.color} scale-100 transition-transform duration-75">
                            {feedback.text}
                        </div>
                    {/key}
                    <div class="text-sm font-mono text-slate-400 mt-2">
                        {feedback.delta > 0 ? '+' : ''}{Math.round(feedback.delta)}ms
                    </div>
                    <!-- Visual Bar -->
                    <div class="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-200 dark:bg-slate-800">
                        <div
                            class="absolute top-0 bottom-0 w-1 rounded-full transition-all duration-100 {feedback.color.replace('text-', 'bg-')}"
                            style="left: {50 + (feedback.delta / 2)}%"
                        ></div>
                        <div class="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400 -translate-x-1/2"></div>
                    </div>
                {:else}
                    <span class="text-slate-400 text-sm">Press Space or Tap to start</span>
                {/if}
            </div>

            <!-- Tap Button (Mobile) -->
            <button
                class="w-full py-8 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors active:scale-95"
                on:touchstart|preventDefault={handleTap}
                on:mousedown|preventDefault={handleTap}
            >
                Tap Here / Press Space
            </button>

            <!-- Stats Grid -->
            <div class="grid grid-cols-3 gap-4">
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                    <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Accuracy</div>
                    <div class="text-2xl font-black text-slate-800 dark:text-white">
                        {stats.hits + stats.misses > 0 ? Math.round((stats.perfect + (stats.hits - stats.perfect)*0.5) / (stats.hits + stats.misses) * 100) : 0}%
                    </div>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                    <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Streak</div>
                    <div class="text-2xl font-black text-emerald-500">
                        {stats.streak}
                    </div>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                    <div class="text-xs text-slate-500 uppercase tracking-wider mb-1">Offset</div>
                    <div class="text-2xl font-black text-slate-800 dark:text-white">
                        {stats.hits > 0 ? Math.round(stats.totalOffset / stats.hits) : 0}<span class="text-sm font-normal text-slate-400 ml-1">ms</span>
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <!-- Dashboard / History Summary -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div class="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                 <div class="flex items-center gap-2 mb-2 opacity-80">
                     <Trophy size={18} />
                     <span class="text-sm font-bold">Best Streak</span>
                 </div>
                 <div class="text-4xl font-black">{stats.bestStreak}</div>
             </div>

             <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-center">
                 <div class="text-slate-500 dark:text-slate-400 text-sm">
                    Start training to track your precision and improve your timing.
                 </div>
             </div>
        </div>
    {/if}
</div>
