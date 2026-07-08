<script lang="ts">
  import { getContrastRatio, getWCAGStatus, simulateColorBlindness, type ColorBlindnessType, hexToRgb, getLuminance } from '$lib/utils/a11y-forge';
  import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
  import Palette from '@lucide/svelte/icons/palette';
  import Layers from '@lucide/svelte/icons/layers';
  import XCircle from '@lucide/svelte/icons/x-circle';
  import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
  import Droplet from '@lucide/svelte/icons/droplet';
  import Eye from '@lucide/svelte/icons/eye';
  import Sparkles from '@lucide/svelte/icons/sparkles';
  import Copy from '@lucide/svelte/icons/copy';
  import Share2 from '@lucide/svelte/icons/share-2';
  import HistoryList from '$lib/components/HistoryList.svelte';
  import { db } from '$lib/db';
  import { onMount, tick } from 'svelte';

  export let dict: Record<string, any>;


  // Palette Matrix State
  let mode: 'pair' | 'palette' = 'pair';
  let paletteInput = '#ffffff, #000000, #3b82f6, #ef4444, #10b981, #f59e0b';
  let paletteColors: string[] = [];
  $: paletteColors = paletteInput.split(',').map(c => c.trim()).filter(c => /^#[0-9A-F]{6}$/i.test(c) || /^#[0-9A-F]{3}$/i.test(c));

  let fgColor = '#FFFFFF';
  let bgColor = '#1E40AF';

  $: ratio = getContrastRatio(fgColor, bgColor);
  $: wcag = getWCAGStatus(ratio);

  $: t = dict?.tools?.a11yForge || {};
  $: c = t?.contrast || {};
  $: s = t?.simulator || {};
  $: h = t?.history || {};

  function swapColors() {
    const temp = fgColor;
    fgColor = bgColor;
    bgColor = temp;
    saveToHistory();
  }

  const simulations: { type: ColorBlindnessType, key: string }[] = [
    { type: 'protanopia', key: 'protanopia' },
    { type: 'deuteranopia', key: 'deuteranopia' },
    { type: 'tritanopia', key: 'tritanopia' },
    { type: 'achromatopsia', key: 'achromatopsia' }
  ];


  // Smart suggestion: Adjust fgColor lightness until it passes AA
  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h, s, l };
  }

  function rgbToHexStr(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
  }

  function applySmartSuggestion() {
    let currentRatio = getContrastRatio(fgColor, bgColor);
    if (currentRatio >= 4.5) return;

    const rgbFg = hexToRgb(fgColor);
    const rgbBg = hexToRgb(bgColor);
    if (!rgbFg || !rgbBg) return;

    const bgLum = getLuminance(rgbBg.r, rgbBg.g, rgbBg.b);
    let hsl = rgbToHsl(rgbFg.r, rgbFg.g, rgbFg.b);

    // We need to either increase or decrease lightness
    const step = 0.05;
    const maxIterations = 20;

    // If background is light, we want text to be darker.
    // If background is dark, we want text to be lighter.
    const direction = bgLum > 0.5 ? -1 : 1;

    for (let i = 0; i < maxIterations; i++) {
        hsl.l = Math.max(0, Math.min(1, hsl.l + step * direction));
        const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        const newHex = rgbToHexStr(newRgb.r, newRgb.g, newRgb.b);
        if (getContrastRatio(newHex, bgColor) >= 4.5) {
            fgColor = newHex;
            break;
        }
    }

    // Fallback if still doesn't pass
    if (getContrastRatio(fgColor, bgColor) < 4.5) {
        fgColor = direction > 0 ? '#FFFFFF' : '#000000';
    }
    saveToHistory();
  }

  // History implementation
  const presets = [
    { label: 'Standard Text', fg: '#334155', bg: '#F8FAFC' },
    { label: 'Dark Mode Accent', fg: '#818CF8', bg: '#0F172A' },
    { label: 'Alert Error', fg: '#FFFFFF', bg: '#EF4444' },
    { label: 'Accessible Primary', fg: '#FFFFFF', bg: '#2563EB' }
  ];

  async function loadPreset(preset: typeof presets[0]) {
    fgColor = preset.fg;
    bgColor = preset.bg;
    await tick();
    saveToHistory();
  }

  let historyItems: any[] = [];

  async function loadHistory() {
    try {
      historyItems = await db.a11yForgeHistory
        .where('type').equals('contrast')
        .reverse()
        .limit(20)
        .toArray();
    } catch (e) {
      console.error(e);
    }
  }


  function adjustColorForContrast(bgHex: string, currentFgHex: string, targetRatio: number): string {
    // Basic HSL adjustment logic (simplified for demonstration, converting to HSL and adjusting L)
    // Actually, simple brute force approach works well enough for simple auto-fix.
    // Let's use a simple strategy: lighten or darken the foreground until it passes.
    let r = parseInt(currentFgHex.slice(1, 3), 16);
    let g = parseInt(currentFgHex.slice(3, 5), 16);
    let b = parseInt(currentFgHex.slice(5, 7), 16);

    let isLightBg = getLuminance(bgHex) > 0.5;

    for(let i=0; i<50; i++) {
        let currentRatio = getContrastRatio(bgHex, `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
        if(currentRatio >= targetRatio) {
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }

        if (isLightBg) {
             r = Math.max(0, r - 5);
             g = Math.max(0, g - 5);
             b = Math.max(0, b - 5);
        } else {
             r = Math.min(255, r + 5);
             g = Math.min(255, g + 5);
             b = Math.min(255, b + 5);
        }
    }
    return isLightBg ? '#000000' : '#ffffff';
  }

  function applyAutoFix() {
    fgColor = adjustColorForContrast(bgColor, fgColor, 4.5);
    saveToHistory();
  }

async function saveToHistory() {
    try {
      await db.a11yForgeHistory.add({
        type: 'contrast',
        fgColor,
        bgColor,
        ratio,
        timestamp: Date.now()
      });

      await loadHistory();

      const count = await db.a11yForgeHistory.where('type').equals('contrast').count();
      if (count > 100) {
        const oldest = await db.a11yForgeHistory
          .where('type').equals('contrast')
          .filter(item => !item.starred)
          .limit(count - 100)
          .toArray();
        if(oldest.length > 0) {
             const toDelete = oldest.map(i => i.id!);
             await db.a11yForgeHistory.bulkDelete(toDelete);
             await loadHistory();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }


  async function toggleStarred(item: import("$lib/db").A11yForgeHistory) {
    try {
      await db.a11yForgeHistory.update(item.id, { starred: !item.starred });
      await loadHistory();
    } catch (err) {
      console.error(err);
    }
  }

  async function clearHistory() {
    try {
      await db.a11yForgeHistory.where('type').equals('contrast').delete();
      historyItems = [];
    } catch (e) {
      console.error(e);
    }
  }

  async function restoreItem(item: import("$lib/db").A11yForgeHistory) {
    if (item.fgColor && item.bgColor) {
        fgColor = item.fgColor;
        bgColor = item.bgColor;
    }
  }

  async function deleteItem(id: number) {
    try {
      await db.a11yForgeHistory.delete(id);

      await loadHistory();

      const count = await db.a11yForgeHistory.where('type').equals('contrast').count();
      if (count > 100) {
        const oldest = await db.a11yForgeHistory
          .where('type').equals('contrast')
          .filter(item => !item.starred)
          .limit(count - 100)
          .toArray();
        if(oldest.length > 0) {
             const toDelete = oldest.map(i => i.id!);
             await db.a11yForgeHistory.bulkDelete(toDelete);
             await loadHistory();
        }
      }
    } catch (e) {
        console.error(e);
    }
  }

  let debounceTimer: any;
  function handleColorChange() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
          saveToHistory();
      }, 1000);
  }

  async function handleKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      copyReport();
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      fgColor = '#FFFFFF';
      bgColor = '#1E40AF';
      await tick();
      saveToHistory();
    } else if (event.key === 'Escape') {
      clearHistory();
    }
  }

  async function copyReport() {
    const report = `Accessibility Contrast Report
Foreground: ${fgColor}
Background: ${bgColor}
Contrast Ratio: ${ratio.toFixed(2)}:1
Normal Text (4.5:1): ${wcag.normal}
Large Text (3.0:1): ${wcag.large}
UI Components (3.0:1): ${wcag.ui}

Generated via A11y Forge`;
    try {
      await navigator.clipboard.writeText(report);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch(err) {
      console.error(err);
    }
  }

  async function shareReport() {
    const text = `Contrast Ratio: ${ratio.toFixed(2)}:1 (${fgColor} on ${bgColor})`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'A11y Forge Contrast Report',
          text: text,
          url: window.location.href
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      copyReport();
    }
  }

  let copied = false;

  onMount(() => {
      loadHistory();
      window.addEventListener('keydown', handleKeydown);
      return () => {
        window.removeEventListener('keydown', handleKeydown);
      };
  });

</script>

<div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
  <div class="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

    <!-- Mode Toggle -->
    <div class="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-2xl overflow-hidden mb-6" role="tablist">
      <button
        class="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2 min-h-[44px] {mode === 'pair' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-white dark:bg-slate-900' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}"
        on:click={() => mode = 'pair'}
        role="tab" aria-selected={mode === 'pair'}
      >
        <Layers size={16} />
        {c.pairMode || 'Pair Contrast'}
      </button>
      <button
        class="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2 min-h-[44px] {mode === 'palette' ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-white dark:bg-slate-900' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}"
        on:click={() => mode = 'palette'}
        role="tab" aria-selected={mode === 'palette'}
      >
        <Palette size={16} />
        {c.paletteMode || 'Palette Matrix'}
      </button>
    </div>

    {#if mode === 'pair'}


    <!-- Color Inputs -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">

      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Droplet size={16} class="text-indigo-500" />
          {c.fgColor || 'Foreground Color'}
        </label>
        <div class="flex items-center gap-3">
          <input
            type="color"
            bind:value={fgColor}
            on:input={handleColorChange}
            class="h-12 w-12 rounded cursor-pointer border-0 p-0 bg-transparent min-h-[44px] min-w-[44px]"
            aria-label={c.fgColor || 'Foreground Color'}
          />
          <input
            type="text"
            bind:value={fgColor}
            on:input={handleColorChange}
            class="flex-1 px-4 py-2.5 min-h-[44px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 font-mono"
            aria-label={c.fgColor || 'Foreground Color Hex'}
          />
        </div>
      </div>

      <!-- Swap Button -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-3 hidden md:flex items-center justify-center">
        <button
          on:click={swapColors}
          class="bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={c.swapColors || 'Swap Colors'}
        >
          <ArrowLeftRight size={18} />
        </button>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Droplet size={16} class="text-indigo-500" />
          {c.bgColor || 'Background Color'}
        </label>
        <div class="flex items-center gap-3">
          <input
            type="color"
            bind:value={bgColor}
            on:input={handleColorChange}
            class="h-12 w-12 rounded cursor-pointer border-0 p-0 bg-transparent min-h-[44px] min-w-[44px]"
            aria-label={c.bgColor || 'Background Color'}
          />
          <input
            type="text"
            bind:value={bgColor}
            on:input={handleColorChange}
            class="flex-1 px-4 py-2.5 min-h-[44px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 font-mono"
            aria-label={c.bgColor || 'Background Color Hex'}
          />
        </div>
      </div>

      <div class="flex items-center gap-4 mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="flex-1">
          <h4 class="font-medium text-slate-900 dark:text-white flex items-center gap-2">
            <span class={wcagAA ? 'text-emerald-500' : 'text-rose-500'}>
              {wcagAA ? 'Passes WCAG AA' : 'Fails WCAG AA'}
            </span>
          </h4>
          {#if !wcagAA}
            <p class="text-sm text-slate-500 mt-1">
              Click Auto-Fix to find the nearest passing contrast ratio.
            </p>
          {/if}
        </div>
        {#if !wcagAA}
          <button
            on:click={applyAutoFix}
            class="px-4 py-2 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Auto-Fix Color
          </button>
        {/if}
      </div>

    </div>

    <!-- Smart Examples / Presets -->
    <div class="pt-2">
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">{t.presets || 'Presets'}:</span>
        {#each presets as preset}
          <button
            on:click={() => loadPreset(preset)}
            class="px-3 py-1.5 min-h-[44px] text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 transition-colors"
            style="color: {preset.fg}; background-color: {preset.bg}; border-color: {preset.bg};"
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Results Panel -->
    <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">

        <!-- Ratio -->
        <div class="text-center md:text-left flex-1">
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{c.ratio || 'Contrast Ratio'}</p>
          <div class="text-5xl font-black text-slate-900 dark:text-white flex items-baseline justify-center md:justify-start gap-1">
            {ratio.toFixed(2)}<span class="text-2xl text-slate-400 font-medium">:1</span>
          </div>
        </div>

        <!-- Compliance Badges -->
        <div class="flex flex-col gap-3 flex-1 w-full max-w-xs">

          <div class="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{c.normalText || 'Normal Text'} <span class="text-xs text-slate-400 ml-1">(4.5:1)</span></span>
            {#if wcag.normal !== 'Fail'}
              <span class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 size={14}/> {wcag.normal}</span>
            {:else}
              <span class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"><XCircle size={14}/> {c.fail || 'Fail'}</span>
            {/if}
          </div>

          <div class="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{c.largeText || 'Large Text'} <span class="text-xs text-slate-400 ml-1">(3.0:1)</span></span>
            {#if wcag.large !== 'Fail'}
              <span class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 size={14}/> {wcag.large}</span>
            {:else}
              <span class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"><XCircle size={14}/> {c.fail || 'Fail'}</span>
            {/if}
          </div>

        </div>
      </div>

      <div class="mt-6 flex flex-wrap justify-center md:justify-end gap-3">
        {#if wcag.normal === 'Fail'}
        <button
          on:click={applySmartSuggestion}
          class="flex items-center gap-2 px-4 py-2 min-h-[44px] text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
        >
          <Sparkles size={16} />
          {c.smartSuggest || 'Smart Suggestion'}
        </button>
        {/if}

        <button
          on:click={copyReport}
          class="flex items-center gap-2 px-4 py-2 min-h-[44px] text-sm font-medium text-slate-700 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {#if copied}
            <CheckCircle2 size={16} class="text-emerald-500" />
            <span class="text-emerald-600 dark:text-emerald-400">{c.copied || 'Copied!'}</span>
          {:else}
            <Copy size={16} />
            {c.copyReport || 'Copy Report'}
          {/if}
        </button>

        <button
          on:click={shareReport}
          class="flex items-center gap-2 px-4 py-2 min-h-[44px] text-sm font-medium text-slate-700 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Share2 size={16} />
          {c.share || 'Share'}
        </button>
      </div>
    </div>

    <!-- Live Preview -->
    <div class="space-y-3">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        <Eye size={18} class="text-indigo-500"/>
        {c.livePreview || 'Live Preview'}
      </h3>
      <div
        class="p-8 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors"
        style="background-color: {bgColor};"
      >
        <div class="max-w-2xl mx-auto space-y-4">
          <h4 style="color: {fgColor};" class="text-3xl font-bold">{c.largeText || 'Large Text Example'}</h4>
          <p style="color: {fgColor};" class="text-base leading-relaxed">
            {c.previewText || 'The quick brown fox jumps over the lazy dog. This text is meant to simulate how regular body content will appear.'}
          </p>
          <button
            style="color: {bgColor}; background-color: {fgColor};"
            class="px-5 py-2.5 min-h-[44px] rounded-lg font-medium shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            {c.uiComponents || 'UI Component'}
          </button>
        </div>
      </div>



    </div>


    {:else}
      <!-- Palette Matrix Mode -->
      <div class="space-y-6">
        <div class="space-y-3">
          <label for="palette-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {c.paletteInputLabel || 'Enter colors (hex codes, comma separated)'}
          </label>
          <textarea
            id="palette-input"
            bind:value={paletteInput}
            placeholder="#ffffff, #000000, #3b82f6"
            class="w-full h-24 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-mono text-sm"
          ></textarea>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {c.paletteHelper || 'Valid hex codes will automatically populate the contrast matrix.'} ({paletteColors.length} {c.colorsDetected || 'colors detected'})
          </p>
        </div>

        {#if paletteColors.length > 1}
          <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 custom-scrollbar">
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" class="px-4 py-3 font-medium text-center border-b border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">{c.bgVsFg || 'BG \\ FG'}</th>
                  {#each paletteColors as fg}
                    <th scope="col" class="px-4 py-3 text-center border-b border-slate-200 dark:border-slate-700">
                      <div class="flex flex-col items-center gap-1.5">
                        <div class="w-6 h-6 rounded-md shadow-sm border border-slate-200 dark:border-slate-700" style="background-color: {fg};"></div>
                        <span class="font-mono text-[10px]">{fg}</span>
                      </div>
                    </th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each paletteColors as bg, i}
                  <tr class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 last:border-0">
                    <th scope="row" class="px-4 py-3 font-medium text-center border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                      <div class="flex flex-col items-center gap-1.5">
                        <div class="w-6 h-6 rounded-md shadow-sm border border-slate-200 dark:border-slate-700" style="background-color: {bg};"></div>
                        <span class="font-mono text-[10px] text-slate-600 dark:text-slate-400">{bg}</span>
                      </div>
                    </th>
                    {#each paletteColors as fg, j}
                      {@const r = getContrastRatio(bg, fg)}
                      {@const wcagN = r >= 4.5 ? 'AA' : (r >= 3.0 ? 'Large' : 'Fail')}
                      <td class="px-4 py-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-0 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        {#if i === j}
                          <span class="text-slate-300 dark:text-slate-600">-</span>
                        {:else}
                          <button
                            class="flex flex-col items-center justify-center w-full h-full gap-1 p-1 rounded-md min-h-[44px]"
                            on:click={() => { fgColor = fg; bgColor = bg; mode = 'pair'; saveToHistory(); }}
                            aria-label="Set pair: BG {bg}, FG {fg}"
                          >
                            <span class="font-mono text-xs font-bold" style="color: {r >= 4.5 ? '#10b981' : (r >= 3.0 ? '#f59e0b' : '#ef4444')}">{r.toFixed(2)}</span>
                            <span class="text-[10px] px-1.5 py-0.5 rounded-sm font-semibold {r >= 4.5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : (r >= 3.0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400')}">
                              {wcagN}
                            </span>
                          </button>
                        {/if}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <div class="p-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <Palette size={32} class="mx-auto mb-3 opacity-50" />
            <p>{c.enterMoreColors || 'Enter at least two valid hex colors to generate the matrix.'}</p>
          </div>
        {/if}
      </div>
    {/if}


    <!-- Vision Simulator -->
    <div class="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        <Eye size={18} class="text-indigo-500"/>
        {s.title || 'Color Blindness Simulation'}
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each simulations as sim}
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div class="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
              <h4 class="text-sm font-medium text-slate-700 dark:text-slate-300">{s[sim.key] || sim.key}</h4>
            </div>
            <div
              class="p-6 flex items-center justify-center text-center transition-colors"
              style="background-color: {simulateColorBlindness(bgColor, sim.type)};"
            >
              <span
                class="text-lg font-bold"
                style="color: {simulateColorBlindness(fgColor, sim.type)};"
              >
                {c.previewText || 'A11y'}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <div class="lg:col-span-1">
    <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sticky top-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium text-slate-900 dark:text-white">{h.title || 'Recent Checks'}</h3>
        <button
          on:click={clearHistory}
          class="text-xs text-rose-500 hover:text-rose-600 font-medium min-h-[44px] min-w-[44px] p-2 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20"
        >
          {h.clearHistory || 'Clear'}
        </button>
      </div>

      <div class="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
        {#if historyItems.length === 0}
          <p class="text-sm text-slate-500 text-center py-4">{h.noHistory || 'No history found.'}</p>
        {/if}
        {#each historyItems as item}
          <div class="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <button
              on:click={() => toggleStarred(item)}
              class="p-1.5 min-h-[44px] min-w-[44px] rounded-md transition-colors {item.starred ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50 dark:text-slate-600 dark:hover:text-amber-500 dark:hover:bg-amber-900/20'} flex items-center justify-center"
              aria-label="Toggle star"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={item.starred ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </button>
            <button class="flex-1 flex items-center gap-3 text-left" on:click={() => restoreItem(item)}>
              <div class="flex -space-x-2">
                <div class="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700" style="background-color: {item.fgColor}"></div>
                <div class="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700" style="background-color: {item.bgColor}"></div>
              </div>
              <div>
                <div class="text-xs font-medium text-slate-700 dark:text-slate-300">{item.ratio?.toFixed(2)}:1</div>
                <div class="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</div>
              </div>
            </button>
            <button
              on:click={() => deleteItem(item.id)}
              class="p-1.5 min-h-[44px] min-w-[44px] text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center"
              aria-label="Delete history item"
            >
              <XCircle size={14} />
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
