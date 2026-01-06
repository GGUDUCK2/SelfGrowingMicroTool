<script lang="ts">
  import { colord } from 'colord';
  import { createEventDispatcher } from 'svelte';
  import type { ColorMasterDictionary } from '$lib/types/color-master';

  export let baseColor: string;
  export let t: ColorMasterDictionary;

  const dispatch = createEventDispatcher();

  const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  function generateScale(hex: string) {
    const c = colord(hex);
    // Simple algorithm:
    // 500 is the base color (or closest to it)
    // Lighter shades: mix with white
    // Darker shades: mix with black
    // This is a naive implementation. A better one would use HSL lightness curves.

    // Let's use HSL lightness manipulation for better results than simple mixing
    const h = c.toHsl().h;
    const s = c.toHsl().s;
    const l = c.toHsl().l;

    return STEPS.map(step => {
      let newL;
      // We assume the base color is around step 500 (lightness ~50%)
      // 50 -> 95% L
      // 500 -> 50% L (or original L)
      // 950 -> 5% L

      // Map step 50-950 to Lightness 95-5
      // This ignores the original lightness, which might be bad if the user input is already dark/light.
      // Better approach: Shift L relative to the input color.

      // If input is "Blue 500" (Standard):
      // 50: Very Light, 900: Very Dark.

      // If input is "Blue 900" (Dark):
      // The user likely wants this to be the '900' or '500' value?
      // Usually scale generators treat the input as the "primary" (500) brand color.
      // So let's stick to that convention. Input = Brand Color (~500).

      if (step === 500) {
        newL = l;
      } else if (step < 500) {
        // Lighten
        // Range 50..400 maps to Lightness 95..(L+something)
        // Interpolate between 98 (at 50) and L (at 500)
        const t = (step - 50) / (500 - 50); // 0 to 1
        // linear interpolation: (1-t)*98 + t*L
        newL = (1 - t) * 98 + t * l;
      } else {
        // Darken
        // Range 600..950 maps to L..5
        const t = (step - 500) / (950 - 500); // 0 to 1
        // linear interpolation: (1-t)*L + t*10
        newL = (1 - t) * l + t * 5;
      }

      return {
        step,
        hex: colord({ h, s, l: newL }).toHex()
      };
    });
  }

  $: scale = generateScale(baseColor);
  $: dispatch('scaleChange', scale);

  function copyScale() {
      const config = scale.reduce((acc, curr) => {
          acc[curr.step] = curr.hex;
          return acc;
      }, {} as Record<number, string>);
      navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      dispatch('copy');
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{t.scaleGenerator?.title || 'Smart Scale'}</h3>
    <button
        class="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        on:click={copyScale}
    >
        {t.scaleGenerator?.copy || 'Copy JSON'}
    </button>
  </div>

  <div class="flex flex-wrap sm:flex-nowrap gap-0 rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
    {#each scale as { step, hex }}
      <div
        class="flex-1 min-w-[3rem] h-24 flex flex-col justify-between p-2 text-[10px] font-mono transition-all hover:flex-[1.5] cursor-pointer group"
        style="background-color: {hex}; color: {colord(hex).isDark() ? 'white' : 'black'};"
        on:click={() => {
            navigator.clipboard.writeText(hex);
            // Optionally dispatch or show toast
        }}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && navigator.clipboard.writeText(hex)}
        aria-label="Color step {step}: {hex}"
      >
        <span class="opacity-50 group-hover:opacity-100">{step}</span>
        <span class="opacity-0 group-hover:opacity-100 uppercase">{hex}</span>
      </div>
    {/each}
  </div>
</div>
