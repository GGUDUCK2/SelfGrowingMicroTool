<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import vkbeautify from 'vkbeautify';
  import he from 'he';
  import type { HtmlState, HtmlAction } from './types';
  import Copy from '@lucide/svelte/icons/copy';
  import Check from '@lucide/svelte/icons/check';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Code from '@lucide/svelte/icons/code';
  import Minimize from '@lucide/svelte/icons/minimize';
  import ArrowRightLeft from '@lucide/svelte/icons/arrow-right-left';
  import AlertCircle from '@lucide/svelte/icons/alert-circle';

  export let state: HtmlState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dictionary: Record<string, any>;

  const dispatch = createEventDispatcher<{ process: HtmlState }>();

  $: t = dictionary?.tools?.htmlForge || {};

  let isCopied = false;
  let errorMsg = '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actions: { value: HtmlAction, labelKey: string, icon: any }[] = [
      { value: 'format', labelKey: 'format', icon: Code },
      { value: 'minify', labelKey: 'minify', icon: Minimize },
      { value: 'encode', labelKey: 'encode', icon: ArrowRightLeft },
      { value: 'decode', labelKey: 'decode', icon: ArrowRightLeft }
  ];

  function processHtml() {
      errorMsg = '';
      if (!state.input.trim()) {
          state.output = '';
          return;
      }
      try {
          if (state.action === 'format') {
              // Using vkbeautify for HTML formatting
              state.output = vkbeautify.xml(state.input.trim(), 2);
          } else if (state.action === 'minify') {
              // Using vkbeautify for HTML minification
              state.output = vkbeautify.xmlmin(state.input.trim());
          } else if (state.action === 'encode') {
              // Encode HTML entities
              state.output = he.encode(state.input, { useNamedReferences: true });
          } else if (state.action === 'decode') {
              // Decode HTML entities
              state.output = he.decode(state.input);
          }
          dispatch('process', state);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
          errorMsg = t.error || 'Processing error';
          state.output = '';
          console.error(err);
      }
  }

  function handleActionChange(newAction: HtmlAction) {
      state.action = newAction;
      processHtml();
  }

  function clear() {
      state.input = '';
      state.output = '';
      errorMsg = '';
  }

  async function copyToClipboard() {
      if (!state.output) return;
      try {
          await navigator.clipboard.writeText(state.output);
          isCopied = true;
          setTimeout(() => (isCopied = false), 2000);
      } catch (err) {
          console.error('Failed to copy text: ', err);
      }
  }

  function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          processHtml();
      }
  }

  $: if (state.input !== undefined) {
      // Debounce the processing if needed, but for now we'll rely on explicit buttons or typing
      // However, we can do live update on input change with a small delay
  }

  let typingTimer: ReturnType<typeof setTimeout>;
  function handleInput() {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(processHtml, 300);
  }

</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Input Section -->
    <div class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-2">
            {#each actions as action (action.value)}
                <button
                    on:click={() => handleActionChange(action.value)}
                    class="flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border {state.action === action.value ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}"
                >
                    <svelte:component this={action.icon} size={16} />
                    {t[action.labelKey] || action.labelKey}
                </button>
            {/each}
        </div>

        <div class="relative flex-1">
            <textarea
                bind:value={state.input}
                on:input={handleInput}
                on:keydown={handleKeydown}
                placeholder={t.inputPlaceholder || 'Paste your HTML here...'}
                class="w-full h-full min-h-[300px] lg:min-h-[500px] p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm resize-none custom-scrollbar"
                spellcheck="false"
            ></textarea>
            {#if state.input}
                <button
                    on:click={clear}
                    class="absolute top-2 right-2 p-2 min-h-[44px] min-w-[44px] bg-white/90 dark:bg-slate-800/90 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-500 rounded-lg backdrop-blur-sm transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                    title={t.clear || 'Clear'}
                >
                    <Trash2 size={16} />
                </button>
            {/if}
        </div>
    </div>

    <!-- Output Section -->
    <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between h-[44px]">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Output
            </span>
            {#if errorMsg}
                <span class="flex items-center gap-1 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full">
                    <AlertCircle size={14} />
                    {errorMsg}
                </span>
            {/if}
        </div>

        <div class="relative flex-1">
            <textarea
                value={state.output}
                readonly
                placeholder={t.resultPlaceholder || 'Result will appear here...'}
                class="w-full h-full min-h-[300px] lg:min-h-[500px] p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-mono text-sm resize-none custom-scrollbar"
                spellcheck="false"
            ></textarea>

            {#if state.output}
                <button
                    on:click={copyToClipboard}
                    class="absolute top-2 right-2 flex items-center gap-2 px-3 min-h-[44px] bg-white/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg backdrop-blur-sm transition-colors border border-slate-200 dark:border-slate-700"
                >
                    {#if isCopied}
                        <Check size={16} class="text-emerald-500" />
                        <span class="text-sm font-medium text-emerald-500">{t.copied || 'Copied!'}</span>
                    {:else}
                        <Copy size={16} />
                        <span class="text-sm font-medium">{t.copy || 'Copy'}</span>
                    {/if}
                </button>
            {/if}
        </div>
    </div>
</div>
