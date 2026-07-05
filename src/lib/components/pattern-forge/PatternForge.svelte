<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/db';
  import { Check, Copy, History, RefreshCw, Save, Trash2, Edit2, Play, Grid, Circle, Waves, Hexagon } from '@lucide/svelte';
  import { fade, slide } from 'svelte/transition';

  export let t: any;

  type PatternType = 'grid' | 'dots' | 'waves' | 'polygons';

  let activeTab: 'designer' | 'history' = 'designer';
  let patternType: PatternType = 'grid';

  let primaryColor = '#4f46e5';
  let secondaryColor = '#e0e7ff';
  let size = 40;
  let spacing = 20;
  let opacity = 100;

  let history: any[] = [];
  let showToast = false;
  let toastMessage = '';

  // Dynamic output strings
  let cssOutput = '';
  let svgOutput = '';

  $: {
    generateOutputs(patternType, primaryColor, secondaryColor, size, spacing, opacity);
  }

  function generateOutputs(type: PatternType, pColor: string, sColor: string, sz: number, sp: number, op: number) {
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
    };

    const pRgba = hexToRgba(pColor, op);
    const sRgba = hexToRgba(sColor, op);

    if (type === 'grid') {
      const fullSize = sz + sp;
      cssOutput = `background-color: ${sColor};
background-image: linear-gradient(${pRgba} 1px, transparent 1px),
linear-gradient(90deg, ${pRgba} 1px, transparent 1px);
background-size: ${fullSize}px ${fullSize}px;`;

      svgOutput = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<defs>
  <pattern id="grid" width="${fullSize}" height="${fullSize}" patternUnits="userSpaceOnUse">
    <rect width="${fullSize}" height="${fullSize}" fill="${sColor}" />
    <path d="M ${fullSize} 0 L 0 0 0 ${fullSize}" fill="none" stroke="${pColor}" stroke-width="1" stroke-opacity="${op/100}" />
  </pattern>
</defs>
<rect width="100%" height="100%" fill="url(#grid)" />
</svg>`;
    } else if (type === 'dots') {
      const fullSize = sz + sp;
      const radius = sz / 2;
      cssOutput = `background-color: ${sColor};
background-image: radial-gradient(${pRgba} ${radius}px, transparent ${radius}px);
background-size: ${fullSize}px ${fullSize}px;`;

      svgOutput = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<defs>
  <pattern id="dots" width="${fullSize}" height="${fullSize}" patternUnits="userSpaceOnUse">
    <rect width="${fullSize}" height="${fullSize}" fill="${sColor}" />
    <circle cx="${fullSize/2}" cy="${fullSize/2}" r="${radius}" fill="${pColor}" fill-opacity="${op/100}" />
  </pattern>
</defs>
<rect width="100%" height="100%" fill="url(#dots)" />
</svg>`;
    } else if (type === 'waves') {
      const waveW = sz * 2;
      const waveH = sz;
      cssOutput = `background-color: ${sColor};
background-image: radial-gradient(circle at 100% 50%, transparent 20%, ${pRgba} 21%, ${pRgba} 34%, transparent 35%, transparent),
                  radial-gradient(circle at 0% 50%, transparent 20%, ${pRgba} 21%, ${pRgba} 34%, transparent 35%, transparent);
background-size: ${waveW}px ${waveH}px;
background-position: 0 0, ${sz}px ${sz/2}px;`;

      svgOutput = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<defs>
  <pattern id="waves" width="${waveW}" height="${waveH}" patternUnits="userSpaceOnUse">
    <rect width="${waveW}" height="${waveH}" fill="${sColor}" />
    <path d="M0,${waveH/2} Q${waveW/4},0 ${waveW/2},${waveH/2} T${waveW},${waveH/2}" fill="none" stroke="${pColor}" stroke-width="${sp}" stroke-opacity="${op/100}" />
  </pattern>
</defs>
<rect width="100%" height="100%" fill="url(#waves)" />
</svg>`;
    } else if (type === 'polygons') {
      const fullSize = sz + sp;
      cssOutput = `background-color: ${sColor};
background-image: linear-gradient(30deg, ${pRgba} 12%, transparent 12.5%, transparent 87%, ${pRgba} 87.5%, ${pRgba}),
                  linear-gradient(150deg, ${pRgba} 12%, transparent 12.5%, transparent 87%, ${pRgba} 87.5%, ${pRgba}),
                  linear-gradient(30deg, ${pRgba} 12%, transparent 12.5%, transparent 87%, ${pRgba} 87.5%, ${pRgba}),
                  linear-gradient(150deg, ${pRgba} 12%, transparent 12.5%, transparent 87%, ${pRgba} 87.5%, ${pRgba}),
                  linear-gradient(60deg, ${pRgba}77 25%, transparent 25.5%, transparent 75%, ${pRgba}77 75%, ${pRgba}77),
                  linear-gradient(60deg, ${pRgba}77 25%, transparent 25.5%, transparent 75%, ${pRgba}77 75%, ${pRgba}77);
background-size: ${fullSize}px ${fullSize*2}px;
background-position: 0 0, 0 0, ${fullSize/2}px ${fullSize}px, ${fullSize/2}px ${fullSize}px, 0 0, ${fullSize/2}px ${fullSize}px;`;

      svgOutput = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<defs>
  <pattern id="polygons" width="${fullSize}" height="${fullSize}" patternUnits="userSpaceOnUse">
    <rect width="${fullSize}" height="${fullSize}" fill="${sColor}" />
    <polygon points="${fullSize/2},0 ${fullSize},${fullSize/4} ${fullSize},${fullSize*0.75} ${fullSize/2},${fullSize} 0,${fullSize*0.75} 0,${fullSize/4}" fill="${pColor}" fill-opacity="${op/100}" />
  </pattern>
</defs>
<rect width="100%" height="100%" fill="url(#polygons)" />
</svg>`;
    }
  }

  onMount(async () => {
    await loadHistory();
  });

  async function loadHistory() {
    try {
      history = await db.patternForgeHistory.orderBy('createdAt').reverse().toArray();
    } catch (e) {
      console.error(e);
    }
  }

  async function savePattern() {
    try {
      await db.patternForgeHistory.add({
        name: `Pattern ${new Date().toLocaleTimeString()}`,
        type: patternType,
        config: { primaryColor, secondaryColor, size, spacing, opacity },
        createdAt: new Date()
      });
      showNotification(t.savedToHistory || 'Saved!');
      await loadHistory();
    } catch (e) {
      console.error(e);
    }
  }

  async function renameProject(id: number, oldName: string) {
    const newName = prompt(t.renameProject || 'Rename', oldName);
    if (newName && newName.trim()) {
      try {
        await db.patternForgeHistory.update(id, { name: newName.trim() });
        await loadHistory();
      } catch (e) {
        console.error(e);
      }
    }
  }

  async function deletePattern(id: number) {
    try {
      await db.patternForgeHistory.delete(id);
      await loadHistory();
    } catch (e) {
      console.error(e);
    }
  }

  function restorePattern(item: any) {
    patternType = item.type;
    primaryColor = item.config.primaryColor;
    secondaryColor = item.config.secondaryColor;
    size = item.config.size;
    spacing = item.config.spacing;
    opacity = item.config.opacity;
    showNotification(t.restored || 'Restored!');
    activeTab = 'designer';
  }

  function resetDefaults() {
    patternType = 'grid';
    primaryColor = '#4f46e5';
    secondaryColor = '#e0e7ff';
    size = 40;
    spacing = 20;
    opacity = 100;
  }

  function copyToClipboard(text: string, isSvg: boolean) {
    navigator.clipboard.writeText(text);
    showNotification(isSvg ? (t.copiedSVG || 'SVG copied!') : (t.copiedCSS || 'CSS copied!'));
  }

  function showNotification(msg: string) {
    toastMessage = msg;
    showToast = true;
    setTimeout(() => { showToast = false; }, 3000);
  }
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
        <Grid class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        {t.title || 'Pattern Forge'}
      </h1>
      <p class="mt-2 text-slate-600 dark:text-slate-400">{t.desc || 'Create beautiful patterns'}</p>
    </div>
  </div>

  <!-- Tabs -->
  <div class="flex space-x-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
    <button
      class="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors focus:outline-none min-h-[44px] min-w-[44px]
        {activeTab === 'designer' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-white/[0.12] hover:text-indigo-600 dark:hover:text-indigo-300'}"
      on:click={() => activeTab = 'designer'}
      role="tab"
      aria-selected={activeTab === 'designer'}
    >
      <Edit2 class="w-4 h-4" />
      {t.designer || 'Designer'}
    </button>
    <button
      class="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors focus:outline-none min-h-[44px] min-w-[44px]
        {activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-white/[0.12] hover:text-indigo-600 dark:hover:text-indigo-300'}"
      on:click={() => activeTab = 'history'}
      role="tab"
      aria-selected={activeTab === 'history'}
    >
      <History class="w-4 h-4" />
      {t.history || 'History'}
    </button>
  </div>

  {#if activeTab === 'designer'}
    <div in:fade={{duration: 200}} class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Controls -->
      <div class="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">

        <div>
          <div class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2" id="pattern-type-label">{t.patternType || 'Pattern Type'}</div>
          <div class="grid grid-cols-2 gap-2" role="group" aria-labelledby="pattern-type-label">
            {#each ['grid', 'dots', 'waves', 'polygons'] as type}
              <button
                class="flex flex-col items-center justify-center p-3 border rounded-xl min-h-[44px] min-w-[44px] transition-all
                  {patternType === type ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}"
                on:click={() => patternType = type as PatternType}
              >
                {#if type === 'grid'} <Grid class="w-5 h-5 mb-1" />
                {:else if type === 'dots'} <Circle class="w-5 h-5 mb-1" />
                {:else if type === 'waves'} <Waves class="w-5 h-5 mb-1" />
                {:else} <Hexagon class="w-5 h-5 mb-1" />
                {/if}
                <span class="text-xs font-medium capitalize">{t[type] || type}</span>
              </button>
            {/each}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="primaryColor" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.primaryColor || 'Primary'}</label>
            <input id="primaryColor" type="color" bind:value={primaryColor} class="w-full h-10 min-h-[44px] rounded-lg cursor-pointer border-0 bg-transparent p-0" />
          </div>
          <div>
            <label for="secondaryColor" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.secondaryColor || 'Secondary'}</label>
            <input id="secondaryColor" type="color" bind:value={secondaryColor} class="w-full h-10 min-h-[44px] rounded-lg cursor-pointer border-0 bg-transparent p-0" />
          </div>
        </div>

        <div>
          <label for="patternSize" class="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <span>{t.size || 'Size'}</span>
            <span class="text-slate-500">{size}px</span>
          </label>
          <input id="patternSize" type="range" min="10" max="150" bind:value={size} class="w-full accent-indigo-600 min-h-[44px]" />
        </div>

        <div>
          <label for="patternSpacing" class="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <span>{t.spacing || 'Spacing'}</span>
            <span class="text-slate-500">{spacing}px</span>
          </label>
          <input id="patternSpacing" type="range" min="0" max="100" bind:value={spacing} class="w-full accent-indigo-600 min-h-[44px]" />
        </div>

        <div>
          <label for="patternOpacity" class="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <span>{t.opacity || 'Opacity'}</span>
            <span class="text-slate-500">{opacity}%</span>
          </label>
          <input id="patternOpacity" type="range" min="10" max="100" bind:value={opacity} class="w-full accent-indigo-600 min-h-[44px]" />
        </div>

        <div class="pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
           <button on:click={resetDefaults} class="flex-1 min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors">
            <RefreshCw class="w-4 h-4" />
            {t.reset || 'Reset'}
          </button>
          <button on:click={savePattern} class="flex-1 min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Save class="w-4 h-4" />
            {t.savePattern || 'Save'}
          </button>
        </div>
      </div>

      <!-- Preview & Export -->
      <div class="lg:col-span-2 space-y-6">
        <div class="w-full aspect-video rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 overflow-hidden relative" style="{cssOutput}">
          <div class="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-2xl pointer-events-none"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-slate-900 rounded-2xl overflow-hidden relative group flex flex-col">
            <div class="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <span class="text-xs font-mono text-slate-400">CSS</span>
              <button on:click={() => copyToClipboard(cssOutput, false)} class="p-2 min-h-[44px] min-w-[44px] text-slate-400 hover:text-white transition-colors" title={t.exportCSS}>
                <Copy class="w-4 h-4" />
              </button>
            </div>
            <pre class="p-4 text-sm font-mono text-indigo-300 overflow-x-auto overflow-y-auto flex-1 max-h-48"><code>{cssOutput}</code></pre>
          </div>

          <div class="bg-slate-900 rounded-2xl overflow-hidden relative group flex flex-col">
            <div class="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <span class="text-xs font-mono text-slate-400">SVG</span>
              <button on:click={() => copyToClipboard(svgOutput, true)} class="p-2 min-h-[44px] min-w-[44px] text-slate-400 hover:text-white transition-colors" title={t.exportSVG}>
                <Copy class="w-4 h-4" />
              </button>
            </div>
            <pre class="p-4 text-sm font-mono text-indigo-300 overflow-x-auto overflow-y-auto flex-1 max-h-48"><code>{svgOutput}</code></pre>
          </div>
        </div>
      </div>

    </div>
  {:else}
    <div in:fade={{duration: 200}} class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t.recentActivities || 'History'}</h2>
      {#if history.length === 0}
        <div class="text-center py-12 text-slate-500 dark:text-slate-400">
          <History class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t.noHistory || 'No history'}</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each history as item (item.id)}
            <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-900/50" transition:slide>
              <!-- Mini Preview -->
              <div class="h-24 w-full border-b border-slate-200 dark:border-slate-700"
                style="background-color: {item.config.secondaryColor}; background-image: {item.type === 'grid' ? `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)` : ''};">
                 <!-- Since mini preview dynamic string is complex, fallback to simple primary color display if needed, or we just render an abbreviated inline style -->
                <div class="w-full h-full opacity-50" style="background-color: {item.config.primaryColor}"></div>
              </div>
              <div class="p-4 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-medium text-sm text-slate-900 dark:text-white truncate pr-2" title={item.name}>{item.name}</h3>
                  <button on:click={() => renameProject(item.id, item.name)} class="text-slate-400 hover:text-indigo-600 min-h-[44px] min-w-[44px] flex items-center justify-center -m-2">
                    <Edit2 class="w-4 h-4" />
                  </button>
                </div>
                <div class="text-xs text-slate-500 mb-4 capitalize">
                  {item.type} • {item.config.size}px
                </div>
                <div class="mt-auto flex justify-between items-center gap-2">
                  <button on:click={() => restorePattern(item)} class="flex-1 min-h-[44px] min-w-[44px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-1">
                    <Play class="w-3 h-3" /> Restore
                  </button>
                  <button on:click={() => deletePattern(item.id)} class="min-h-[44px] min-w-[44px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center justify-center transition-colors" title={t.delete || 'Delete'}>
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

{#if showToast}
  <div transition:fade class="fixed bottom-4 right-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50">
    <Check class="w-5 h-5 text-green-400 dark:text-green-600" />
    <span class="text-sm font-medium">{toastMessage}</span>
  </div>
{/if}
