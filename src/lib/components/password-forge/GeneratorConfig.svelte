<script lang="ts">
  import type { PasswordConfig } from '$lib/utils/password-forge/generator';
  import { Shield, Shuffle, Copy, Download, Upload } from 'lucide-svelte';

  export let config: PasswordConfig;
  export let dictionary: Record<string, any>;
  export let onGenerate: () => void;

  function updateConfig(key: keyof PasswordConfig, value: any) {
    config[key] = value;
    onGenerate();
  }

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
    <label for="length-slider" class="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
      <span>{dictionary.length}</span>
      <span class="text-indigo-600 dark:text-indigo-400 font-bold">{config.length}</span>
    </label>
    <input
      id="length-slider"
      type="range"
      min="4"
      max="128"
      bind:value={config.length}
      on:input={() => onGenerate()}
      class="w-full h-2 min-h-[44px] bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
      aria-label={dictionary.length}
    />
  </div>

  <div class="grid grid-cols-2 gap-4">
    <label class="flex items-center space-x-3 cursor-pointer min-h-[44px] min-w-[44px]">
      <input type="checkbox" bind:checked={config.uppercase} on:change={() => onGenerate()} class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
      <span class="text-sm text-slate-700 dark:text-slate-300">{dictionary.uppercase} (A-Z)</span>
    </label>
    <label class="flex items-center space-x-3 cursor-pointer min-h-[44px] min-w-[44px]">
      <input type="checkbox" bind:checked={config.lowercase} on:change={() => onGenerate()} class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
      <span class="text-sm text-slate-700 dark:text-slate-300">{dictionary.lowercase} (a-z)</span>
    </label>
    <label class="flex items-center space-x-3 cursor-pointer min-h-[44px] min-w-[44px]">
      <input type="checkbox" bind:checked={config.numbers} on:change={() => onGenerate()} class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
      <span class="text-sm text-slate-700 dark:text-slate-300">{dictionary.numbers} (0-9)</span>
    </label>
    <label class="flex items-center space-x-3 cursor-pointer min-h-[44px] min-w-[44px]">
      <input type="checkbox" bind:checked={config.symbols} on:change={() => onGenerate()} class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
      <span class="text-sm text-slate-700 dark:text-slate-300">{dictionary.symbols} (!@#)</span>
    </label>
  </div>

  <div class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
    <label class="flex items-center space-x-3 cursor-pointer min-h-[44px] min-w-[44px]">
      <input type="checkbox" bind:checked={config.excludeSimilar} on:change={() => onGenerate()} class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
      <span class="text-sm text-slate-700 dark:text-slate-300">{dictionary.excludeSimilar} (i, l, 1, L, o, 0, O)</span>
    </label>
    <label class="flex items-center space-x-3 cursor-pointer min-h-[44px] min-w-[44px]">
      <input type="checkbox" bind:checked={config.excludeAmbiguous} on:change={() => onGenerate()} class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
      <span class="text-sm text-slate-700 dark:text-slate-300">{dictionary.excludeAmbiguous} ({'{}[]()/\\\'"`~,;:.<>'})</span>
    </label>
  </div>
</div>
