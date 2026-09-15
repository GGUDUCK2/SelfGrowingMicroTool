<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import { Copy, Trash2, Wand2, Minimize, BarChart, CheckCircle2, AlertTriangle } from '@lucide/svelte';
  import type { CssState, CssAction, CssStatistics, Dictionary } from './types';
  import vkbeautify from 'vkbeautify';

  export let state: CssState;
  export let dictionary: Dictionary;

  const dispatch = createEventDispatcher<{ process: CssState }>();

  function copyToClipboard(text: string) {
    if (text && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      triggerToast(dictionary?.tools?.cssForge?.feedback?.copied || 'Copied to clipboard');
    }
  }

  function countStatistics(css: string): CssStatistics {
    // Basic heuristics for CSS statistics
    // Remove comments
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

    // Count rules (blocks ending with '}')
    const rulesMatch = noComments.match(/\{[^}]*\}/g);
    const rules = rulesMatch ? rulesMatch.length : 0;

    // Count selectors (before '{')
    // Splitting by '}' gives rule blocks + remaining space
    const blocks = noComments.split('}');
    let selectors = 0;
    for (const block of blocks) {
        if (block.includes('{')) {
            const selectorPart = block.split('{')[0].trim();
            if (selectorPart) {
                // count commas for multiple selectors
                selectors += selectorPart.split(',').length;
            }
        }
    }

    // Count declarations (key-value pairs in blocks)
    let declarations = 0;
    if (rulesMatch) {
        for (const rule of rulesMatch) {
            // inside {}
            const inner = rule.substring(1, rule.length - 1).trim();
            if (inner) {
               // split by ';'
               const decls = inner.split(';').filter(d => d.trim().includes(':'));
               declarations += decls.length;
            }
        }
    }

    return { selectors, rules, declarations };
  }


  import { onMount, onDestroy } from 'svelte';

  let showToast = false;
  let toastMessage = '';

  function triggerToast(msg: string) {
      toastMessage = msg;
      showToast = true;
      setTimeout(() => { showToast = false; }, 2000);
  }

  function handleKeydown(event: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

    if (cmdOrCtrl && event.key === 'Enter') {
      event.preventDefault();
      handleProcess();
      triggerToast(dictionary?.tools?.cssForge?.feedback?.processed || 'Processed');
    } else if (cmdOrCtrl && event.key.toLowerCase() === 's') {
      event.preventDefault();
      copyToClipboard(state.output);
      triggerToast(dictionary?.tools?.cssForge?.feedback?.copied || 'Copied');
    } else if (cmdOrCtrl && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      clear();
      triggerToast(dictionary?.tools?.cssForge?.feedback?.cleared || 'Cleared');
    } else if (event.key === 'Escape') {
      event.preventDefault();
      clear();
      triggerToast(dictionary?.tools?.cssForge?.feedback?.cleared || 'Cleared');
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeydown);
    }
  });

  // Auto-Fix function
  function autoFix() {
      let css = state.input;

      // Basic auto-fix: Add missing semicolons before closing brace
      css = css.replace(/([^;\s{}])\s*}/g, '$1;}');

      // Add missing closing braces if there are unclosed blocks
      const openBraces = (css.match(/\{/g) || []).length;
      const closeBraces = (css.match(/\}/g) || []).length;

      if (openBraces > closeBraces) {
          css += '\n}'.repeat(openBraces - closeBraces);
      }

      state.input = css;
      setAction('format');
      triggerToast(dictionary?.tools?.cssForge?.feedback?.autoFixed || 'Auto-fixed applied');
  }

  export function process() { handleProcess(); }


  let validationErrors: string[] = [];

  function validateCss(css: string) {
      validationErrors = [];
      if (!css.trim()) return;

      const openBraces = (css.match(/\{/g) || []).length;
      const closeBraces = (css.match(/\}/g) || []).length;

      if (openBraces !== closeBraces) {
          validationErrors.push(`Brace mismatch: ${openBraces} open, ${closeBraces} closed.`);
      }

      // Check for missing semicolons (basic heuristic)
      const lines = css.split('\n');
      lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed.includes(':') && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.startsWith('/*')) {
             // It might be a missing semicolon if there's no comma
             if(!trimmed.includes(',')) {
                 // basic heuristic, might have false positives on multi-line rules, but helpful
                 // Let's refine it: inside a block
                 validationErrors.push("Potential missing semicolon at line " + (index + 1));
             }
          }
      });

      // Simple heuristic for unclosed comments
      const openComments = (css.match(/\/\*/g) || []).length;
      const closeComments = (css.match(/\*\//g) || []).length;
      if (openComments !== closeComments) {
          validationErrors.push('Unclosed CSS comment detected.');
      }
  }



  function handleProcess() {
    validateCss(state.input);
    let output = '';
    let stats = null;

    if (!state.input.trim()) {
        state.output = '';
        state.statistics = null;
        dispatch('process', state);
        return;
    }

    try {
        if (state.action === 'format') {
            let indentStr = ' '.repeat(state.indentSize);
            output = vkbeautify.css(state.input, indentStr);
        } else if (state.action === 'minify') {
            output = vkbeautify.cssmin(state.input);
        } else if (state.action === 'analyze') {
            output = state.input;
            stats = countStatistics(state.input);
        }
    } catch (e) {
        output = 'Error processing CSS';
    }

    state = {
        ...state,
        output,
        statistics: stats
    };
    dispatch('process', state);
  }

  function setAction(action: CssAction) {
    state.action = action;
    handleProcess();
  }

  function clear() {
    state = { ...state, input: '', output: '', statistics: null };
    dispatch('process', state);
  }

  $: tAction = dictionary?.common?.actions || 'Actions';
</script>


{#if showToast}
    <div class="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-fade-in-up">
        {toastMessage}
    </div>
{/if}

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 relative">

    <!-- Input Section -->
    <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center h-8">
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Input CSS</span>
            <button class="p-1.5 text-slate-500 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" on:click={clear} title="Clear (Ctrl/Cmd + K or Esc)" aria-label="Clear input">
                <Trash2 size={16} />
            </button>
        </div>
        <textarea
            bind:value={state.input}
            on:input={handleProcess}
            placeholder="Paste your CSS here..."
            class="w-full h-96 p-4 font-mono text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-900 dark:text-slate-100"
            spellcheck="false"
        ></textarea>
    </div>
    {#if validationErrors.length > 0}
        <div class="flex items-start gap-2 mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertTriangle size={16} class="shrink-0 mt-0.5" />
            <div class="flex flex-col gap-1">
                {#each validationErrors as error}
                    <span>{error}</span>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Output Section -->
    <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center h-8">
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {#if state.action === 'analyze'}
                    Statistics
                {:else}
                    Output
                {/if}
            </span>
            <button class="p-1.5 text-slate-500 hover:text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" on:click={() => copyToClipboard(state.output)} title="Copy Result (Ctrl/Cmd + S)" aria-label="Copy output">
                <Copy size={16} />
            </button>
        </div>

        {#if state.action === 'analyze' && state.statistics}
            <div class="w-full h-96 p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-y-auto">
                <div class="grid grid-cols-1 gap-4">
                     <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                          <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Selectors</h3>
                          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{state.statistics.selectors}</div>
                     </div>
                     <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                          <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Rules</h3>
                          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{state.statistics.rules}</div>
                     </div>
                     <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                          <h3 class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Declarations</h3>
                          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{state.statistics.declarations}</div>
                     </div>
                </div>
            </div>
        {:else}
            <textarea
                readonly
                value={state.output}
                placeholder="Result will appear here..."
                class="w-full h-96 p-4 font-mono text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-900 dark:text-slate-100"
                spellcheck="false"
            ></textarea>
        {/if}
    </div>
</div>

<div class="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
    <div class="flex flex-wrap gap-2">

        <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all {state.action === 'format' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'} min-h-[44px]"
            on:click={() => setAction('format')}
            title="Format CSS (Ctrl/Cmd + Enter)"
            aria-label="Format CSS"
        >
            <Wand2 size={16} />
            Format
        </button>
        <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 min-h-[44px]"
            on:click={autoFix}
            title="Auto-Fix common syntax errors"
            aria-label="Auto-Fix CSS"
        >
            <Wand2 size={16} class="text-emerald-500" />
            Auto-Fix
        </button>

        <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all {state.action === 'minify' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'} min-h-[44px]"
            on:click={() => setAction('minify')}
        >
            <Minimize size={16} />
            Minify
        </button>
        <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all {state.action === 'analyze' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'} min-h-[44px]"
            on:click={() => setAction('analyze')}
        >
            <BarChart size={16} />
            Analyze
        </button>
    </div>

    {#if state.action === 'format'}
    <div class="flex items-center gap-2">
        <label for="indentSize" class="text-sm text-slate-600 dark:text-slate-400 font-medium">Indent:</label>
        <select
            id="indentSize"
            bind:value={state.indentSize}
            on:change={handleProcess}
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
        >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
        </select>
    </div>
    {/if}
</div>
