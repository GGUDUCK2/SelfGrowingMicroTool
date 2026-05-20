<script lang="ts">
    import { fade } from 'svelte/transition';
  import { Copy, Save, Check, Settings2, Monitor } from 'lucide-svelte';
  import { dictionaries } from '$lib/dictionaries';
  import { db, type ClampForgeHistory } from '$lib/db';
  import { browser } from '$app/environment';
  import ClampHistory from './ClampHistory.svelte';

  export let lang: string = 'en';

  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = dict.tools.clampForge;

  // State
  let minWidth = 320;
  let maxWidth = 1200;
  let minSize = 1; // 1rem or 16px
  let maxSize = 2.5; // 2.5rem or 40px
  let unit: 'rem' | 'px' = 'rem';
  let baseRem = 16;

  let copiedCss = false;
  let copiedTw = false;
  let activeTab: 'builder' | 'history' = 'builder';

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

  const copyToClipboard = async (text: string, type: 'css' | 'tw') => {
    if (browser) {
      await navigator.clipboard.writeText(text);
      if (type === 'css') {
        copiedCss = true;
        setTimeout(() => copiedCss = false, 2000);
      } else {
        copiedTw = true;
        setTimeout(() => copiedTw = false, 2000);
      }
    }
  };

  const saveScale = async () => {
    if (browser) {
      await db.clampForgeHistory.add({
        minWidth,
        maxWidth,
        minSize,
        maxSize,
        unit,
        result: calculatedClamp,
        createdAt: new Date(),
        starred: 0
      });
      activeTab = 'history';
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
      <div class="flex border-b border-slate-200 dark:border-slate-700">
        <button
          class="flex-1 py-4 text-sm font-medium transition-colors {activeTab === 'builder' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px]"
          on:click={() => activeTab = 'builder'}
        >
          {d.title}
        </button>
        <button
          class="flex-1 py-4 text-sm font-medium transition-colors {activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} min-h-[44px]"
          on:click={() => activeTab = 'history'}
        >
          {d.history}
        </button>
      </div>

      <div class="p-6 sm:p-8">
        {#if activeTab === 'builder'}
          <div class="space-y-8" in:fade>
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
                    class="px-3 py-1.5 min-h-[44px] min-w-[44px] text-sm font-medium rounded-md transition-colors {unit === 'rem' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
                    on:click={() => unit = 'rem'}
                  >
                    {d.rems}
                  </button>
                  <button
                    class="px-3 py-1.5 min-h-[44px] min-w-[44px] text-sm font-medium rounded-md transition-colors {unit === 'px' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
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

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <Save size={18} />
          <span>{d.saveScale}</span>
        </button>
      </div>
    </div>
    {/if}
  </div>

  <div class="lg:col-span-1">
    <div class="sticky top-8 space-y-6">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
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

        <div class="mt-12 text-center">
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Live Preview</p>
          <div
            class="font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-4 rounded-lg inline-block w-full overflow-hidden text-ellipsis whitespace-nowrap border border-slate-200 dark:border-slate-700"
            style="font-size: {calculatedClamp}; line-height: 1.2;"
          >
            Fluid Typography
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
