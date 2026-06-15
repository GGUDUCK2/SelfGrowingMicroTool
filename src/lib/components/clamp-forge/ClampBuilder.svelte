<script lang="ts">

  import { Copy, Save, Check, Monitor, Settings2, Share } from '@lucide/svelte';
  import { dictionaries } from '$lib/dictionaries';
  import type { ClampForgeHistory } from '$lib/db';
  import { clampForgeWorkspace } from '$lib/db/workspace';
  import { browser } from '$app/environment';
  import { onMount, onDestroy } from 'svelte';
  import ClampHistory from './ClampHistory.svelte';

  export let lang: string = 'en';

  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = dict.tools.clampForge;



  // State
  let mode: 'typography' | 'spacing' = 'typography';
  let minWidth = 320;
  let maxWidth = 1200;
  let minSize = 1; // 1rem or 16px
  let maxSize = 2.5; // 2.5rem or 40px
  let unit: 'rem' | 'px' = 'rem';
  let baseRem = 16;




  let activeTab: 'builder' | 'scale' | 'preview' | 'history' | 'reverse' = 'builder';
  let reverseInput = '';
  let reverseError = '';
  const handleReverse = () => {
    reverseError = '';
    if (!reverseInput.trim()) return;
    const regex = /clamp\(\s*(-?[\d.]+)(rem|px)\s*,\s*(-?[\d.]+)(rem|px)\s*([+-])\s*([\d.]+)vw\s*,\s*(-?[\d.]+)(rem|px)\s*\)/;
    const match = reverseInput.match(regex);
    if (!match) {
      reverseError = 'Invalid clamp function format.';
      return;
    }
    let [ , minSizeStr, unit1, intersectionStr, unit2, sign, slopeVwStr, maxSizeStr, unit3 ] = match;
    if (unit1 !== unit3) {
      reverseError = 'Min and Max size units must match.';
      return;
    }
    let rUnit = unit1;
    let rMinSize = parseFloat(minSizeStr);
    let rMaxSize = parseFloat(maxSizeStr);
    let intersection = parseFloat(intersectionStr);
    let slope = parseFloat(slopeVwStr) / 100;
    if (sign === '-') slope = -slope;
    if (rUnit === 'px') {
      rMinSize /= baseRem;
      rMaxSize /= baseRem;
    }
    if (unit2 === 'px') {
      intersection /= baseRem;
    }
    let minWidthRem = (rMinSize - intersection) / slope;
    let maxWidthRem = (rMaxSize - intersection) / slope;
    minWidth = Math.round(minWidthRem * baseRem);
    maxWidth = Math.round(maxWidthRem * baseRem);
    minSize = rUnit === 'px' ? rMinSize * baseRem : rMinSize;
    maxSize = rUnit === 'px' ? rMaxSize * baseRem : rMaxSize;
    unit = rUnit as "px" | "rem";
    activeTab = 'builder';
  };

  let copiedCss = false;
  let copiedTw = false;
  let copiedVars = false;

  import { fade } from 'svelte/transition';

  // Advanced Exports
  let exportFormat: 'css' | 'tailwind' | 'scss' = 'css';

  $: formattedExportText = (() => {
      const prefix = mode === 'spacing' ? 'spacing' : 'font-size';

      if (exportFormat === 'css') {
          const lines = generatedScale.map(step => `  --${prefix}-${step.name}: ${step.clamp};`).join('\n');
          return `:root {\n${lines}\n}`;
      }

      if (exportFormat === 'tailwind') {
          let twObj = generatedScale.reduce((acc, step) => {
              acc[step.name] = step.clamp;
              return acc;
          }, {} as Record<string, string>);

          return `module.exports = {
  theme: {
    extend: {
      ${mode === 'spacing' ? 'spacing' : 'fontSize'}: ${JSON.stringify(twObj, null, 8).replace(/}$/, '      }')}
    }
  }
}`;
      }

      if (exportFormat === 'scss') {
          return generatedScale.map(step => `${prefix}-${step.name}: ${step.clamp};`).join('\n');
      }

      return scaleVariablesText;
  })();

  // Interactive Simulator
  let simulatorWidth = 768; // Initial simulator width
  $: {
    // Keep simulator width within min/max bounds when they change
    if (simulatorWidth < minWidth) simulatorWidth = minWidth;
    if (simulatorWidth > maxWidth) simulatorWidth = maxWidth;
  }

  // Smart Preset indicator logic
  $: activeBreakpoint = (() => {
    if (simulatorWidth <= 480) return 'mobile';
    if (simulatorWidth > 480 && simulatorWidth <= 768) return 'tablet';
    if (simulatorWidth > 768 && simulatorWidth <= 1024) return 'laptop';
    return 'desktop';
  })();

  $: simulatedSize = (() => {
    let vwRem = simulatorWidth / baseRem;
    let valRem = intersection + (slope * vwRem);
    if (valRem < minSizeVal) valRem = minSizeVal;
    if (valRem > maxSizeVal) valRem = maxSizeVal;

    // Return in px for display
    return (valRem * baseRem).toFixed(1);
  })();



  const handleKeydown = (e: KeyboardEvent) => {
    // Don't hijack if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault();
      copyToClipboard(calculatedClamp, 'css');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveScale();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      resetToDefault();
    }
  };

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
// Interactive Preview
  let customPreviewText = 'Fluid Typography';


  const resetToDefault = () => {
      minWidth = 320; maxWidth = 1200; minSize = 1; maxSize = 2.5; unit = 'rem';
      customPreviewText = 'Fluid Typography';
  };

  // Scale Generator State
  let scaleRatio = 1.25; // Major Third by default
  let scaleStepsDown = 2; // xs, sm
  let scaleStepsUp = 5; // lg, xl, 2xl, 3xl, 4xl

  // Common Scale Ratios
  const scaleRatios = [
    { name: 'Minor Second (1.067)', value: 1.067 },
    { name: 'Major Second (1.125)', value: 1.125 },
    { name: 'Minor Third (1.200)', value: 1.200 },
    { name: 'Major Third (1.250)', value: 1.250 },
    { name: 'Perfect Fourth (1.333)', value: 1.333 },
    { name: 'Augmented Fourth (1.414)', value: 1.414 },
    { name: 'Perfect Fifth (1.500)', value: 1.500 },
    { name: 'Golden Ratio (1.618)', value: 1.618 }
  ];

  type Preset = 'h1' | 'h2' | 'body' | 'spacing';

  const applyPreset = (preset: Preset) => {
    mode = preset === 'spacing' ? 'spacing' : 'typography';
    unit = 'rem';
    minWidth = 320;
    maxWidth = 1200;

    switch (preset) {
      case 'h1':
        minSize = 2.5;
        maxSize = 4.5;
        break;
      case 'h2':
        minSize = 1.75;
        maxSize = 3;
        break;
      case 'body':
        minSize = 1;
        maxSize = 1.25;
        break;
      case 'spacing':
        minSize = 1.5;
        maxSize = 3;
        break;
    }
  };

  // Math
  // slope = (maxSize - minSize) / (maxWidth - minWidth)
  // intersection = -minWidth * slope + minSize
  $: minWidthRem = minWidth / baseRem;
  $: maxWidthRem = maxWidth / baseRem;

  $: minSizeVal = unit === 'px' ? minSize / baseRem : minSize;
  $: maxSizeVal = unit === 'px' ? maxSize / baseRem : maxSize;

  $: slope = (maxSizeVal - minSizeVal) / (maxWidthRem - minWidthRem);
  $: intersection = -minWidthRem * slope + minSizeVal;

  $: slopeVw = +(slope * 100).toFixed(4);
  $: intersectionRem = +intersection.toFixed(4);

  // clamp(MIN, VAL, MAX)
  $: calculatedClamp = `clamp(${+(minSizeVal).toFixed(4)}rem, ${intersectionRem}rem + ${slopeVw}vw, ${+(maxSizeVal).toFixed(4)}rem)`;
  $: tailwindClass = `text-[${calculatedClamp}]`;

  // Calculate Scale Array
  $: generatedScale = (() => {
      const steps = [];
      const totalSteps = scaleStepsDown + 1 + scaleStepsUp;
      let currentMin = minSizeVal / Math.pow(scaleRatio, scaleStepsDown);
      let currentMax = maxSizeVal / Math.pow(scaleRatio, scaleStepsDown);

      const stepNames = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl'];
      // Shift index so 'base' is at scaleStepsDown
      const startIndex = Math.max(0, 2 - scaleStepsDown);

      for (let i = 0; i < totalSteps; i++) {
          const sSlope = (currentMax - currentMin) / (maxWidthRem - minWidthRem);
          const sIntersection = -minWidthRem * sSlope + currentMin;
          const sSlopeVw = +(sSlope * 100).toFixed(4);
          const sIntersectionRem = +sIntersection.toFixed(4);
          const sClamp = `clamp(${+(currentMin).toFixed(4)}rem, ${sIntersectionRem}rem + ${sSlopeVw}vw, ${+(currentMax).toFixed(4)}rem)`;

          let name = stepNames[startIndex + i] || `step-${i}`;
          if (i === scaleStepsDown) name = 'base';

          steps.push({
             name: name,
             min: +(currentMin).toFixed(4),
             max: +(currentMax).toFixed(4),
             clamp: sClamp
          });

          currentMin *= scaleRatio;
          currentMax *= scaleRatio;
      }
      return steps;
  })();

  $: scaleVariablesText = `:root {\n${generatedScale.map(s => `  --${mode === 'spacing' ? 'spacing' : 'text'}-${s.name}: ${s.clamp};`).join('\n')}\n}`;

  const downloadFile = (content: string, filename: string) => {
    if (!browser) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text: string, type: 'css' | 'tw' | 'vars') => {
    if (browser) {
      await navigator.clipboard.writeText(text);
      if (type === 'css') {
        copiedCss = true;
        setTimeout(() => copiedCss = false, 2000);
      } else if (type === 'tw') {
        copiedTw = true;
        setTimeout(() => copiedTw = false, 2000);
      } else if (type === 'vars') {
        copiedVars = true;
        setTimeout(() => copiedVars = false, 2000);
      }
    }
  };

  const shareResult = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: d.title || 'Clamp Forge Result',
          text: `Here is my fluid typography setting:
${calculatedClamp}`,
          url: window.location.href,
        });
      } catch (err) {
        // Share failed
      }
    } else {
      copyToClipboard(calculatedClamp, 'css');
    }
  };

  let showSaveToast = false;

  const saveScale = async () => {
    if (browser) {
      await clampForgeWorkspace.save({
        minWidth,
        maxWidth,
        minSize,
        maxSize,
        unit,
        result: calculatedClamp
      });
      showSaveToast = true;
      setTimeout(() => showSaveToast = false, 2000);
      // Removed automatic redirection to 'history' for better builder UX flow
    }
  };

  const handleRestore = (item: ClampForgeHistory) => {
    minWidth = item.minWidth;
    maxWidth = item.maxWidth;
    minSize = item.minSize;
    maxSize = item.maxSize;
    unit = item.unit as 'rem' | 'px';
    activeTab = 'builder';
  };


