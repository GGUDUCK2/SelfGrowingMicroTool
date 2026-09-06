<script lang="ts">
  import { fade } from 'svelte/transition';

  import type { ColorMasterDictionary } from '$lib/types/color-master';

  export let baseColor: string;
  export let colors: any[];
  export let t: ColorMasterDictionary;

  let gradientType: 'linear' | 'radial' | 'conic' = 'linear';
  let direction = 'to right';
  let copied = false;

  $: gradientColors = [baseColor, ...colors.map(c => c.hex)];
  $: cssGradient = generateGradient(gradientType, direction, gradientColors);

  function generateGradient(type: string, dir: string, cols: string[]) {
    // Take up to 3 colors for a nice simple gradient, or all of them?
    // Let's take the base + 2 harmonies for a 3-stop gradient if available
    const stops = cols.slice(0, 3).join(', ');
    if (type === 'linear') return `linear-gradient(${dir}, ${stops})`;
    if (type === 'radial') return `radial-gradient(circle at center, ${stops})`;
    if (type === 'conic') return `conic-gradient(from 0deg at 50% 50%, ${stops})`;
    return '';
  }

  function copyGradient() {
    navigator.clipboard.writeText(cssGradient);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
  <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t.gradientGenerator?.title || 'Gradient Generator'}</h3>

  <div class="grid md:grid-cols-2 gap-6">
    <div
      class="h-48 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700 transition-all"
      style="background: {cssGradient}"
    ></div>

    <div class="space-y-4">
      <div>
        <span class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.gradientGenerator?.type || 'Type'}</span>
        <div class="flex gap-2" role="group" aria-label={t.gradientGenerator?.type || 'Gradient Type'}>
          {#each ['linear', 'radial', 'conic'] as type}
            <button
              class="px-3 py-1 text-sm rounded-lg border transition-all {gradientType === (type as any) ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700'}"
              on:click={() => gradientType = (type as "linear" | "radial" | "conic")}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          {/each}
        </div>
      </div>

      {#if gradientType === 'linear'}
        <div>
          <label for="gradient-direction" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.gradientGenerator?.direction || 'Direction'}</label>
          <select
            id="gradient-direction"
            bind:value={direction}
            class="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <option value="to right">To Right</option>
            <option value="to left">To Left</option>
            <option value="to bottom">To Bottom</option>
            <option value="to top">To Top</option>
            <option value="to bottom right">To Bottom Right</option>
          </select>
        </div>
      {/if}

      <button
        class="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium shadow-sm active:scale-[0.98]"
        on:click={copyGradient}
      >
        {copied ? (t.copied || 'Copied!') : (t.gradientGenerator?.copy || 'Copy CSS')}
      </button>
    </div>
  </div>
</div>
