<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { MetronomeEngine } from '$lib/utils/rhythm-forge/audio';
  import { Play, Square, Trophy, Target, Zap, RotateCcw } from 'lucide-svelte';
  import type { RhythmSettings, RhythmForgeDictionary } from '$lib/utils/rhythm-forge/types';
  import { fade, scale, fly } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';

  export let engine: MetronomeEngine;
  export let settings: RhythmSettings;

  let gameState: 'idle' | 'playing' | 'summary' = 'idle';
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let multiplier = 1;
  let health = 100;

  let feedback: { text: string; color: string; id: number } | null = null;
  let feedbackCounter = 0;

  let stats = {
      perfect: 0,
      great: 0,
      good: 0,
      miss: 0
  };

  const DIFFICULTY = {
      easy: { window: 120, drain: 5, heal: 5 },
      medium: { window: 80, drain: 10, heal: 3 },
      hard: { window: 40, drain: 15, heal: 2 }
  };
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';

  function startGame() {
      gameState = 'playing';
      score = 0;
      combo = 0;
      multiplier = 1;
      health = 100;
      stats = { perfect: 0, great: 0, good: 0, miss: 0 };

      if (!settings.isPlaying) {
          engine.start();
          settings.isPlaying = true;
      }
  }

  function stopGame(surrendered = false) {
      gameState = 'summary';
      settings.isPlaying = false;
      engine.stop();
  }

  function handleTap() {
      if (gameState !== 'playing') return;

      const result = engine.getNearestBeatDelta();
      if (!result) return;

      const absDelta = Math.abs(result.delta);
      const diff = DIFFICULTY[difficulty];

      let hitType: 'perfect' | 'great' | 'good' | 'miss' = 'miss';
      let points = 0;

      if (absDelta < diff.window / 3) {
          hitType = 'perfect';
          points = 300;
          stats.perfect++;
          health = Math.min(100, health + diff.heal);
      } else if (absDelta < diff.window / 1.5) {
          hitType = 'great';
          points = 100;
          stats.great++;
          health = Math.min(100, health + diff.heal / 2);
      } else if (absDelta < diff.window) {
          hitType = 'good';
          points = 50;
          stats.good++;
      } else {
          hitType = 'miss';
          stats.miss++;
          health = Math.max(0, health - diff.drain);
      }

      if (hitType === 'miss') {
          combo = 0;
          multiplier = 1;
      } else {
          combo++;
          if (combo > maxCombo) maxCombo = combo;
          multiplier = 1 + Math.floor(combo / 10) * 0.1;
      }

      score += Math.round(points * multiplier);

      showFeedback(hitType);

      if (health <= 0) {
          stopGame();
      }
  }

  function showFeedback(type: string) {
      let text = '';
      let color = '';

      switch (type) {
          case 'perfect': text = 'PERFECT!'; color = 'text-emerald-400'; break;
          case 'great': text = 'GREAT'; color = 'text-blue-400'; break;
          case 'good': text = 'GOOD'; color = 'text-amber-400'; break;
          case 'miss': text = 'MISS'; color = 'text-rose-500'; break;
      }

      feedback = { text, color, id: feedbackCounter++ };
  }

  function handleKeydown(e: KeyboardEvent) {
      if (e.code === 'Space') {
          e.preventDefault();
          if (gameState === 'idle') startGame();
          else if (gameState === 'playing') handleTap();
          else if (gameState === 'summary') startGame();
      }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="relative bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 overflow-hidden min-h-[400px] flex flex-col">
    <!-- Background Pulse Effect -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-50 pointer-events-none"></div>

    {#if gameState === 'idle'}
        <div class="flex-1 flex flex-col items-center justify-center space-y-8 z-10" in:fade>
            <div class="text-center space-y-2">
                <Trophy class="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 class="text-3xl font-black text-white tracking-tight">Rhythm Game</h2>
                <p class="text-slate-400">Test your timing precision</p>
            </div>

            <div class="flex gap-2 bg-slate-800/50 p-1 rounded-xl">
                {#each Object.keys(DIFFICULTY) as d}
                    <button
                        class="px-4 py-2 rounded-lg font-bold text-sm capitalize transition-all {difficulty === d ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}"
                        on:click={() => difficulty = d}
                    >
                        {d}
                    </button>
                {/each}
            </div>

            <button
                class="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                on:click={startGame}
            >
                <Play size={24} fill="currentColor" />
                Start Game
            </button>
        </div>

    {:else if gameState === 'playing'}
        <div class="flex-1 flex flex-col z-10 relative">
            <!-- Header HUD -->
            <div class="flex justify-between items-start mb-8">
                <div>
                    <div class="text-xs font-bold text-slate-500 uppercase">Score</div>
                    <div class="text-3xl font-black text-white tabular-nums">{score.toLocaleString()}</div>
                </div>
                <div class="text-center">
                    <div class="text-xs font-bold text-slate-500 uppercase">Combo</div>
                    <div class="text-4xl font-black text-indigo-400 tabular-nums scale-100 transition-transform" class:scale-125={combo % 10 === 0 && combo > 0}>
                        {combo}x
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-xs font-bold text-slate-500 uppercase">Health</div>
                    <div class="w-32 h-4 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                            class="h-full transition-all duration-300 {health > 50 ? 'bg-emerald-500' : health > 20 ? 'bg-amber-500' : 'bg-rose-500'}"
                            style="width: {health}%"
                        ></div>
                    </div>
                </div>
            </div>

            <!-- Main Feedback Area -->
            <div class="flex-1 flex items-center justify-center relative">
                {#if feedback}
                    {#key feedback.id}
                        <div
                            class="absolute text-5xl md:text-7xl font-black {feedback.color} drop-shadow-lg tracking-tighter"
                            in:scale={{ duration: 150, start: 0.5, easing: elasticOut }}
                            out:fade={{ duration: 100 }}
                        >
                            {feedback.text}
                        </div>
                    {/key}
                {/if}

                <!-- Tap Area (Visual Guide) -->
                <button
                    class="w-48 h-48 rounded-full border-4 border-slate-700 hover:border-indigo-500/50 active:border-indigo-500 active:bg-indigo-500/10 transition-all flex items-center justify-center group"
                    on:click={handleTap}
                >
                    <div class="text-slate-600 group-hover:text-slate-400 font-bold">TAP / SPACE</div>
                </button>
            </div>

            <!-- Footer Controls -->
            <div class="flex justify-center mt-8">
                <button
                    class="text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-2 text-sm font-bold"
                    on:click={() => stopGame(true)}
                >
                    <Square size={16} fill="currentColor" />
                    Give Up
                </button>
            </div>
        </div>

    {:else if gameState === 'summary'}
        <div class="flex-1 flex flex-col items-center justify-center space-y-8 z-10" in:fly={{ y: 20, duration: 300 }}>
            <div class="text-center">
                <div class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Game Over</div>
                <h2 class="text-5xl font-black text-white mb-2">{score.toLocaleString()}</h2>
                <div class="text-indigo-400 font-bold">New High Score!</div> <!-- Placeholder logic -->
            </div>

            <div class="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div class="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
                    <div class="text-emerald-400 font-black text-xl">{stats.perfect}</div>
                    <div class="text-xs text-slate-500 uppercase">Perfect</div>
                </div>
                <div class="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
                    <div class="text-blue-400 font-black text-xl">{stats.great}</div>
                    <div class="text-xs text-slate-500 uppercase">Great</div>
                </div>
                <div class="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
                    <div class="text-amber-400 font-black text-xl">{stats.good}</div>
                    <div class="text-xs text-slate-500 uppercase">Good</div>
                </div>
                <div class="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
                    <div class="text-rose-400 font-black text-xl">{stats.miss}</div>
                    <div class="text-xs text-slate-500 uppercase">Miss</div>
                </div>
            </div>

            <div class="flex gap-4">
                <button
                    class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                    on:click={() => gameState = 'idle'}
                >
                    Menu
                </button>
                <button
                    class="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                    on:click={startGame}
                >
                    <RotateCcw size={18} />
                    Retry
                </button>
            </div>
        </div>
    {/if}
</div>
