<script lang="ts">
  import { shadowStore } from '$lib/utils/shadow-forge/store';
  import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-svelte';
  import NeumorphismPanel from './NeumorphismPanel.svelte';

  export let dict: any;

  function addLayer() {
    shadowStore.update(s => {
      s.layers = [
        ...s.layers,
        { id: Math.random().toString(36).substr(2, 9), x: 0, y: 10, blur: 20, spread: 0, color: 'rgba(0, 0, 0, 0.1)', inset: false, enabled: true }
      ];
      return s;
    });
  }

  function removeLayer(index: number) {
    shadowStore.update(s => {
      s.layers.splice(index, 1);
      return s;
    });
  }

  function moveLayer(index: number, direction: 'up' | 'down') {
    shadowStore.update(s => {
      if (direction === 'up' && index > 0) {
        const temp = s.layers[index];
        s.layers[index] = s.layers[index - 1];
        s.layers[index - 1] = temp;
      } else if (direction === 'down' && index < s.layers.length - 1) {
        const temp = s.layers[index];
        s.layers[index] = s.layers[index + 1];
        s.layers[index + 1] = temp;
      }
      return s;
    });
  }

  function parseRgba(rgba: string) {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return { hex: '#000000', a: 1 };

    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    const a = match[4] ? parseFloat(match[4]) : 1;

    return { hex: `#${r}${g}${b}`, a };
  }

  function updateColor(index: number, hex: string, alpha: number) {
    shadowStore.update(s => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      s.layers[index].color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      return s;
    });
  }

  function handleHexChange(index: number, e: Event) {
    const hex = (e.target as HTMLInputElement).value;
    const current = parseRgba($shadowStore.layers[index].color);
    updateColor(index, hex, current.a);
  }

  function handleAlphaChange(index: number, e: Event) {
    const a = parseFloat((e.target as HTMLInputElement).value);
    const current = parseRgba($shadowStore.layers[index].color);
    updateColor(index, current.hex, a);
  }

  // Smooth mode functions
  function handleSmoothChange() {
      // Just triggering reactivity for store
      $shadowStore = $shadowStore;
  }

</script>

