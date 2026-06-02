<script lang="ts">
  import yaml from 'js-yaml';
  import { CheckCircle2, XCircle, Trash2 } from '@lucide/svelte';
  import { fade } from 'svelte/transition';

  export let dict: Record<string, unknown>;

  let input = '';
  let isValid: boolean | null = null;
  let errorMsg = '';

  const validate = () => {
    if (!input.trim()) {
      isValid = null;
      errorMsg = '';
      return;
    }

    try {
      yaml.load(input);
      isValid = true;
      errorMsg = '';
    } catch (err: Error) {
      isValid = false;
      errorMsg = err.message || dict.validator.invalid;
    }
  };

  const clearInput = () => {
    input = '';
    isValid = null;
    errorMsg = '';
  };
</script>

<div class="flex flex-col gap-4 h-full">
  <div class="flex items-center justify-between mb-2">
    <h2 class="text-lg font-semibold text-slate-800 dark:text-white">
      {dict.validator.title}
    </h2>
    <div class="flex items-center gap-2">
      {#if isValid === true}
        <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg text-sm font-medium" transition:fade>
          <CheckCircle2 size={16} />
          {dict.validator.valid}
        </div>
      {:else if isValid === false}
        <div class="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-lg text-sm font-medium" transition:fade>
          <XCircle size={16} />
          {dict.validator.invalid}
        </div>
      {/if}
    </div>
  </div>

  <div class="relative flex-1 flex flex-col h-[500px]">
    <textarea
      bind:value={input}
      on:input={validate}
      placeholder={dict.validator.inputPlaceholder}
      class="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-colors {isValid === false ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} {isValid === true ? 'border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500' : ''}"
      spellcheck="false"
    ></textarea>

    {#if input}
      <button
        class="absolute top-2 right-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm"
        on:click={clearInput}
        aria-label="Clear"
      >
        <Trash2 size={16} />
      </button>
    {/if}

    {#if isValid === false && errorMsg}
      <div class="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/90 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-xl text-sm font-mono shadow-xl" transition:fade>
        <div class="font-semibold mb-1">Error details:</div>
        <div class="whitespace-pre-wrap">{errorMsg}</div>
      </div>
    {/if}
  </div>
</div>
