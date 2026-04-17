<script lang="ts">
  import type { PronounceableConfig } from '$lib/utils/password-forge/generator';

  export let config: PronounceableConfig;
  export let dictionary: any;
  export let onGenerate: () => void;
</script>

<div class="space-y-6">
  <div>
    <label for="length-slider" class="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
      <span>{dictionary.length}</span>
      <span class="text-indigo-600 dark:text-indigo-400 font-bold">{config.length}</span>
    </label>
    <input
      id="length-slider"
      type="range"
      min="4"
      max="64"
      bind:value={config.length}
      on:input={() => onGenerate()}
      class="w-full h-2 min-h-[44px] bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
      aria-label={dictionary.length}
    />
  </div>

  <div class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
    <label class="flex items-center space-x-3 cursor-pointer min-h-[44px] min-w-[44px]">
      <input type="checkbox" bind:checked={config.includeNumber} on:change={() => onGenerate()} class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
      <span class="text-sm text-slate-700 dark:text-slate-300">{dictionary.includeNumber}</span>
    </label>
    <label class="flex items-center space-x-3 cursor-pointer min-h-[44px] min-w-[44px]">
      <input type="checkbox" bind:checked={config.includeSymbol} on:change={() => onGenerate()} class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
      <span class="text-sm text-slate-700 dark:text-slate-300">{dictionary.symbols}</span>
    </label>
  </div>
</div>
