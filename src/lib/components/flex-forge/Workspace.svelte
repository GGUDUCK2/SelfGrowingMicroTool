<script lang="ts">
  import type { FlexContainerProps, FlexItemProps } from './types';
  import { fade, scale } from 'svelte/transition';

  export let containerProps: FlexContainerProps;
  export let items: FlexItemProps[];
  export let selectedItemId: string | null = null;
  export let viewport: 'mobile' | 'tablet' | 'desktop' | 'full' = 'full';
  export let moveItem: (index: number, direction: -1 | 1) => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dict: Record<string, any> = {};

  $: analysis = getAnalysis(containerProps, items);

  function getAnalysis(container: FlexContainerProps, flexItems: FlexItemProps[]) {
    if (container.flexWrap === 'nowrap' && flexItems.length >= 5) {
      return { type: 'warning', message: dict.analysisWarning || 'Consider using flex-wrap for better mobile support.' };
    }
    if (container.justifyContent === 'center' && container.alignItems === 'center' && flexItems.length === 1) {
      return { type: 'success', message: dict.analysisCentered || 'Perfectly centered content layout.' };
    }
    if (container.flexWrap === 'wrap' && flexItems.length >= 3) {
      return { type: 'success', message: dict.analysisPerfect || 'Excellent layout! Mobile responsive and properly aligned.' };
    }
    return null;
  }



  $: containerStyle = `
    display: flex;
    flex-direction: ${containerProps.flexDirection};
    flex-wrap: ${containerProps.flexWrap};
    justify-content: ${containerProps.justifyContent};
    align-items: ${containerProps.alignItems};
    align-content: ${containerProps.alignContent};
    gap: ${containerProps.gap};
  `;

  function getItemStyle(item: FlexItemProps) {
    return `
      order: ${item.order};
      flex: ${item.flexGrow} ${item.flexShrink} ${item.flexBasis};
      align-self: ${item.alignSelf};
      width: ${item.width};
      height: ${item.height};
    `;
  }
</script>

<div class="w-full h-full min-h-[500px] bg-[#f8fafc] dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-8 overflow-auto shadow-inner relative flex flex-col items-center">
  <!-- Interactive Canvas -->

  {#if analysis}
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 transform scale-100 {analysis.type === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'}">
      <span>{analysis.message}</span>
    </div>
  {/if}


  {#if viewport !== 'full'}
    <div class="mb-2 text-xs font-mono text-slate-500">{viewport === 'mobile' ? '320px' : viewport === 'tablet' ? '768px' : '1024px'}</div>
  {/if}
  <div class="flex-1 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 transition-all duration-300 w-full"
       style="{containerStyle} {viewport === 'mobile' ? 'max-width: 320px;' : viewport === 'tablet' ? 'max-width: 768px;' : viewport === 'desktop' ? 'max-width: 1024px;' : 'max-width: 100%;'}">
    {#each items as item (item.id)}
      <div
        class="relative flex items-center justify-center font-mono font-bold text-lg rounded-md transition-all outline-none focus:outline-none
          {selectedItemId === item.id ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-900 shadow-lg scale-[1.02]' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700'}"
        style={getItemStyle(item)}
        on:click={() => selectedItemId = item.id} on:keydown={(e) => e.key === "Enter" && (selectedItemId = item.id)} aria-label="Select flex item" aria-pressed={selectedItemId === item.id} role="button" tabindex="0"
        in:scale={{ duration: 200, start: 0.9 }}
      >
        {item.text}

        <!-- Selection Indicator -->
        {#if selectedItemId === item.id}
          <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-slate-800 shadow-md rounded-md p-1 border border-slate-200 dark:border-slate-700 z-10">
            <button aria-label="Move item left" class="min-w-[44px] min-h-[44px] flex items-center justify-center p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" on:click|stopPropagation={() => moveItem(items.findIndex(i => i.id === item.id), -1)}>
              ←
            </button>
            <button aria-label="Move item right" class="min-w-[44px] min-h-[44px] flex items-center justify-center p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" on:click|stopPropagation={() => moveItem(items.findIndex(i => i.id === item.id), 1)}>
              →
            </button>
          </div>

          <div class="absolute -top-2 -right-2 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
        {/if}
      </div>
    {/each}
  </div>
</div>
