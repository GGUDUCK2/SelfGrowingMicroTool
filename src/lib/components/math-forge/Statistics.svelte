<script lang="ts">
  import { Statistics } from '$lib/utils/math-forge/engine';
  import { Calculator, BarChart3, List } from 'lucide-svelte';

  export let dict: any;

  let input = '10, 20, 25, 45, 60, 5, 20';
  let stats: any = null;

  function calculate() {
      const data = input.split(/[\n, ]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));

      if (data.length === 0) {
          stats = null;
          return;
      }

      stats = {
          count: data.length,
          sum: Statistics.sum(data),
          mean: Statistics.mean(data),
          median: Statistics.median(data),
          mode: Statistics.mode(data).join(', '),
          range: Statistics.range(data),
          variance: Statistics.variance(data),
          stdDev: Statistics.stdDev(data)
      };
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div class="space-y-4">
      <label class="block text-sm font-bold text-slate-700 dark:text-slate-300">
          {dict.data}
      </label>
      <textarea
          bind:value={input}
          class="w-full h-64 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm resize-none"
          placeholder="1, 2, 3..."
      ></textarea>
      <button
          on:click={calculate}
          class="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
      >
          <Calculator size={20} />
          {dict.calculate}
      </button>
  </div>

  <div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      {#if stats}
          <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                  <div class="text-xs text-slate-500 uppercase font-bold">{dict.count}</div>
                  <div class="text-2xl font-mono text-slate-800 dark:text-white">{stats.count}</div>
              </div>
              <div class="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                  <div class="text-xs text-slate-500 uppercase font-bold">{dict.sum}</div>
                  <div class="text-2xl font-mono text-slate-800 dark:text-white">{Number(stats.sum.toFixed(4))}</div>
              </div>
              <div class="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                  <div class="text-xs text-slate-500 uppercase font-bold">{dict.mean}</div>
                  <div class="text-2xl font-mono text-indigo-600 dark:text-indigo-400">{Number(stats.mean.toFixed(4))}</div>
              </div>
              <div class="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                  <div class="text-xs text-slate-500 uppercase font-bold">{dict.median}</div>
                  <div class="text-2xl font-mono text-emerald-600 dark:text-emerald-400">{Number(stats.median.toFixed(4))}</div>
              </div>
              <div class="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm col-span-2">
                  <div class="text-xs text-slate-500 uppercase font-bold">{dict.mode}</div>
                  <div class="text-xl font-mono text-slate-800 dark:text-white">{stats.mode || 'None'}</div>
              </div>
              <div class="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                  <div class="text-xs text-slate-500 uppercase font-bold">{dict.range}</div>
                  <div class="text-xl font-mono text-slate-800 dark:text-white">{Number(stats.range.toFixed(4))}</div>
              </div>
              <div class="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                  <div class="text-xs text-slate-500 uppercase font-bold">{dict.stdDev}</div>
                  <div class="text-xl font-mono text-slate-800 dark:text-white">{Number(stats.stdDev.toFixed(4))}</div>
              </div>
              <div class="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm col-span-2">
                  <div class="text-xs text-slate-500 uppercase font-bold">{dict.variance}</div>
                  <div class="text-xl font-mono text-slate-800 dark:text-white">{Number(stats.variance.toFixed(4))}</div>
              </div>
          </div>
      {:else}
          <div class="h-full flex flex-col items-center justify-center text-slate-400">
              <BarChart3 size={48} class="mb-4 opacity-50" />
              <p>Enter data to calculate statistics</p>
          </div>
      {/if}
  </div>
</div>
