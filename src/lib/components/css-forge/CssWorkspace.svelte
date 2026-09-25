<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';

  import { Copy, Trash2, Wand2, Minimize, BarChart, CheckCircle2, AlertTriangle, Download, Share2, Layers } from '@lucide/svelte';
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

  function calculateSpecificity(selector: string): [number, number, number] {
      const s = selector.replace(/:not\([^)]*\)/g, "");
      const ids = (s.match(/#[a-zA-Z0-9_-]+/g) || []).length;
      const classes = (s.match(/\.[a-zA-Z0-9_-]+/g) || []).length +
                (s.match(/\[[^\]]+\]/g) || []).length +
                (s.match(/:[a-zA-Z0-9_-]+/g) || []).length;
      const pseudoElements = (s.match(/::[a-zA-Z0-9_-]+/g) || []).length;
      const cleaned = s.replace(/#[a-zA-Z0-9_-]+/g, "")
                       .replace(/\.[a-zA-Z0-9_-]+/g, "")
                       .replace(/\[[^\]]+\]/g, "")
                       .replace(/::?[a-zA-Z0-9_-]+/g, "")
                       .replace(/[>+~*]/g, " ")
                       .trim();
      const tagMatches = cleaned.split(/\s+/).filter(t => t.length > 0);
      const tags = tagMatches.length + pseudoElements;
      return [ids, classes, tags];
  }

  function countStatistics(css: string): CssStatistics {
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const rulesMatch = noComments.match(/\{[^}]*\}/g);
    const rules = rulesMatch ? rulesMatch.length : 0;
    const blocks = noComments.split('}');
    let selectors = 0;
    const allSelectorsList: Array<{selector: string, specificityStr: string, weight: number}> = [];

    for (const block of blocks) {
        if (block.includes('{')) {
            const selectorPart = block.split('{')[0].trim();
            if (selectorPart) {
                const individualSelectors = selectorPart.split(',').map(s => s.trim()).filter(s => s);
                selectors += individualSelectors.length;

                for (const s of individualSelectors) {
                    const spec = calculateSpecificity(s);
                    const weight = spec[0] * 10000 + spec[1] * 100 + spec[2];
                    allSelectorsList.push({
                        selector: s,
                        specificityStr: `[${spec[0]}, ${spec[1]}, ${spec[2]}]`,
                        weight
                    });
                }
            }
        }
    }

    const topSelectors = allSelectorsList
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5)
        .map(item => ({ selector: item.selector, specificity: item.specificityStr }));
    let declarations = 0;
    if (rulesMatch) {
        for (const rule of rulesMatch) {
            const inner = rule.substring(1, rule.length - 1).trim();
            if (inner) {
               const decls = inner.split(';').filter(d => d.trim().includes(':'));
               declarations += decls.length;
            }
        }
    }
    const variables: Array<{name: string, value: string}> = [];
    const varRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let match;
    while ((match = varRegex.exec(noComments)) !== null) {
        variables.push({ name: match[1], value: match[2].trim() });
    }
    const colorMap = new SvelteMap<string, number>();
    const colorRegex = /(#([0-9a-fA-F]{3,8}))|(rgba?\([^)]+\))|(hsla?\([^)]+\))/g;
    let colorMatch;
    while ((colorMatch = colorRegex.exec(noComments)) !== null) {
        const color = colorMatch[0].trim();
        const normColor = color.startsWith('#') ? color.toLowerCase() : color;
        colorMap.set(normColor, (colorMap.get(normColor) || 0) + 1);
    }
    const colors = Array.from(colorMap.entries())
        .map(([hex, count]) => ({ hex, count }))
        .sort((a, b) => b.count - a.count);
    const mediaQueryMap = new SvelteMap<string, number>();
    const mediaRegex = /@media\s+([^{]+)\s*\{/g;
    let mediaMatch;
    while ((mediaMatch = mediaRegex.exec(noComments)) !== null) {
        const query = mediaMatch[1].trim();
        mediaQueryMap.set(query, (mediaQueryMap.get(query) || 0) + 1);
    }
    const mediaQueries = Array.from(mediaQueryMap.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count);

    return { selectors, rules, declarations, variables, topSelectors, colors, mediaQueries };

  }

  function addVendorPrefixes() {
      let css = state.input;
      const prefixes = ['-webkit-', '-moz-', '-ms-', '-o-'];
      const propertiesToPrefix = [
          'transform', 'transition', 'box-shadow', 'border-radius',
          'user-select', 'appearance', 'animation', 'flex', 'align-items', 'justify-content'
      ];

      propertiesToPrefix.forEach(prop => {
          const regex = new RegExp(`(^|[{;\\s])(${prop}\\s*:\\s*[^;}]+)(;|})`, 'g');
          css = css.replace(regex, (match, before, decl, after) => {
              if (css.includes(`-webkit-${decl}`)) return match;
              let prefixesStr = '';
              prefixes.forEach(p => {
                  prefixesStr += `${before}${p}${decl};`;
              });
              return `${prefixesStr}${before}${decl}${after}`;
          });
      });

      state.input = css;
      setAction('format');
      triggerToast(dictionary?.tools?.cssForge?.feedback?.prefixed || 'Vendor prefixes added');
  }


  import { onMount, onDestroy } from 'svelte';

  let showToast = false;
  let toastMessage = '';

  let navigatorShareSupported = false;
  onMount(() => {
      navigatorShareSupported = typeof navigator !== 'undefined' && !!navigator.share;
  });

  function downloadResult() {
      if (!state.output) return;
      const blob = new Blob([state.output], { type: 'text/css' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `css-forge-${Date.now()}.css`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast(dictionary?.tools?.cssForge?.feedback?.downloaded || 'Downloaded');
  }

  async function shareResult() {
      if (!state.output || !navigatorShareSupported) return;
      try {
          await navigator.share({
              title: 'CSS Forge Result',
              text: state.output,
          });
          triggerToast(dictionary?.tools?.cssForge?.feedback?.shared || 'Shared successfully');
      } catch (err) {
          console.error('Error sharing:', err);
      }
  }

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
  function autoFix() {
      let css = state.input;
      css = css.replace(/([^;\s{}])\s*}/g, '$1;}');
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
      const lines = css.split('\n');
      lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed.includes(':') && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.startsWith('/*')) {
             if(!trimmed.includes(',')) {
                 validationErrors.push("Potential missing semicolon at line " + (index + 1));
             }
          }
      });
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
                {#each validationErrors as error, i (i)}
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
            <div class="flex gap-1">
                <button class="p-1.5 text-slate-500 hover:text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" on:click={() => copyToClipboard(state.output)} title="Copy Result (Ctrl/Cmd + S)" aria-label="Copy output">
                    <Copy size={16} />
                </button>
                <button class="p-1.5 text-slate-500 hover:text-emerald-500 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" on:click={downloadResult} title="Download CSS" aria-label="Download CSS">
                    <Download size={16} />
                </button>
                {#if navigatorShareSupported}
                    <button class="p-1.5 text-slate-500 hover:text-indigo-500 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" on:click={shareResult} title="Share CSS" aria-label="Share CSS">
                        <Share2 size={16} />
                    </button>
                {/if}
            </div>
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

                <div class="mt-8">
                     <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">{dictionary?.tools?.cssForge?.extractedVariables || 'Extracted Variables'}</h3>
                     {#if state.statistics.variables.length > 0}
                         <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {#each state.statistics.variables as v, i (i)}
                                 <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                                     <div class="flex flex-col overflow-hidden mr-2">
                                         <span class="text-xs font-medium text-slate-500 dark:text-slate-400 truncate" title={v.name}>{v.name}</span>
                                         <span class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate" title={v.value}>{v.value}</span>
                                     </div>
                                     {#if v.value.match(/^(#|rgb|rgba|hsl|hsla)/i)}
                                         <div class="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 shadow-inner flex-shrink-0" style="background-color: {v.value};"></div>
                                     {/if}
                                 </div>
                             {/each}
                         </div>
                     {:else}
                         <div class="text-sm text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center border border-dashed border-slate-300 dark:border-slate-700">
                             {dictionary?.tools?.cssForge?.noVariables || 'No variables found.'}
                         </div>
                     {/if}
                </div>

                <div class="mt-8">
                     <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">{dictionary?.tools?.cssForge?.topSpecificSelectors || 'Top Specific Selectors'}</h3>
                     {#if state.statistics.topSelectors && state.statistics.topSelectors.length > 0}
                         <div class="grid grid-cols-1 gap-2">
                             {#each state.statistics.topSelectors as item, i (i)}
                                 <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                                     <div class="flex flex-col overflow-hidden mr-2">
                                         <span class="text-sm font-mono text-slate-900 dark:text-slate-100 truncate" title={item.selector}>{item.selector}</span>
                                     </div>
                                     <div class="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0" title="[id, class, tag]">
                                         {item.specificity}
                                     </div>
                                 </div>
                             {/each}
                         </div>
                     {:else}
                         <div class="text-sm text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center border border-dashed border-slate-300 dark:border-slate-700">
                             No selectors found.
                         </div>
                     {/if}
                </div>

                <div class="mt-8">
                     <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">{dictionary?.tools?.cssForge?.extractedColors || 'Extracted Color Palette'}</h3>
                     {#if state.statistics.colors && state.statistics.colors.length > 0}
                         <div class="flex flex-wrap gap-3">
                             {#each state.statistics.colors as item, i (i)}
                                 <div class="group relative flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:border-blue-300 transition-colors w-20">
                                     <button class="w-10 h-10 rounded shadow-inner border border-slate-200 dark:border-slate-700 mb-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform hover:scale-110" style="background-color: {item.hex};" on:click={() => copyToClipboard(item.hex)} title="Copy {item.hex}" aria-label="Copy color {item.hex}"></button>
                                     <span class="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate w-full text-center" title={item.hex}>{item.hex}</span>
                                     <span class="absolute -top-2 -right-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.count}</span>
                                 </div>
                             {/each}
                         </div>
                     {:else}
                         <div class="text-sm text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center border border-dashed border-slate-300 dark:border-slate-700">
                             {dictionary?.tools?.cssForge?.noColors || 'No colors found.'}
                         </div>
                     {/if}
                </div>

                <div class="mt-8">
                     <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">{dictionary?.tools?.cssForge?.mediaBreakpoints || 'Media Query Breakpoints'}</h3>
                     {#if state.statistics.mediaQueries && state.statistics.mediaQueries.length > 0}
                         <div class="grid grid-cols-1 gap-2">
                             {#each state.statistics.mediaQueries as item, i (i)}
                                 <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                                     <div class="flex flex-col overflow-hidden mr-2">
                                         <span class="text-sm font-mono text-slate-900 dark:text-slate-100 truncate" title={item.query}>{item.query}</span>
                                     </div>
                                     <div class="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0" title="Occurrences">
                                         {item.count}
                                     </div>
                                 </div>
                             {/each}
                         </div>
                     {:else}
                         <div class="text-sm text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center border border-dashed border-slate-300 dark:border-slate-700">
                             {dictionary?.tools?.cssForge?.noMediaQueries || 'No media queries found.'}
                         </div>
                     {/if}
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
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 min-h-[44px]"
            on:click={addVendorPrefixes}
            title="Auto-prefix common properties like transform, transition, box-shadow"
            aria-label="Add vendor prefixes"
        >
            <Layers size={16} class="text-indigo-500" />
            Prefix
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
