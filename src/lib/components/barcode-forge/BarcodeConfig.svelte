<script lang="ts">
  import { slide } from 'svelte/transition';
  import type { BarcodeState } from './types';
  import Settings2 from '@lucide/svelte/icons/settings-2';
  import Type from '@lucide/svelte/icons/type';
  import LayoutTemplate from '@lucide/svelte/icons/layout-template';
  import BarcodeBulk from './BarcodeBulk.svelte';

  export let state: BarcodeState;
  export let dictionary: any;

  $: t = dictionary?.tools?.barcodeForge || {};

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
    { value: 'ITF', label: 'ITF (Interleaved 2 of 5)' },
    { value: 'MSI', label: 'MSI' },
    { value: 'MSI10', label: 'MSI 10' },
    { value: 'MSI11', label: 'MSI 11' },
    { value: 'MSI1010', label: 'MSI 1010' },
    { value: 'MSI1110', label: 'MSI 1110' },
    { value: 'pharmacode', label: 'Pharmacode' },
    { value: 'codabar', label: 'Codabar' }
  ];
</script>

<div class="space-y-6">
    <!-- Format Selection -->
    <div>
        <div class="flex items-center justify-between mb-2">
            <span class="block text-sm font-medium text-slate-300">{t.format || 'Format'}</span>
            <div class="flex bg-slate-800 rounded-lg p-1">
                <button
                    class="px-3 py-1 text-xs font-medium rounded-md transition-colors min-h-[32px] {state.type === 'single' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}"
                    on:click={() => state.type = 'single'}
                >
                    Single
                </button>
                <button
                    class="px-3 py-1 text-xs font-medium rounded-md transition-colors min-h-[32px] {state.type === 'bulk' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}"
                    on:click={() => state.type = 'bulk'}
                >
                    {t.bulk || 'Bulk Mode'}
                </button>
            </div>
        </div>
        <select bind:value={state.format} class="w-full bg-slate-700 border-slate-600 rounded-xl px-4 py-3 text-slate-50 focus:ring-2 focus:ring-indigo-500 font-medium min-h-[44px]">
            {#each formats as fmt}
                <option value={fmt.value}>{t.formats?.[fmt.value] || fmt.label}</option>
            {/each}
        </select>
    </div>

    <!-- Data Input -->
    {#if state.type === 'single'}
        <div transition:slide>
            <label class="block">
                <span class="block text-sm font-medium text-slate-300 mb-2">{t.value || 'Value / Content'}</span>
                <input
                    type="text"
                    bind:value={state.value}
                    class="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-50 focus:ring-2 focus:ring-indigo-500 font-mono text-lg min-h-[44px]"
                    placeholder="Enter barcode data..."
                />
            </label>
        </div>
    {:else}
        <div transition:slide>
             <BarcodeBulk bind:state {dictionary} />
        </div>
    {/if}

    <div class="h-px bg-slate-700 my-6"></div>

    <!-- Design Options -->
    <div>
        <h3 class="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <LayoutTemplate size={18} />
            {t.options || 'Visual Options'}
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="block">
                <span class="block text-sm font-medium text-slate-300 mb-1">{t.width || 'Bar Width'} ({state.design.width}px)</span>
                <input type="range" min="1" max="5" step="1" bind:value={state.design.width} class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 min-h-[24px]" />
            </label>
            <label class="block">
                <span class="block text-sm font-medium text-slate-300 mb-1">{t.height || 'Height'} ({state.design.height}px)</span>
                <input type="range" min="10" max="250" step="5" bind:value={state.design.height} class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 min-h-[24px]" />
            </label>
            <label class="block">
                <span class="block text-sm font-medium text-slate-300 mb-1">{t.margin || 'Margin'} ({state.design.margin}px)</span>
                <input type="range" min="0" max="50" step="1" bind:value={state.design.margin} class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 min-h-[24px]" />
            </label>
        </div>
    </div>

    <div class="h-px bg-slate-700 my-6"></div>

    <!-- Text Options -->
    <div>
        <div class="flex items-center justify-between mb-4">
             <h3 class="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <Type size={18} />
                {t.displayValue || 'Show Text'}
            </h3>
            <label class="relative inline-flex items-center cursor-pointer min-h-[44px]">
                <input type="checkbox" bind:checked={state.design.displayValue} class="sr-only peer">
                <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>

        {#if state.design.displayValue}
        <div transition:slide class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="block">
                <span class="block text-sm font-medium text-slate-300 mb-1">{t.font || 'Font'}</span>
                <select bind:value={state.design.font} class="w-full bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-slate-50 min-h-[44px]">
                    <option value="monospace">Monospace</option>
                    <option value="sans-serif">Sans-serif</option>
                    <option value="serif">Serif</option>
                </select>
            </label>
            <label class="block">
                <span class="block text-sm font-medium text-slate-300 mb-1">{t.textAlign || 'Text Align'}</span>
                <select bind:value={state.design.textAlign} class="w-full bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-slate-50 min-h-[44px]">
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                </select>
            </label>
            <label class="block col-span-1 sm:col-span-2">
                <span class="block text-sm font-medium text-slate-300 mb-1">{t.fontSize || 'Font Size'} ({state.design.fontSize}px)</span>
                <input type="range" min="8" max="36" step="1" bind:value={state.design.fontSize} class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 min-h-[24px]" />
            </label>
        </div>
        {/if}
    </div>

    <div class="h-px bg-slate-700 my-6"></div>

    <!-- Colors -->
    <div>
        <h3 class="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Settings2 size={18} />
            Colors
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="block">
                <span class="block text-sm font-medium text-slate-300 mb-1">{t.background || 'Background'}</span>
                <div class="flex items-center space-x-2">
                    <input type="color" bind:value={state.design.background} class="h-[44px] w-[44px] rounded cursor-pointer bg-transparent border-none p-0 min-h-[44px] min-w-[44px]" />
                    <input type="text" bind:value={state.design.background} class="flex-1 bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-slate-50 text-sm font-mono uppercase min-h-[44px]" />
                </div>
            </label>
            <label class="block">
                <span class="block text-sm font-medium text-slate-300 mb-1">{t.lineColor || 'Line Color'}</span>
                <div class="flex items-center space-x-2">
                    <input type="color" bind:value={state.design.lineColor} class="h-[44px] w-[44px] rounded cursor-pointer bg-transparent border-none p-0 min-h-[44px] min-w-[44px]" />
                    <input type="text" bind:value={state.design.lineColor} class="flex-1 bg-slate-700 border-slate-600 rounded-lg px-3 py-2 text-slate-50 text-sm font-mono uppercase min-h-[44px]" />
                </div>
            </label>
        </div>
    </div>
</div>
