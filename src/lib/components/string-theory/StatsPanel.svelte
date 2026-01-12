<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { TextStats } from '$lib/utils/string-theory/types';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  export let stats: TextStats;

  $: dict = getDictionary($page.params.lang || 'en').tools.stringTheory.stats;

  function formatNumber(num: number): string {
    return new Intl.NumberFormat($page.params.lang || 'en').format(num);
  }

  function formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4" in:fade>
  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
    <div class="text-sm text-slate-500 dark:text-slate-400">{dict.words}</div>
    <div class="text-2xl font-bold text-slate-800 dark:text-white">{formatNumber(stats.words)}</div>
  </div>

  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
    <div class="text-sm text-slate-500 dark:text-slate-400">{dict.chars}</div>
    <div class="text-2xl font-bold text-slate-800 dark:text-white">{formatNumber(stats.chars)}</div>
  </div>

  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
    <div class="text-sm text-slate-500 dark:text-slate-400">{dict.lines}</div>
    <div class="text-2xl font-bold text-slate-800 dark:text-white">{formatNumber(stats.lines)}</div>
  </div>

  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
    <div class="text-sm text-slate-500 dark:text-slate-400">{dict.paragraphs}</div>
    <div class="text-2xl font-bold text-slate-800 dark:text-white">{formatNumber(stats.paragraphs)}</div>
  </div>

  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
    <div class="text-sm text-slate-500 dark:text-slate-400">{dict.bytes}</div>
    <div class="text-2xl font-bold text-slate-800 dark:text-white">{formatNumber(stats.bytes)}</div>
  </div>

  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
    <div class="text-sm text-slate-500 dark:text-slate-400">{dict.sentences}</div>
    <div class="text-2xl font-bold text-slate-800 dark:text-white">{formatNumber(stats.sentences)}</div>
  </div>

  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
    <div class="text-sm text-slate-500 dark:text-slate-400">{dict.readingTime}</div>
    <div class="text-2xl font-bold text-slate-800 dark:text-white">{formatTime(stats.readingTime)}</div>
  </div>

  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
    <div class="text-sm text-slate-500 dark:text-slate-400">{dict.speakingTime}</div>
    <div class="text-2xl font-bold text-slate-800 dark:text-white">{formatTime(stats.speakingTime)}</div>
  </div>
</div>
