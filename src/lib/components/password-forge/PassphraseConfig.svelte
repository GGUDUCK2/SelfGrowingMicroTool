<script lang="ts">
  import type { PassphraseConfig } from '$lib/utils/password-forge/generator';
  import { Copy, Upload } from '@lucide/svelte';

  export let config: PassphraseConfig;
  export let dictionary: Record<string, any>;
  export let onGenerate: () => void;

  let showRecipe = false;
  let recipeText = '';

  function exportRecipe() {
      try {
          const recipe = btoa(encodeURIComponent(JSON.stringify(config)));
          navigator.clipboard.writeText(recipe);
          recipeText = dictionary.recipeCopied || 'Recipe Copied!';
          showRecipe = true;
          setTimeout(() => { showRecipe = false; }, 2000);
      } catch (e) {
          alert(dictionary.error || 'Export failed');
      }
  }

  function importRecipe() {
      const recipe = prompt(dictionary.pasteRecipe || 'Paste Recipe:');
      if (recipe) {
          try {
              const parsed = JSON.parse(decodeURIComponent(atob(recipe)));
              if (parsed && typeof parsed === 'object') {
                  config = { ...config, ...parsed };
                  onGenerate();
              }
          } catch (e) {
              alert(dictionary.invalidRecipe || 'Invalid Recipe');
          }
      }
  }
</script>

<div class="space-y-6">
  <div class="flex justify-end gap-2 mb-2">
      <button class="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors" on:click={exportRecipe}>
          <Copy size={14} /> {showRecipe ? recipeText : (dictionary.exportRecipe || 'Export Recipe')}
      </button>
      <button class="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors" on:click={importRecipe}>
          <Upload size={14} /> {dictionary.importRecipe || 'Import Recipe'}
      </button>
  </div>
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
      class="w-full h-2 min-h-[44px] bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
      aria-label={dictionary.words}
    />
  </div>

  <div class="space-y-4">
    <div role="group" aria-labelledby="templateLabel">
      <p id="templateLabel" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{dictionary.template || 'Template (Optional)'}</p>
      <div class="grid sm:grid-cols-2 gap-2">
        <input
          type="text"
          bind:value={config.template}
          on:input={() => onGenerate()}
          placeholder="e.g. word-word-number-symbol"
          class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 min-h-[44px]"
        />
        <div class="flex gap-2">
            <button
                class="flex-1 py-2 px-2 border rounded-lg text-xs text-center font-medium min-h-[44px] min-w-[44px] bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                on:click={() => {config.template = 'word-number-word-symbol'; onGenerate()}}
            >
                word-number-word-symbol
            </button>
            <button
                class="flex-1 py-2 px-2 border rounded-lg text-xs text-center font-medium min-h-[44px] min-w-[44px] bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                on:click={() => {config.template = ''; onGenerate()}}
            >
                {dictionary.clear || 'Clear'}
            </button>
        </div>
      </div>
    </div>

    <div role="group" aria-labelledby="separatorLabel">
      <p id="separatorLabel" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{dictionary.separator}</p>
      <div class="grid grid-cols-4 gap-2">
        {#each [{val: '-', label: 'Hyphen (-)'}, {val: ' ', label: 'Space'}, {val: '.', label: 'Period'}, {val: ',', label: 'Comma'}] as sep}
        <button
          class="py-2 px-3 border rounded-lg text-sm text-center font-medium min-h-[44px] min-w-[44px] {config.separator === sep.val ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'}"
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
          class="py-2 px-3 border rounded-lg text-sm font-medium capitalize min-h-[44px] min-w-[44px] {config.capitalize === cap ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'}"
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
