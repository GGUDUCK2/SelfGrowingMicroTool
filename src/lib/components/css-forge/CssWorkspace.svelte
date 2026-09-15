<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Copy, Trash2, Wand2, Minimize, BarChart } from '@lucide/svelte';
  import type { CssState, CssAction, CssStatistics, Dictionary } from './types';
  import vkbeautify from 'vkbeautify';

  export let state: CssState;
  export let dictionary: Dictionary;

  const dispatch = createEventDispatcher<{ process: CssState }>();

  function copyToClipboard(text: string) {
    if (text && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
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

  export function process() { handleProcess(); }

  function handleProcess() {
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

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Input Section -->
    <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center h-8">
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Input CSS</span>
            <button class="p-1.5 text-slate-500 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" on:click={clear} title="Clear">
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
            <button class="p-1.5 text-slate-500 hover:text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" on:click={() => copyToClipboard(state.output)} title="Copy Result">
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
        >
            <Wand2 size={16} />
            Format
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
