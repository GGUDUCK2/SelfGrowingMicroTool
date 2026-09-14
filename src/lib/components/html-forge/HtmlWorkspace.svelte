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
  import FileText from '@lucide/svelte/icons/file-text';
  import Link from '@lucide/svelte/icons/link';
  import BarChart from '@lucide/svelte/icons/bar-chart-2';
  import Eye from '@lucide/svelte/icons/eye';
  import AlertCircle from '@lucide/svelte/icons/alert-circle';

  export let state: HtmlState;
  import type { Dictionary, HtmlDictionary } from './types';
  export let dictionary: Dictionary & { tools?: { htmlForge?: HtmlDictionary } };

  const dispatch = createEventDispatcher<{ process: HtmlState }>();

  $: t = dictionary?.tools?.htmlForge as HtmlDictionary || {};

  let isCopied = false;
  let errorMsg = '';
  let isPreviewMode = false;

  function togglePreview() {
      isPreviewMode = !isPreviewMode;
  }

  import type { ComponentType } from 'svelte';
  const actions: { value: HtmlAction, labelKey: keyof HtmlDictionary, icon: ComponentType }[] = [
      { value: 'format', labelKey: 'format', icon: Code },
      { value: 'minify', labelKey: 'minify', icon: Minimize },
      { value: 'encode', labelKey: 'encode', icon: ArrowRightLeft },
      { value: 'decode', labelKey: 'decode', icon: ArrowRightLeft },
      { value: 'strip', labelKey: 'strip', icon: FileText },
      { value: 'extractLinks', labelKey: 'extractLinks', icon: Link },
      { value: 'analyze', labelKey: 'analyze', icon: BarChart }
  ];

  function processHtml() {
      errorMsg = '';
      if (!state.input.trim()) {
          state.output = '';
          state.stats = null;
          return;
      }
      try {
          state.stats = null;
          if (state.action === 'format') {
              let indentString = '  '; // default 2 spaces
              if (state.indentSize === 4) indentString = '    ';
              else if (state.indentSize === 0) indentString = '\t';

              state.output = vkbeautify.xml(state.input.trim(), indentString as unknown as number);
              // Note: vkbeautify types might be loose, but it accepts a string as step for formatting.
          } else if (state.action === 'minify') {
              state.output = vkbeautify.xmlmin(state.input.trim());
          } else if (state.action === 'encode') {
              state.output = he.encode(state.input, { useNamedReferences: true });
          } else if (state.action === 'decode') {
              state.output = he.decode(state.input);
          } else if (state.action === 'strip') {
              state.output = state.input.replace(/<[^>]*>?/gm, '');
          } else if (state.action === 'extractLinks') {
              const regex = /href=(['"])(.*?)\1/gi;
              let match;
              const links: string[] = [];
              while ((match = regex.exec(state.input)) !== null) {
                  if (match[2] && match[2].trim() !== '') {
                      links.push(match[2]);
                  }
              }
              state.output = links.length > 0 ? links.join('\n') : (t.noLinks || 'No links found.');
          } else if (state.action === 'analyze') {
              const tagRegex = /<([a-z0-9]+)([^>]*)>/gi;
              let tagCount = 0;
              while (tagRegex.exec(state.input) !== null) {
                  tagCount++;
              }

              const linkRegex = /href=(['"])(.*?)\1/gi;
              let linkCount = 0;
              while (linkRegex.exec(state.input) !== null) {
                  linkCount++;
              }

              const charCount = state.input.length;
              const fileSizeBytes = new Blob([state.input]).size;

              state.stats = { tagCount, charCount, fileSizeBytes, linkCount };
              state.output = `Tags: ${tagCount}\nLinks: ${linkCount}\nCharacters: ${charCount}\nSize: ${fileSizeBytes} bytes`;
          }
          dispatch('process', state);
      } catch (err) {
          errorMsg = t.error || 'Processing error';
          state.output = '';
          state.stats = null;
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
      state.stats = null;
      errorMsg = '';
  }


  function downloadResult() {
      if (!state.output) return;
      const blob = new Blob([state.output], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `html-forge-result-${new Date().getTime()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }

  async function shareResult() {
      if (!state.output) return;
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'HTML Forge Result',
                  text: state.output
              });
          } catch (err) {
              console.error('Error sharing:', err);
          }
      } else {
          copyToClipboard();
      }
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
      } else if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
          event.preventDefault();
          clear();
      } else if ((event.metaKey || event.ctrlKey) && event.key === 's') {
          event.preventDefault();
          copyToClipboard();
      } else if (event.key === 'Escape') {
          clear();
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
                    {t[action.labelKey as keyof HtmlDictionary] || action.labelKey}
                </button>
            {/each}
        </div>

        {#if state.action === 'format'}
            <div class="flex items-center gap-4 text-sm bg-white dark:bg-slate-900 p-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <span class="text-slate-700 dark:text-slate-300 font-medium">{t.indentSize || 'Indent Size'}:</span>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" bind:group={state.indentSize} value={2} on:change={processHtml} class="text-indigo-600 focus:ring-indigo-500">
                    <span class="text-slate-600 dark:text-slate-400">{t.indent2 || '2 Spaces'}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" bind:group={state.indentSize} value={4} on:change={processHtml} class="text-indigo-600 focus:ring-indigo-500">
                    <span class="text-slate-600 dark:text-slate-400">{t.indent4 || '4 Spaces'}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" bind:group={state.indentSize} value={0} on:change={processHtml} class="text-indigo-600 focus:ring-indigo-500">
                    <span class="text-slate-600 dark:text-slate-400">{t.indentTab || 'Tab'}</span>
                </label>
            </div>
        {/if}

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
        <div class="text-xs text-slate-500 mb-2">💡 Tip: Press Cmd/Ctrl + Enter to process, Cmd/Ctrl + K to clear, Cmd/Ctrl + S to copy. Esc to reset all.</div>
        <div class="flex items-center justify-between h-[44px]">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Output
            </span>
            <button
                on:click={togglePreview}
                class="ml-4 flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium transition-colors"
            >
                <Eye size={14} />
                {isPreviewMode ? 'Code View' : 'Live Preview'}
            </button>
            {#if errorMsg}
                <span class="flex items-center gap-1 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full">
                    <AlertCircle size={14} />
                    {errorMsg}
                </span>
            {/if}
        </div>

        <div class="relative flex-1">
            {#if state.action === 'analyze' && state.stats}
                <div class="w-full h-full min-h-[300px] lg:min-h-[500px] p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-auto flex flex-col gap-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                            <span class="text-sm text-slate-500 dark:text-slate-400">{t.tagCount || 'Tag Count'}</span>
                            <span class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{state.stats.tagCount}</span>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                            <span class="text-sm text-slate-500 dark:text-slate-400">{t.linksCount || 'Links Count'}</span>
                            <span class="text-3xl font-bold text-blue-600 dark:text-blue-400">{state.stats.linkCount}</span>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                            <span class="text-sm text-slate-500 dark:text-slate-400">{t.charCount || 'Character Count'}</span>
                            <span class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{state.stats.charCount}</span>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                            <span class="text-sm text-slate-500 dark:text-slate-400">{t.fileSize || 'File Size'}</span>
                            <span class="text-3xl font-bold text-amber-600 dark:text-amber-400">{state.stats.fileSizeBytes} <span class="text-sm font-normal text-slate-400">bytes</span></span>
                        </div>
                    </div>
                </div>
            {:else if isPreviewMode && state.output}
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                <div class="w-full h-full min-h-[300px] lg:min-h-[500px] p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-auto">
                    <iframe srcdoc={state.output} title="Live Preview" sandbox="allow-same-origin allow-scripts" class="w-full h-full border-none"></iframe>
                </div>
            {:else}
            <textarea
                value={state.output}
                readonly
                placeholder={t.resultPlaceholder || 'Result will appear here...'}
                class="w-full h-full min-h-[300px] lg:min-h-[500px] p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-mono text-sm resize-none custom-scrollbar"
                spellcheck="false"
            ></textarea>
            {/if}

            {#if state.output && state.action !== 'analyze'}
                <button
                    on:click={downloadResult}
                    class="absolute top-2 right-24 flex items-center gap-2 px-3 min-h-[44px] bg-white/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg backdrop-blur-sm transition-colors border border-slate-200 dark:border-slate-700"
                >
                    <span class="text-sm font-medium">{t.download || 'Download'}</span>
                </button>
                <button
                    on:click={shareResult}
                    class="absolute top-2 right-48 flex items-center gap-2 px-3 min-h-[44px] bg-white/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg backdrop-blur-sm transition-colors border border-slate-200 dark:border-slate-700"
                >
                    <span class="text-sm font-medium">{t.share || 'Share'}</span>
                </button>
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
