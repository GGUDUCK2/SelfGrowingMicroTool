<script lang="ts">
  import { contextData, findClosestContext } from '$lib/utils/unit-verse/context-data';
  import { unitEngine } from '$lib/utils/unit-verse/engine';
  import { Lightbulb } from '@lucide/svelte';

  export let value: number; // The input value
  export let fromUnitId: string;
  export let categoryId: string;
  export let t: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  $: lang = (t && t.lang === 'ko') ? 'ko' : 'en'; // Simple heuristic, better to pass lang prop

  let comparisons: { item: any, multiplier: number, text: string }[] = [];

  $: if (value && fromUnitId && categoryId) {
     updateComparisons();
  }

  function updateComparisons() {
      // 1. Convert input value to base SI unit for that category
      let baseValue = value;

      // We need to leverage unitEngine to get to base unit.
      // Assuming 'base' unit is defined in engine or we can convert to a known standard.
      // For Length, base is 'meter'. For Mass, 'kilogram'.

      let standardUnit = '';
      if (categoryId === 'length') standardUnit = 'meter';
      else if (categoryId === 'mass') standardUnit = 'kilogram';
      else if (categoryId === 'speed') standardUnit = 'meters-per-second';
      else if (categoryId === 'area') standardUnit = 'square-meter';
      else if (categoryId === 'volume') standardUnit = 'cubic-meter';

      if (!standardUnit) {
          comparisons = [];
          return;
      }

      try {
          // Check if unit is available before converting.
          // In some cases (like temperature), standard unit handling might be tricky if not careful.
          // Assuming unitEngine can handle all conversions.

          const res = unitEngine.convert(value, fromUnitId, standardUnit, categoryId);
          baseValue = res.value;

          const matches = findClosestContext(baseValue, categoryId, 3);

          comparisons = matches.map(item => {
              const multiplier = baseValue / item.value;
              let text = '';

              if (multiplier >= 0.9 && multiplier <= 1.1) {
                  text = lang === 'ko' ? '약 1개' : 'About 1';
              } else if (multiplier > 1) {
                  text = lang === 'ko' ? `약 ${formatNum(multiplier)}배` : `Approx. ${formatNum(multiplier)}x`;
              } else {
                  // fractional
                   text = lang === 'ko' ? `약 1/${formatNum(1/multiplier)}` : `Approx. 1/${formatNum(1/multiplier)}`;
              }

              return { item, multiplier, text };
          });

      } catch (e) {
          console.error(e);
          comparisons = [];
      }
  }

  function formatNum(n: number) {
      if (n >= 100) return Math.round(n).toLocaleString();
      if (n >= 10) return n.toFixed(1);
      return n.toFixed(2);
  }
</script>

{#if comparisons.length > 0}
  <div class="mt-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/30 rounded-xl p-4">
      <div class="flex items-center gap-2 mb-3 text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
          <Lightbulb size={16} />
          <span>{t.context || 'Did you know?'}</span>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {#each comparisons as comp}
              <div class="flex items-center gap-3 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700/50">
                  <div class="text-2xl">{comp.item.icon}</div>
                  <div class="flex-1 min-w-0">
                      <div class="text-xs text-gray-500 dark:text-slate-400 truncate">{comp.item.label[lang === 'ko' ? 'ko' : 'en']}</div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{comp.text}</div>
                  </div>
              </div>
          {/each}
      </div>
  </div>
{/if}
