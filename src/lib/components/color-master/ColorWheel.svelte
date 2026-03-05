<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { colord } from 'colord';
  import type { ColorMasterDictionary } from '$lib/types/color-master';

  export let color = '#6366f1'; // Default Indigo
  export let t: ColorMasterDictionary;

  const dispatch = createEventDispatcher();

  let hexInput = color;

  $: if (color) {
    hexInput = color;
  }

  function handleColorInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const newColor = target.value;
    if (colord(newColor).isValid()) {
      color = newColor;
      dispatch('change', color);
    }
  }

  function handleHexBlur() {
    if (colord(hexInput).isValid()) {
      color = colord(hexInput).toHex();
      dispatch('change', color);
    } else {
      hexInput = color; // Revert if invalid
    }
  }
</script>

<div class="flex flex-col gap-4 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
  <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{t.baseColor}</h3>

  <div class="flex items-center gap-4">
    <div class="relative w-20 h-20 rounded-2xl shadow-inner overflow-hidden border border-slate-200 dark:border-slate-600 ring-2 ring-offset-2 ring-transparent transition-all focus-within:ring-indigo-500">
      <input
        type="color"
        value={color}
        on:input={handleColorInput}
        class="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
      />
    </div>

    <div class="flex-1">
      <label class="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1" for="hex-input">{t.hex}</label>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">#</span>
        <input
          id="hex-input"
          type="text"
          bind:value={hexInput}
          on:blur={handleHexBlur}
          class="w-full pl-8 pr-4 py-2 min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none uppercase font-mono transition-all"
        />
      </div>
    </div>
  </div>

  <div class="flex flex-wrap gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
    <div class="flex-1 min-w-[140px] bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-700">
      RGB: {colord(color).toRgbString()}
    </div>
    <div class="flex-1 min-w-[140px] bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-700">
      HSL: {colord(color).toHslString()}
    </div>
  </div>
</div>
