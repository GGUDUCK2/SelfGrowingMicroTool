<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { Download, Save, History as HistoryIcon, Copy, FileText, Settings, X, Plus } from 'lucide-svelte';
  import { dictionaries } from '$lib/dictionaries';
  import BarcodePreview from './BarcodePreview.svelte';
  import BarcodeHistory from './BarcodeHistory.svelte';
  import BarcodeBulk from './BarcodeBulk.svelte';
  import { db, type BarcodeForgeHistory } from '$lib/db';
  import { browser } from '$app/environment';

  export let lang: string = 'en';

  // Load dictionary
  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = dict.tools.barcodeForge;

  // State
  let value = '123456789012';
  let format = 'EAN13';
  let width = 2;
  let height = 100;
  let margin = 10;
  let displayValue = true;
  let font = 'monospace';
  let textAlign = 'center';
  let fontSize = 20;
  let background = '#ffffff';
  let lineColor = '#000000';
  let activeTab: 'generator' | 'bulk' | 'history' = 'generator';
  let valid = false;

  // Formats supported by JsBarcode
  const formats = [
    { value: 'CODE128', label: 'Code 128 (Auto)' },
    { value: 'CODE128A', label: 'Code 128 A' },
    { value: 'CODE128B', label: 'Code 128 B' },
    { value: 'CODE128C', label: 'Code 128 C' },
    { value: 'EAN13', label: 'EAN-13' },
    { value: 'EAN8', label: 'EAN-8' },
    { value: 'UPC', label: 'UPC-A' },
    { value: 'UPCE', label: 'UPC-E' },
    { value: 'ITF14', label: 'ITF-14' },
    { value: 'ITF', label: 'Interleaved 2 of 5' },
    { value: 'MSI', label: 'MSI' },
    { value: 'pharmacode', label: 'Pharmacode' },
    { value: 'codabar', label: 'Codabar' }
  ];

  // Fonts
  const fonts = ['monospace', 'sans-serif', 'serif', 'fantasy', 'cursive'];

  // Preview options
  $: options = {
    width,
    height,
    margin,
    displayValue,
    font,
    textAlign,
    fontSize,
    background,
    lineColor,
    flat: true // Needed for SVG export usually? JsBarcode defaults are okay.
  };

  // Actions
  const download = (type: 'svg' | 'png') => {
    const svg = document.querySelector('svg');
    if (!svg) return;

    if (type === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcode-${value}.${type}`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
        // PNG export via canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const pngUrl = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = pngUrl;
                a.download = `barcode-${value}.png`;
                a.click();
            }
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }
  };

  const saveToHistory = async () => {
    if (!browser || !valid) return;
    try {
        await db.barcodeForgeHistory.add({
            name: value,
            content: value,
            format,
            config: JSON.stringify(options),
            createdAt: new Date(),
            starred: 0
        });
        // Optional toast
    } catch (err) {
        console.error('Failed to save', err);
    }
  };

  const restore = (item: BarcodeForgeHistory) => {
      value = item.content;
      format = item.format;
      try {
          const config = JSON.parse(item.config);
          width = config.width;
          height = config.height;
          margin = config.margin;
          displayValue = config.displayValue;
          font = config.font;
          textAlign = config.textAlign;
          fontSize = config.fontSize;
          background = config.background;
          lineColor = config.lineColor;
      } catch (e) { console.error(e); }
      activeTab = 'generator';
  };

</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <!-- Left Panel: Controls -->
  <div class="lg:col-span-1 space-y-6">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <!-- Tabs -->
      <div class="flex border-b border-slate-200 dark:border-slate-700">
        <button style="min-height: 44px; min-width: 44px;"
          class="flex-1 py-3 min-h-[44px] min-w-[44px] text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-colors {activeTab === 'generator' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-slate-50 dark:bg-slate-900/50' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
          on:click={() => activeTab = 'generator'}
        >
          {d.generate}
        </button>
        <button style="min-height: 44px; min-width: 44px;"
          class="flex-1 py-3 min-h-[44px] min-w-[44px] text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-colors {activeTab === 'bulk' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-slate-50 dark:bg-slate-900/50' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
          on:click={() => activeTab = 'bulk'}
        >
          {d.bulk}
        </button>
        <button style="min-height: 44px; min-width: 44px;"
          class="flex-1 py-3 min-h-[44px] min-w-[44px] text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-colors {activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-slate-50 dark:bg-slate-900/50' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
          on:click={() => activeTab = 'history'}
        >
          {d.history}
        </button>
      </div>

      <div class="p-5">
        {#if activeTab === 'generator'}
          <div class="space-y-5" transition:slide>
            <!-- Format -->
            <div>
              <label for="barcode-format" class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{d.format}</label>
              <select id="barcode-format" bind:value={format} class="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                {#each formats as f}
                  <option value={f.value}>{d.formats[f.value as keyof typeof d.formats] || f.label}</option>
                {/each}
              </select>
            </div>

            <!-- Value -->
            <div>
              <label for="barcode-value" class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{d.value}</label>
              <textarea
                id="barcode-value"
                bind:value={value}
                rows="3"
                class="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="123456789012"
              ></textarea>
            </div>

            <!-- Options Toggle -->
            <div class="pt-2 border-t border-slate-200 dark:border-slate-700">
               <h3 class="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center">
                 <Settings size={12} class="mr-1" /> {d.options}
               </h3>

               <div class="grid grid-cols-2 gap-3">
                 <div>
                    <label for="barcode-width" class="block text-xs text-slate-500 mb-1">{d.width} ({width})</label>
                    <div class="flex items-center min-h-[44px]">
                       <input id="barcode-width" type="range" min="1" max="4" step="1" bind:value={width} class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                    </div>
                 </div>
                 <div>
                    <label for="barcode-height" class="block text-xs text-slate-500 mb-1">{d.height} ({height})</label>
                    <div class="flex items-center min-h-[44px]">
                       <input id="barcode-height" type="range" min="10" max="200" step="10" bind:value={height} class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                    </div>
                 </div>
               </div>

               <div class="grid grid-cols-2 gap-3 mt-3">
                 <label class="flex items-center space-x-2 min-h-[44px] min-w-[44px]">
                    <input type="checkbox" bind:checked={displayValue} class="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 min-h-[20px] min-w-[20px]" />
                    <span class="text-xs text-slate-600 dark:text-slate-300">{d.displayValue}</span>
                 </label>

                 <div>
                    <label for="barcode-fontsize" class="block text-xs text-slate-500 mb-1">{d.fontSize}</label>
                    <input id="barcode-fontsize" type="number" bind:value={fontSize} class="w-full min-h-[44px] px-2 py-1 text-sm border rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 dark:border-slate-600" />
                 </div>
               </div>

                <div class="grid grid-cols-2 gap-3 mt-3">
                    <div>
                        <label for="barcode-bg" class="block text-xs text-slate-500 mb-1">{d.background}</label>
                        <div class="flex items-center space-x-2 min-h-[44px]">
                            <input id="barcode-bg" type="color" bind:value={background} class="h-11 w-11 rounded cursor-pointer border-none p-0 focus:ring-2 focus:ring-indigo-500" />
                            <span class="text-xs font-mono text-slate-400">{background}</span>
                        </div>
                    </div>
                    <div>
                        <label for="barcode-line" class="block text-xs text-slate-500 mb-1">{d.lineColor}</label>
                        <div class="flex items-center space-x-2 min-h-[44px]">
                            <input id="barcode-line" type="color" bind:value={lineColor} class="h-11 w-11 rounded cursor-pointer border-none p-0 focus:ring-2 focus:ring-indigo-500" />
                            <span class="text-xs font-mono text-slate-400">{lineColor}</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        {:else if activeTab === 'bulk'}
          <div transition:slide>
             <BarcodeBulk {lang} {options} {format} />
          </div>
        {:else if activeTab === 'history'}
          <div transition:slide>
             <BarcodeHistory {lang} onRestore={restore} />
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Right Panel: Preview -->
  <div class="lg:col-span-2">
    <div class="sticky top-6 space-y-6">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center min-h-[400px] justify-center relative bg-[url('/grid.svg')] bg-center">

            <BarcodePreview {value} {format} {options} bind:valid />

            <div class="absolute bottom-4 right-4 flex space-x-2">
                <button
                    disabled={!valid}
                    on:click={saveToHistory}
                    class="p-2 min-h-[44px] min-w-[44px] rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 flex items-center justify-center"
                    title={d.save}
                >
                    <Save size={20} />
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button style="min-height: 44px; min-width: 44px;"
                disabled={!valid}
                on:click={() => download('svg')}
                class="flex items-center justify-center space-x-2 px-6 py-4 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Download size={20} />
                <span>{d.downloadSvg}</span>
            </button>
            <button style="min-height: 44px; min-width: 44px;"
                disabled={!valid}
                on:click={() => download('png')}
                class="flex items-center justify-center space-x-2 px-6 py-4 min-h-[44px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Download size={20} />
                <span>{d.downloadPng}</span>
            </button>
        </div>
    </div>
  </div>
</div>
