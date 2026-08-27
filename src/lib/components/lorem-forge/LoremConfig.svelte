<script lang="ts">
  import { Settings, FileText, Type, Hash, Binary } from '@lucide/svelte';
  import type { DictionaryType, TargetType, FormatType } from '$lib/utils/lorem-forge/generator';

  export let dict: any; // Translation dictionary
  export let dictionary: DictionaryType = 'standard';
  export let targetType: TargetType = 'paragraphs';
  export let count: number = 5;
  export let format: FormatType = 'plain';
  export let startWithLorem: boolean = true;

  export let onGenerate: () => void;
  export let onReset: () => void;
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6 transition-colors">

  <!-- Config Header -->
  <div class="flex items-center space-x-3 mb-6">
    <div class="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
      <Settings class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
    </div>
    <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Settings</h3>
  </div>

  <!-- Settings Grid -->
  <div class="grid grid-cols-1 gap-6">

    <!-- Dictionary Selection -->
    <div class="space-y-2">
      <label for="dictionary-select" class="block text-sm cursor-pointer font-medium text-slate-700 dark:text-slate-300">
        {(dict as any)?.config?.dictionary || 'Dictionary'}
      </label>
      <select
        id="dictionary-select" bind:value={dictionary}
        class="w-full min-h-[44px] px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all"
      >
        <option value="standard">{(dict as any)?.config?.dictionaries?.standard || 'Standard Latin'}</option>
        <option value="corporate">{(dict as any)?.config?.dictionaries?.corporate || 'Corporate Jargon'}</option>
        <option value="tech">{(dict as any)?.config?.dictionaries?.tech || 'Tech Buzzwords'}</option>
        <option value="hangul">{(dict as any)?.config?.dictionaries?.hangul || 'Hangul (Korean)'}</option>
      </select>
    </div>

    <!-- Format Selection -->
    <div class="space-y-2">
      <label for="format-select" class="block text-sm cursor-pointer font-medium text-slate-700 dark:text-slate-300">
        {(dict as any)?.config?.format || 'Format'}
      </label>
      <select
        id="format-select" bind:value={format}
        class="w-full min-h-[44px] px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all"
      >
        <option value="plain">{(dict as any)?.config?.formats?.plain || 'Plain Text'}</option>
        <option value="html">{(dict as any)?.config?.formats?.html || 'HTML Tags'}</option>
        <option value="markdown">{(dict as any)?.config?.formats?.markdown || 'Markdown'}</option>
      </select>
    </div>

    <!-- Target Type -->
    <div class="space-y-2">
      <span class="block text-sm cursor-pointer font-medium text-slate-700 dark:text-slate-300">
        {(dict as any)?.config?.targetType || 'Target By'}
      </span>
      <div class="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          class="flex-1 min-h-[44px] flex items-center justify-center space-x-2 text-sm font-medium rounded-lg transition-all {targetType === 'paragraphs' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
          on:click={() => targetType = 'paragraphs'}
        >
          <FileText class="w-4 h-4" />
          <span class="hidden sm:inline">{(dict as any)?.config?.targetTypes?.paragraphs || 'Paragraphs'}</span>
        </button>
        <button
          class="flex-1 min-h-[44px] flex items-center justify-center space-x-2 text-sm font-medium rounded-lg transition-all {targetType === 'words' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
          on:click={() => targetType = 'words'}
        >
          <Type class="w-4 h-4" />
          <span class="hidden sm:inline">{(dict as any)?.config?.targetTypes?.words || 'Words'}</span>
        </button>
        <button
          class="flex-1 min-h-[44px] flex items-center justify-center space-x-2 text-sm font-medium rounded-lg transition-all {targetType === 'characters' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
          on:click={() => targetType = 'characters'}
        >
          <Hash class="w-4 h-4" />
          <span class="hidden sm:inline">{(dict as any)?.config?.targetTypes?.characters || 'Characters'}</span>
        </button>
        <button
          class="flex-1 min-h-[44px] flex items-center justify-center space-x-2 text-sm font-medium rounded-lg transition-all {targetType === 'bytes' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}"
          on:click={() => targetType = 'bytes'}
        >
          <Binary class="w-4 h-4" />
          <span class="hidden sm:inline">{(dict as any)?.config?.targetTypes?.bytes || 'Bytes'}</span>
        </button>
      </div>
    </div>

    <!-- Count Input -->
    <div class="space-y-2">
      <label for="count-input" class="block text-sm cursor-pointer font-medium text-slate-700 dark:text-slate-300">
        {(dict as any)?.config?.countLabel || 'Count'}
      </label>
      <input
        type="number"
        id="count-input" bind:value={count}
        min="1"
        max={targetType === 'bytes' || targetType === 'characters' ? 50000 : 1000}
        class="w-full min-h-[44px] px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all font-mono"
      />
    </div>

  </div>

  <!-- Start with Lorem Ipsum Toggle -->
  {#if dictionary === 'standard'}
    <div class="flex items-center space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
      <button
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 {startWithLorem ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'} min-h-[44px]"
        on:click={() => startWithLorem = !startWithLorem}
        aria-label="Toggle Start with Lorem"
      >
        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {startWithLorem ? 'translate-x-6' : 'translate-x-1'}"></span>
      </button>
      <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
        {(dict as any)?.config?.startWithLorem || "Start with 'Lorem ipsum...'"}
      </span>
    </div>
  {/if}

  <!-- Action Buttons -->
  <div class="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
    <button
      on:click={onGenerate}
      class="flex-1 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-none"
    >
      {(dict as any)?.config?.generate || 'Generate'}
    </button>
    <button
      on:click={onReset}
      class="min-h-[44px] px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-all"
    >
      {(dict as any)?.config?.reset || 'Reset'}
    </button>
  </div>

</div>
