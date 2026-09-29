<script lang="ts">
  import type { FlexContainerProps, FlexItemProps } from './types';
  import { fade, scale } from 'svelte/transition';

  export let containerProps: FlexContainerProps;
  export let items: FlexItemProps[];
  export let selectedItemId: string | null = null;

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

<div class="w-full h-full min-h-[500px] bg-[#f8fafc] dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-8 overflow-auto shadow-inner relative flex flex-col">
  <!-- Interactive Canvas -->
  <div class="flex-1 w-full bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 transition-all duration-300" style={containerStyle}>
    {#each items as item (item.id)}
      <button
        class="relative flex items-center justify-center font-mono font-bold text-lg rounded-md transition-all outline-none focus:outline-none
          {selectedItemId === item.id ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-900 shadow-lg scale-[1.02]' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700'}"
        style={getItemStyle(item)}
        on:click={() => selectedItemId = item.id}
        in:scale={{ duration: 200, start: 0.9 }}
      >
        {item.text}

        <!-- Selection Indicator -->
        {#if selectedItemId === item.id}
          <div class="absolute -top-2 -right-2 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
        {/if}
      </button>
    {/each}
  </div>
</div>
