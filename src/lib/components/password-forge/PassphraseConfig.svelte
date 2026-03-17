<script lang="ts">
  import type { PassphraseConfig } from '$lib/utils/password-forge/generator';

  export let config: PassphraseConfig;
  export let dictionary: any;
  export let onGenerate: () => void;
</script>

<div class="space-y-6">
  <div>
    <label for="words-slider" class="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
      <span>{dictionary.words}</span>
      <span class="text-indigo-600 dark:text-indigo-400 font-bold">{config.words}</span>
    </label>
    <input
      id="words-slider"
      type="range"
      min="3"
      max="12"
      bind:value={config.words}
      on:input={() => onGenerate()}
      class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
    />
  </div>

  <div class="space-y-4">
    <div role="group" aria-labelledby="separatorLabel">
      <p id="separatorLabel" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{dictionary.separator}</p>
      <div class="grid grid-cols-4 gap-2">
        {#each [{val: '-', label: 'Hyphen (-)'}, {val: ' ', label: 'Space'}, {val: '.', label: 'Period'}, {val: ',', label: 'Comma'}] as sep}
        <button
          class="py-2 px-3 border rounded-lg text-sm text-center font-medium min-h-[44px] {config.separator === sep.val ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'}"
          on:click={() => {config.separator = sep.val; onGenerate()}}
        >
          {sep.val === ' ' ? 'Space' : sep.val}
        </button>
        {/each}
      </div>
    </div>

    <div role="group" aria-labelledby="capitalizeLabel">
      <p id="capitalizeLabel" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{dictionary.capitalize}</p>
      <div class="grid grid-cols-3 gap-2">
        {#each ['none', 'first', 'all'] as cap}
        <button
          class="py-2 px-3 border rounded-lg text-sm font-medium capitalize min-h-[44px] {config.capitalize === cap ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'}"
          on:click={() => {config.capitalize = cap as 'none'|'first'|'all'; onGenerate()}}
        >
          {dictionary[cap] || cap}
        </button>
        {/each}
      </div>
    </div>

    <label class="flex items-center space-x-3 cursor-pointer pt-4 border-t border-slate-200 dark:border-slate-700">
      <input type="checkbox" bind:checked={config.includeNumber} on:change={() => onGenerate()} class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
      <span class="text-sm text-slate-700 dark:text-slate-300">{dictionary.includeNumber}</span>
    </label>
  </div>
</div>