<div class="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">

  <!-- Tabs Mode Selector -->
  <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto scrollbar-hide whitespace-nowrap">
      <button
        class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors min-w-[44px] min-h-[44px] {$shadowStore.mode === 'custom' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}"
        on:click={() => $shadowStore.mode = 'custom'}
      >
        {dict.tabs.custom}
      </button>
      <button
        class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors min-w-[44px] min-h-[44px] {$shadowStore.mode === 'smooth' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}"
        on:click={() => $shadowStore.mode = 'smooth'}
      >
        {dict.tabs.smooth}
      </button>
      <button
        class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors min-w-[44px] min-h-[44px] {$shadowStore.mode === 'neumorphism' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}"
        on:click={() => $shadowStore.mode = 'neumorphism'}
      >
        {dict.tabs.neumorphism}
      </button>
  </div>

  {#if $shadowStore.mode === 'custom'}
      <div class="space-y-4">
        {#each $shadowStore.layers as layer, i (layer.id)}
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-all relative group">
                <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div class="flex items-center gap-2">
                        <div class="flex flex-col gap-1">
                            <button class="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400" disabled={i === 0} on:click={() => moveLayer(i, 'up')} aria-label="Move Up"><ChevronUp size={14} /></button>
                            <button class="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400" disabled={i === $shadowStore.layers.length - 1} on:click={() => moveLayer(i, 'down')} aria-label="Move Down"><ChevronDown size={14} /></button>
                        </div>
                        <span class="font-bold text-slate-700 dark:text-slate-300">{dict.controls.layerPrefix} {i + 1}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <label class="flex items-center cursor-pointer min-h-[44px] min-w-[44px] justify-center" aria-label={dict.controls.enabled}>
                            <input type="checkbox" bind:checked={layer.enabled} class="sr-only peer">
                            <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600 relative"></div>
                        </label>

                        <button
                            class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            on:click={() => removeLayer(i)}
                            aria-label={dict.controls.remove}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4" class:opacity-50={!layer.enabled} class:pointer-events-none={!layer.enabled}>
                    <!-- X / Y -->
                    <div class="space-y-1">
                        <div class="flex justify-between">
                            <label for={`offsetX-${i}`} class="text-xs text-slate-500">{dict.controls.offsetX} ({layer.x}px)</label>
                        </div>
                        <input id={`offsetX-${i}`} type="range" min="-100" max="100" bind:value={layer.x} class="w-full accent-indigo-600 min-h-[44px]" />
                    </div>
                    <div class="space-y-1">
                        <div class="flex justify-between">
                            <label for={`offsetY-${i}`} class="text-xs text-slate-500">{dict.controls.offsetY} ({layer.y}px)</label>
                        </div>
                        <input id={`offsetY-${i}`} type="range" min="-100" max="100" bind:value={layer.y} class="w-full accent-indigo-600 min-h-[44px]" />
                    </div>

                    <!-- Blur / Spread -->
                    <div class="space-y-1">
                        <div class="flex justify-between">
                            <label for={`blur-${i}`} class="text-xs text-slate-500">{dict.controls.blur} ({layer.blur}px)</label>
                        </div>
                        <input id={`blur-${i}`} type="range" min="0" max="200" bind:value={layer.blur} class="w-full accent-indigo-600 min-h-[44px]" />
                    </div>
                    <div class="space-y-1">
                        <div class="flex justify-between">
                            <label for={`spread-${i}`} class="text-xs text-slate-500">{dict.controls.spread} ({layer.spread}px)</label>
                        </div>
                        <input id={`spread-${i}`} type="range" min="-100" max="100" bind:value={layer.spread} class="w-full accent-indigo-600 min-h-[44px]" />
                    </div>

                    <!-- Color Picker -->
                    <div class="col-span-2 space-y-3">
                        <span class="block text-xs font-medium text-slate-500">{dict.controls.color}</span>
                        <div class="flex items-center gap-3">
                            <div class="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 shrink-0 shadow-sm" style="background: {layer.color}">
                                <input type="color" value={parseRgba(layer.color).hex} on:input={(e) => handleHexChange(i, e)} class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                            <div class="flex-1 space-y-1">
                                <div class="flex justify-between text-xs text-slate-500">
                                    <span>{dict.controls.alpha}</span>
                                    <span>{Math.round(parseRgba(layer.color).a * 100)}%</span>
                                </div>
                                <input type="range" min="0" max="1" step="0.01" value={parseRgba(layer.color).a} on:input={(e) => handleAlphaChange(i, e)} class="w-full accent-indigo-600 min-h-[44px]" />
                            </div>
                        </div>
                    </div>

                    <!-- Inset Toggle -->
                    <div class="col-span-2 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                         <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{dict.controls.inset}</span>
                         <label class="flex items-center cursor-pointer min-h-[44px] min-w-[44px] justify-center" aria-label={dict.controls.inset}>
                            <input type="checkbox" bind:checked={layer.inset} class="sr-only peer">
                            <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600 relative"></div>
                        </label>
                    </div>
                </div>
            </div>
        {/each}

        <button
          class="w-full py-3 flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800 border-dashed font-medium min-h-[44px]"
          on:click={addLayer}
        >
            <Plus size={18} />
            {dict.controls.addLayer}
        </button>
      </div>
  {/if}

  {#if $shadowStore.mode === 'smooth'}
      <div class="space-y-6">
           <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 text-sm rounded-lg">
               {dict.smooth.info}
           </div>

           <div class="space-y-1">
                <div class="flex justify-between">
                    <label for="smoothLayers" class="text-sm font-medium text-slate-700 dark:text-slate-300">{dict.smooth.layers}</label>
                    <span class="text-sm text-slate-500">{$shadowStore.smoothConfig.layersCount}</span>
                </div>
                <input id="smoothLayers" type="range" min="2" max="10" bind:value={$shadowStore.smoothConfig.layersCount} on:input={handleSmoothChange} class="w-full accent-indigo-600 min-h-[44px]" />
           </div>

           <div class="space-y-1">
                <div class="flex justify-between">
                    <label for="smoothDistance" class="text-sm font-medium text-slate-700 dark:text-slate-300">{dict.smooth.distance}</label>
                    <span class="text-sm text-slate-500">{$shadowStore.smoothConfig.distance}px</span>
                </div>
                <input id="smoothDistance" type="range" min="10" max="200" bind:value={$shadowStore.smoothConfig.distance} on:input={handleSmoothChange} class="w-full accent-indigo-600 min-h-[44px]" />
           </div>

            <div class="space-y-1">
                <div class="flex justify-between">
                    <label for="smoothAlpha" class="text-sm font-medium text-slate-700 dark:text-slate-300">{dict.smooth.alpha}</label>
                    <span class="text-sm text-slate-500">{Math.round($shadowStore.smoothConfig.alpha * 100)}%</span>
                </div>
                <input id="smoothAlpha" type="range" min="0.01" max="0.5" step="0.01" bind:value={$shadowStore.smoothConfig.alpha} on:input={handleSmoothChange} class="w-full accent-indigo-600 min-h-[44px]" />
           </div>

           <div class="space-y-1">
                <div class="flex justify-between">
                    <label for="smoothBlur" class="text-sm font-medium text-slate-700 dark:text-slate-300">{dict.smooth.blurMultiplier}</label>
                    <span class="text-sm text-slate-500">{$shadowStore.smoothConfig.blurMultiplier}x</span>
                </div>
                <input id="smoothBlur" type="range" min="0.5" max="3" step="0.1" bind:value={$shadowStore.smoothConfig.blurMultiplier} on:input={handleSmoothChange} class="w-full accent-indigo-600 min-h-[44px]" />
           </div>

           <div class="space-y-2">
                <label for="smoothEasing" class="text-sm font-medium text-slate-700 dark:text-slate-300">{dict.smooth.easing}</label>
                <select id="smoothEasing" bind:value={$shadowStore.smoothConfig.easing} on:change={handleSmoothChange} class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm min-h-[44px] focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option value="linear">{dict.smooth.linear}</option>
                    <option value="easeOut">{dict.smooth.easeOut}</option>
                    <option value="easeIn">{dict.smooth.easeIn}</option>
                    <option value="easeInOut">{dict.smooth.easeInOut}</option>
                </select>
           </div>
      </div>
  {/if}

  {#if $shadowStore.mode === 'neumorphism'}
      <NeumorphismPanel {dict} />
  {/if}
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-200 dark:bg-slate-700 rounded-full;
  }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    @apply bg-slate-300 dark:bg-slate-600;
  }
</style>