</script>



<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div class="lg:col-span-2 space-y-6">
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div class="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <button
          class="flex-1 py-4 px-2 whitespace-nowrap text-sm font-medium transition-colors {activeTab === 'builder' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px]"
          on:click={() => activeTab = 'builder'}
        >
          {d.title || 'Builder'}
        </button>
        <button
          class="flex-1 py-4 px-2 whitespace-nowrap text-sm font-medium transition-colors {activeTab === 'scale' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px]"
          on:click={() => activeTab = 'scale'}
        >
          {d.scaleTitle || 'Scale Mode'}
        </button>
        <button
          class="flex-1 py-4 px-2 whitespace-nowrap text-sm font-medium transition-colors {activeTab === 'preview' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px]"
          on:click={() => activeTab = 'preview'}
        >
          {d.scalePreview || 'Scale Preview'}
        </button>
        <button
          class="flex-1 py-4 px-2 whitespace-nowrap text-sm font-medium transition-colors {activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px]"
          on:click={() => activeTab = 'history'}
        >
          {d.history || 'History'}
        </button>
        <button
          class="flex-1 py-4 px-2 whitespace-nowrap text-sm font-medium transition-colors {activeTab === 'reverse' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px]"
          on:click={() => activeTab = 'reverse'}
        >
          {d.reverseTab || 'Reverse'}
        </button>
      </div>

      <!-- Keyboard Shortcuts Help -->
      <div class="px-6 sm:px-8 pt-4 pb-2 text-xs text-slate-400 dark:text-slate-500 flex flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800">
          <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 font-mono text-[10px]">Ctrl+Enter</kbd> {d.shortcutCopy || 'Copy Clamp'}</span>
          <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 font-mono text-[10px]">Ctrl+S</kbd> {d.shortcutSave || 'Save History'}</span>
          <span class="flex items-center gap-1"><kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 font-mono text-[10px]">Esc</kbd> {d.shortcutReset || 'Reset'}</span>
      </div>

      <div class="p-6 sm:p-8">
        {#if activeTab === 'reverse'}
          <div class="space-y-8" in:fade>
             <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">{d.reverseTitle || 'Reverse Clamp Engine'}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">{d.reverseDesc || 'Paste an existing CSS clamp() function, and we will reverse-engineer the minimum and maximum viewport widths used to generate it!'}</p>

                <div class="space-y-4">
                  <label class="block">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{d.pasteClamp || 'Paste Clamp Function'}</span>
                    <input
                      type="text"
                      bind:value={reverseInput}
                      placeholder="e.g. clamp(1rem, 0.5rem + 2.5vw, 2.5rem)"
                      class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white px-4 py-3 font-mono min-h-[44px]"
                    />
                  </label>
                  {#if reverseError}
                    <p class="text-sm text-rose-500 font-medium">{reverseError}</p>
                  {/if}
                  <button
                    on:click={handleReverse}
                    class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px]"
                  >
                    {d.reverseBtn || 'Reverse Engineer Viewports'}
                  </button>
                </div>
             </div>
          </div>
        {:else if activeTab === 'builder'}
          <div class="space-y-8" in:fade>



      <!-- Mode Toggle -->
      <div class="mb-6 flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full max-w-sm">
        <button
          aria-label="Typography Mode"
          class="flex-1 min-h-[44px] text-sm font-medium rounded-md transition-colors {mode === 'typography' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500'}"
          on:click={() => mode = 'typography'}
        >
          Typography
        </button>
        <button
          aria-label="Spacing Mode"
          class="flex-1 min-h-[44px] text-sm font-medium rounded-md transition-colors {mode === 'spacing' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500'}"
          on:click={() => mode = 'spacing'}
        >
          Spacing
        </button>
      </div>

      <!-- Smart Presets -->
      <div class="mb-8">
        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">{d.smartPresets || 'Smart Presets'}</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
           <button on:click={() => applyPreset('h1')} class="py-2 px-3 text-xs font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition-colors min-h-[44px] flex flex-col items-center justify-center border border-indigo-100 dark:border-indigo-800">
             <span class="block">{d.h1Title || 'H1 Title'}</span>
           </button>
           <button on:click={() => applyPreset('h2')} class="py-2 px-3 text-xs font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition-colors min-h-[44px] flex flex-col items-center justify-center border border-indigo-100 dark:border-indigo-800">
             <span class="block">{d.h2Subtitle || 'H2 Subtitle'}</span>
           </button>
           <button on:click={() => applyPreset('body')} class="py-2 px-3 text-xs font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition-colors min-h-[44px] flex flex-col items-center justify-center border border-indigo-100 dark:border-indigo-800">
             <span class="block">{d.bodyText || 'Body Text'}</span>
           </button>
           <button on:click={() => applyPreset('spacing')} class="py-2 px-3 text-xs font-medium rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 transition-colors min-h-[44px] flex flex-col items-center justify-center border border-emerald-100 dark:border-emerald-800">
             <span class="block">{d.spacing || 'Spacing'}</span>
           </button>
        </div>
      </div>

        <!-- Viewport Settings -->
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <Monitor class="mr-2 h-5 w-5 text-indigo-500" />
                Viewport
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label for="minWidth" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {d.minViewport} (px)
                  </label>
                  <input id="minWidth" type="number" bind:value={minWidth} class="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                </div>
                <div class="space-y-2">
                  <label for="maxWidth" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {d.maxViewport} (px)
                  </label>
                  <input id="maxWidth" type="number" bind:value={maxWidth} class="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                </div>
              </div>
            </div>

            <!-- Size Settings -->
            <div class="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <Settings2 class="mr-2 h-5 w-5 text-indigo-500" />
                  Sizes
                </h3>

                <div class="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                  <button
                    aria-label="Unit Rem"
                    class="px-3 py-1.5 min-h-[44px] min-w-[44px] text-sm font-medium rounded-md transition-colors {unit === 'rem' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500'}"
                    on:click={() => unit = 'rem'}
                  >
                    {d.rems}
                  </button>
                  <button
                    aria-label="Unit Px"
                    class="px-3 py-1.5 min-h-[44px] min-w-[44px] text-sm font-medium rounded-md transition-colors {unit === 'px' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500'}"
                    on:click={() => unit = 'px'}
                  >
                    {d.pixels}
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div class="space-y-2">
                  <label for="minSize" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {d.minSize} ({unit})
                  </label>
                  <input id="minSize" type="number" step={unit === 'rem' ? '0.125' : '1'} bind:value={minSize} class="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                </div>
                <div class="space-y-2">
                  <label for="maxSize" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {d.maxSize} ({unit})
                  </label>
                  <input id="maxSize" type="number" step={unit === 'rem' ? '0.125' : '1'} bind:value={maxSize} class="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                </div>
              </div>

              <div class="space-y-2">
                <label for="baseRem" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {d.baseRem}
                </label>
                <input id="baseRem" type="number" bind:value={baseRem} class="w-full sm:w-1/2 min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
              </div>
            </div>

          </div>
        {:else if activeTab === 'scale'}
          <div class="space-y-8" in:fade>
             <div class="space-y-6">
                <p class="text-sm text-slate-600 dark:text-slate-400">
                    {d.scaleDesc || 'Generate a full fluid typography scale based on a ratio.'}
                </p>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label for="scaleRatio" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {d.scaleRatio || 'Scale Ratio'}
                        </label>
                        <select id="scaleRatio" bind:value={scaleRatio} class="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white mb-2">
                            {#each scaleRatios as ratio (ratio.value)}
                                <option value={ratio.value}>{ratio.name}</option>
                            {/each}
                        </select>

                        <div class="flex gap-2 mt-2 flex-wrap">
                            <button aria-label="Set Scale Ratio to Major Third" on:click={() => scaleRatio = 1.250} class="min-h-[44px] px-3 py-1 text-xs font-medium rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 transition-colors focus:ring-2 focus:ring-indigo-500">
                                Major Third (1.250)
                            </button>
                            <button aria-label="Set Scale Ratio to Perfect Fourth" on:click={() => scaleRatio = 1.333} class="min-h-[44px] px-3 py-1 text-xs font-medium rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 transition-colors focus:ring-2 focus:ring-indigo-500">
                                Perfect Fourth (1.333)
                            </button>
                            <button aria-label="Set Scale Ratio to Golden Ratio" on:click={() => scaleRatio = 1.618} class="min-h-[44px] px-3 py-1 text-xs font-medium rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 transition-colors focus:ring-2 focus:ring-indigo-500">
                                Golden Ratio (1.618)
                            </button>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label for="scaleStepsDown" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {d.stepsDown || 'Steps Down (Smaller)'}
                        </label>
                        <input id="scaleStepsDown" type="number" min="0" max="4" bind:value={scaleStepsDown} class="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                    </div>
                    <div class="space-y-2">
                        <label for="scaleStepsUp" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {d.stepsUp || 'Steps Up (Larger)'}
                        </label>
                        <input id="scaleStepsUp" type="number" min="0" max="8" bind:value={scaleStepsUp} class="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white" />
                    </div>
                </div>

                <div class="mt-8 space-y-4">
                    <div class="flex justify-between items-end">
                         <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                            {d.generatedVariables || 'Generated Variables'}
                         </h3>
                         <div class="flex items-center space-x-2 flex-wrap sm:flex-nowrap gap-2 sm:gap-0">
                            <button
                                on:click={() => copyToClipboard(formattedExportText, 'vars')}
                                class="min-h-[44px] px-4 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors font-medium text-sm"
                            >
                                {#if copiedVars}
                                <Check size={16} />
                                <span>Copied!</span>
                                {:else}
                                <Copy size={16} />
                                <span>{d.copyVariables || 'Copy All'}</span>
                                {/if}
                            </button>

                            {#if exportFormat === 'css'}
                                <button
                                    on:click={() => downloadFile(formattedExportText, 'fluid-scale.css')}
                                    class="min-h-[44px] px-4 flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg shadow-sm transition-colors font-medium text-sm"
                                >
                                    <span>Download .css</span>
                                </button>
                            {:else if exportFormat === 'tailwind'}
                                <button
                                    on:click={() => downloadFile(formattedExportText, 'tailwind.fluid.js')}
                                    class="min-h-[44px] px-4 flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg shadow-sm transition-colors font-medium text-sm"
                                >
                                    <span>Download .js</span>
                                </button>
                            {/if}
                        </div>
                    </div>

                                        <div class="flex items-center space-x-2 mb-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg inline-flex">
                        <button
                            aria-label="Export CSS Variables"
                            class="px-3 py-1.5 min-h-[44px] text-xs font-medium rounded-md transition-colors {exportFormat === 'css' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 focus:ring-2 focus:ring-indigo-500'}"
                            on:click={() => exportFormat = 'css'}
                        >
                            CSS Variables
                        </button>
                        <button
                            aria-label="Export Tailwind Config"
                            class="px-3 py-1.5 min-h-[44px] text-xs font-medium rounded-md transition-colors {exportFormat === 'tailwind' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 focus:ring-2 focus:ring-indigo-500'}"
                            on:click={() => exportFormat = 'tailwind'}
                        >
                            Tailwind Config
                        </button>
                        <button
                            aria-label="Export SCSS"
                            class="px-3 py-1.5 min-h-[44px] text-xs font-medium rounded-md transition-colors {exportFormat === 'scss' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 focus:ring-2 focus:ring-indigo-500'}"
                            on:click={() => exportFormat = 'scss'}
                        >
                            SCSS
                        </button>
                    </div>

                    <div class="bg-slate-900 p-4 rounded-xl overflow-x-auto custom-scrollbar border border-slate-700 relative group">
                        <pre class="text-sm font-mono text-slate-300"><code>{formattedExportText}</code></pre>
                    </div>

                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead class="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-300">
                                <tr>
                                    <th scope="col" class="px-4 py-3">Step</th>
                                    <th scope="col" class="px-4 py-3">Min</th>
                                    <th scope="col" class="px-4 py-3">Max</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each generatedScale as step (step.name)}
                                    <tr class="bg-white border-b dark:bg-slate-900 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <td class="px-4 py-3 font-medium text-slate-900 whitespace-nowrap dark:text-white">
                                            {step.name}
                                        </td>
                                        <td class="px-4 py-3">{step.min}rem</td>
                                        <td class="px-4 py-3">{step.max}rem</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>
          </div>
        {:else if activeTab === 'preview'}
          <div in:fade class="space-y-8">
             <div class="flex items-center justify-between">
                <div>
                   <h3 class="text-lg font-bold text-slate-900 dark:text-white">{d.scalePreviewTitle || 'Typography Scale Preview'}</h3>
                   <p class="text-sm text-slate-500">{d.scalePreviewDesc || 'Visual representation of your generated scale'}</p>
                </div>
             </div>

             <div class="space-y-12 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                {#each [...generatedScale].reverse() as step (step.name)}
                   <div class="border-b border-slate-100 dark:border-slate-800 pb-8 last:border-0 last:pb-0">
                      <div class="flex items-baseline justify-between mb-2">
                         <span class="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                            {step.name}
                         </span>
                         <span class="text-xs font-mono text-slate-400">
                            {step.min}rem &rarr; {step.max}rem
                         </span>
                      </div>
                      <p
                         class="text-slate-900 dark:text-white font-bold leading-tight"
                         style="font-size: {step.clamp};"
                      >
                         The quick brown fox jumps over the lazy dog
                      </p>
                   </div>
                {/each}
             </div>
          </div>
        {:else}
          <div in:fade>
            <ClampHistory {lang} onRestore={handleRestore} />
          </div>
        {/if}
      </div>
    </div>

    {#if activeTab === 'builder'}
    <div class="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50">
      <h3 class="text-sm font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide mb-4">
        {d.resultLabel}
      </h3>

      <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-200 dark:border-indigo-700/50 mb-6 relative group break-all">
        <code class="text-lg font-mono text-slate-800 dark:text-slate-200">
          {calculatedClamp}
        </code>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <button
          on:click={() => copyToClipboard(calculatedClamp, 'css')}
          class="min-h-[44px] flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors font-medium text-sm"
        >
          {#if copiedCss}
            <Check size={18} />
            <span>Copied!</span>
          {:else}
            <Copy size={18} />
            <span>{d.copyCss}</span>
          {/if}
        </button>

        <button
          on:click={() => copyToClipboard(tailwindClass, 'tw')}
          class="min-h-[44px] flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg shadow-sm transition-colors font-medium text-sm"
        >
          {#if copiedTw}
            <Check size={18} />
            <span>Copied!</span>
          {:else}
            <Copy size={18} />
            <span>{d.copyTailwind}</span>
          {/if}
        </button>

        <button
          on:click={saveScale}
          class="min-h-[44px] flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 rounded-lg shadow-sm transition-colors font-medium text-sm"
        >
          {#if showSaveToast}
            <Check size={18} />
            <span>Saved!</span>
          {:else}
            <Save size={18} />
            <span>{d.saveScale}</span>
          {/if}
        </button>

        <button
          on:click={shareResult}
          class="min-h-[44px] sm:col-span-3 flex items-center justify-center space-x-2 bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors font-medium text-sm"
        >
          <Share size={18} />
          <span>{d.share || 'Share Result'}</span>
        </button>
      </div>

      <div class="text-xs text-slate-500 text-center mt-4">
        {d.shortcutsHint || 'Shortcuts: Ctrl+C (Copy), Ctrl+S (Save), Esc (Reset)'}
      </div>
    </div>
    {/if}
  </div>

  <div class="lg:col-span-1">
    <div class="sticky top-8 space-y-6">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide mb-6">
          {d.visualizerTitle}
        </h3>

        <div class="relative h-48 w-full border-l-2 border-b-2 border-slate-300 dark:border-slate-600">
          <!-- Graph visualization -->
          <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <!-- Grid lines -->
            <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" class="text-slate-100 dark:text-slate-700" stroke-width="1" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" class="text-slate-100 dark:text-slate-700" stroke-width="1" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" class="text-slate-100 dark:text-slate-700" stroke-width="1" />

            <!-- X axis markers for min/max width -->
            <line x1="20" y1="0" x2="20" y2="100" stroke="currentColor" stroke-dasharray="4" class="text-slate-300 dark:text-slate-500" stroke-width="1" />
            <line x1="80" y1="0" x2="80" y2="100" stroke="currentColor" stroke-dasharray="4" class="text-slate-300 dark:text-slate-500" stroke-width="1" />

            <!-- The Clamp Line -->
            <!-- Flat at min -->
            <line x1="0" y1="80" x2="20" y2="80" stroke="currentColor" class="text-indigo-500" stroke-width="3" />
            <!-- Sloped fluid area -->
            <line x1="20" y1="80" x2="80" y2="20" stroke="currentColor" class="text-indigo-500" stroke-width="3" />
            <!-- Flat at max -->
            <line x1="80" y1="20" x2="100" y2="20" stroke="currentColor" class="text-indigo-500" stroke-width="3" />

            <!-- Interactive Simulator Line -->
            {#if simulatorWidth >= minWidth && simulatorWidth <= maxWidth}
              {@const dynamicX = 20 + ((simulatorWidth - minWidth) / (maxWidth - minWidth)) * 60}
              {@const dynamicY = 80 - ((simulatorWidth - minWidth) / (maxWidth - minWidth)) * 60}
              <line x1="{dynamicX}" y1="0" x2="{dynamicX}" y2="100" stroke="currentColor" stroke-dasharray="2" class="text-rose-400 dark:text-rose-500" stroke-width="1.5" />
              <circle cx="{dynamicX}" cy="{dynamicY}" r="5" fill="currentColor" class="text-rose-500" />
            {/if}

            <!-- Points -->
            <circle cx="20" cy="80" r="4" fill="currentColor" class="text-indigo-600 dark:text-indigo-400" />
            <circle cx="80" cy="20" r="4" fill="currentColor" class="text-indigo-600 dark:text-indigo-400" />
          </svg>

          <!-- Labels -->
          <div class="absolute -left-12 bottom-0 text-xs text-slate-500">{minSize}{unit}</div>
          <div class="absolute -left-12 top-0 text-xs text-slate-500">{maxSize}{unit}</div>

          <div class="absolute bottom-[-24px] left-[10%] text-xs text-slate-500">{minWidth}px</div>
          <div class="absolute bottom-[-24px] left-[70%] text-xs text-slate-500">{maxWidth}px</div>
        </div>

        <div class="mt-12">
          <p class="text-sm text-center text-slate-600 dark:text-slate-400 mb-4">{d.livePreview || 'Live Preview'}</p>
          <div class="flex flex-col items-center">
              {#if mode === 'typography'}
                <input
                  type="text"
                  id="previewTextInput"
                  bind:value={customPreviewText}
                  class="font-bold text-center text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-4 rounded-lg w-full border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all min-h-[44px]"
                  style="font-size: {calculatedClamp}; line-height: 1.2;"
                  aria-label={d.customPreviewText || 'Custom Preview Text'}
                />
                <p class="text-xs text-slate-400 mt-2">{d.editPreviewHint || 'Try typing your own text above'}</p>
              {:else}
                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden" style="min-height: 150px; padding: 20px;">
                    <div class="relative bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-700 rounded-md shadow-inner transition-all duration-300 flex items-center justify-center" style="padding: {simulatedSize}px;">
                       <div class="absolute inset-0 pointer-events-none" style="background-image: repeating-linear-gradient(45deg, rgba(99, 102, 241, 0.1) 0, rgba(99, 102, 241, 0.1) 1px, transparent 1px, transparent 10px);"></div>
                       <div class="bg-indigo-500 rounded text-white px-4 py-2 font-mono text-sm shadow relative z-10">
                          Content Box
                       </div>
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">Visualizing padding at {simulatedSize}px ({Math.round(Number(simulatedSize)/baseRem * 100) / 100}rem)</p>
              {/if}
          </div>
        </div>

          <!-- Simulator Slider -->
          <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div class="flex justify-between items-center mb-2">
              <label for="simulatorRange" class="text-xs font-medium text-slate-600 dark:text-slate-400">
                {d.simulatorLabel || 'Viewport Width Simulator'}
              </label>
              <span class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                {simulatorWidth}px
              </span>
            </div>

            <div class="flex space-x-2 mb-4 overflow-x-auto pb-1">
              {#each [{bp: 320, name: 'Mobile'}, {bp: 768, name: 'Tablet'}, {bp: 1024, name: 'Desktop'}, {bp: 1440, name: 'Wide'}] as target (target.bp)}
                <button
                  on:click={() => simulatorWidth = target.bp}
                  class="flex-1 min-h-[36px] min-w-[50px] text-xs font-medium rounded transition-colors whitespace-nowrap flex flex-col items-center justify-center {simulatorWidth === target.bp ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}"
                  aria-label="Snap to {target.bp}px"
                >
                  <span>{target.name}</span>
                  <span class="text-[10px] opacity-70">{target.bp}px</span>
                </button>
              {/each}
            </div>

            <input
              id="simulatorRange"
              type="range"
              min={Math.max(320, minWidth - 200)}
              max={Math.min(3840, maxWidth + 400)}
              bind:value={simulatorWidth}
              class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            <div class="mt-4 flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
              <span class="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{d.computedSizeLabel || 'Computed Size'}</span>
              <span class="text-2xl font-bold font-mono text-slate-800 dark:text-white">
                {simulatedSize}px
              </span>
              <span class="text-xs text-slate-400 mt-1">
                ({(Number(simulatedSize) / baseRem).toFixed(2)}rem)
              </span>
            </div>
          </div>

      </div>
    </div>
  </div>

  <!-- Multi-Viewport Live Comparison Mode -->
  <div class="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
          <Monitor class="mr-2 h-5 w-5 text-indigo-500" />
          {d.multiViewportTitle || 'Live Multi-Device Preview'}
        </h3>
    </div>

    <div class="p-6 bg-slate-50 dark:bg-slate-900/50">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <!-- Mobile -->
            <div class="flex flex-col items-center space-y-3">
                <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between w-full max-w-[320px] px-2">
                    <span>Mobile</span>
                    <span>320px</span>
                </div>
                <div class="w-full max-w-[320px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 overflow-hidden">
                    <p class="font-bold text-slate-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis" style="font-size: clamp({minSize}{unit}, {intersection}{unit} + {slope * 100}vw, {maxSize}{unit}); line-height: 1.2;">
                        {customPreviewText || 'Fluid Typography'}
                    </p>
                </div>
            </div>

            <!-- Tablet -->
            <div class="flex flex-col items-center space-y-3">
                <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between w-full max-w-[768px] px-2">
                    <span>Tablet</span>
                    <span>768px</span>
                </div>
                <div class="w-full max-w-[768px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 overflow-hidden">
                    <p class="font-bold text-slate-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis" style="font-size: clamp({minSize}{unit}, {intersection}{unit} + {slope * 100}vw, {maxSize}{unit}); line-height: 1.2;">
                        {customPreviewText || 'Fluid Typography'}
                    </p>
                </div>
            </div>

            <!-- Desktop -->
            <div class="flex flex-col items-center space-y-3">
                <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between w-full max-w-[1024px] px-2">
                    <span>Desktop</span>
                    <span>1024px</span>
                </div>
                <div class="w-full max-w-[1024px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4 overflow-hidden">
                    <p class="font-bold text-slate-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis" style="font-size: clamp({minSize}{unit}, {intersection}{unit} + {slope * 100}vw, {maxSize}{unit}); line-height: 1.2;">
                        {customPreviewText || 'Fluid Typography'}
                    </p>
                </div>
            </div>
        </div>
        <p class="text-center text-xs text-slate-400 mt-6">{d.multiViewportHint || 'See how your font scales instantly across predefined breakpoints.'}</p>
    </div>
  </div>
</div>
