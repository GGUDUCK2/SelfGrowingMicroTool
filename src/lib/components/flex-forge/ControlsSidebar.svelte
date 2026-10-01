<script lang="ts">
  import type { FlexContainerProps, FlexItemProps } from './types';
  import { Plus, Trash2, Copy, MoveUp, MoveDown } from '@lucide/svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dict: Record<string, any>;
  export let containerProps: FlexContainerProps;
  export let items: FlexItemProps[];
  export let selectedItemId: string | null = null;

  export let addItem: () => void;
  export let duplicateItem: (id: string) => void;
  export let removeItem: (id: string) => void;

  $: selectedItem = items.find(i => i.id === selectedItemId);

  function updateItem(id: string, prop: keyof FlexItemProps, value: string) {
    items = items.map(item => item.id === id ? { ...item, [prop]: value } : item);
  }

  const selectOptions = {
    flexDirection: ['row', 'row-reverse', 'column', 'column-reverse'],
    flexWrap: ['nowrap', 'wrap', 'wrap-reverse'],
    justifyContent: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
    alignItems: ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'],
    alignContent: ['stretch', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around'],
    alignSelf: ['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch']
  };
</script>

<div class="h-full flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-800/50 p-4 space-y-8">

  <!-- Container Controls -->
  <div class="space-y-4">
    <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
      {dict.containerProps}
    </h3>

    <!-- flex-direction -->
    <div class="space-y-1">
      <label for="ff-flexDirection" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.flexDirection}</label>
      <select id="ff-flexDirection" bind:value={containerProps.flexDirection} class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[44px]">
        {#each selectOptions.flexDirection as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </div>

    <!-- flex-wrap -->
    <div class="space-y-1">
      <label for="ff-flexWrap" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.flexWrap}</label>
      <select id="ff-flexWrap" bind:value={containerProps.flexWrap} class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[44px]">
        {#each selectOptions.flexWrap as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </div>

    <!-- justify-content -->
    <div class="space-y-1">
      <label for="ff-justifyContent" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.justifyContent}</label>
      <select id="ff-justifyContent" bind:value={containerProps.justifyContent} class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[44px]">
        {#each selectOptions.justifyContent as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </div>

    <!-- align-items -->
    <div class="space-y-1">
      <label for="ff-alignItems" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.alignItems}</label>
      <select id="ff-alignItems" bind:value={containerProps.alignItems} class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[44px]">
        {#each selectOptions.alignItems as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </div>

    <!-- align-content -->
    <div class="space-y-1">
      <label for="ff-alignContent" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.alignContent}</label>
      <select id="ff-alignContent" bind:value={containerProps.alignContent} class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[44px]">
        {#each selectOptions.alignContent as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </div>

    <!-- gap -->
    <div class="space-y-1">
      <label for="ff-gap" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{dict.gap}</label>
      <input type="text" id="ff-gap" bind:value={containerProps.gap} placeholder="1rem, 16px" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 min-h-[44px] outline-none">
    </div>
  </div>

  <!-- Items Controls -->
  <div class="space-y-4">
    <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
      <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">
        {dict.items} ({items.length})
      </h3>
      <button on:click={addItem} class="flex items-center justify-center p-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60 transition-colors min-h-[44px] min-w-[44px]" title={dict.addItem}>
        <Plus size={18} />
      </button>
    </div>

    {#if selectedItem}
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4 relative">
        <div class="flex items-center justify-between">
          <h4 class="font-semibold text-indigo-600 dark:text-indigo-400">Selected Item (ID: {selectedItem.id.slice(0, 4)})</h4>
          <div class="flex items-center gap-1">
             <button on:click={() => duplicateItem(selectedItem!.id)} class="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex justify-center items-center" title={dict.duplicateItem}>
              <Copy size={16} />
            </button>
            <button on:click={() => {removeItem(selectedItem!.id); selectedItemId = null;}} class="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex justify-center items-center" title={dict.removeItem} disabled={items.length <= 1}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label for="ff-flexGrow" class="block text-xs font-medium text-slate-500 dark:text-slate-400">{dict.flexGrow}</label>
            <input type="text" id="ff-flexGrow" value={selectedItem.flexGrow} on:input={(e) => updateItem(selectedItem.id, 'flexGrow', e.currentTarget.value)} class="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1.5 min-h-[44px] outline-none">
          </div>
          <div class="space-y-1">
            <label for="ff-flexShrink" class="block text-xs font-medium text-slate-500 dark:text-slate-400">{dict.flexShrink}</label>
            <input type="text" id="ff-flexShrink" value={selectedItem.flexShrink} on:input={(e) => updateItem(selectedItem.id, 'flexShrink', e.currentTarget.value)} class="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1.5 min-h-[44px] outline-none">
          </div>
        </div>

        <div class="space-y-1">
          <label for="ff-flexBasis" class="block text-xs font-medium text-slate-500 dark:text-slate-400">{dict.flexBasis}</label>
          <input type="text" id="ff-flexBasis" value={selectedItem.flexBasis} on:input={(e) => updateItem(selectedItem.id, 'flexBasis', e.currentTarget.value)} class="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1.5 min-h-[44px] outline-none">
        </div>

        <div class="space-y-1">
          <label for="ff-alignSelf" class="block text-xs font-medium text-slate-500 dark:text-slate-400">{dict.alignSelf}</label>
          <select id="ff-alignSelf" value={selectedItem.alignSelf} on:change={(e) => updateItem(selectedItem.id, 'alignSelf', e.currentTarget.value)} class="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1.5 min-h-[44px] outline-none">
            {#each selectOptions.alignSelf as option (option)}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <div class="space-y-1">
            <label for="ff-width" class="block text-xs font-medium text-slate-500 dark:text-slate-400">{dict.width}</label>
            <input type="text" id="ff-width" value={selectedItem.width} on:input={(e) => updateItem(selectedItem.id, 'width', e.currentTarget.value)} class="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1.5 min-h-[44px] outline-none">
          </div>
          <div class="space-y-1">
            <label for="ff-height" class="block text-xs font-medium text-slate-500 dark:text-slate-400">{dict.height}</label>
            <input type="text" id="ff-height" value={selectedItem.height} on:input={(e) => updateItem(selectedItem.id, 'height', e.currentTarget.value)} class="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1.5 min-h-[44px] outline-none">
          </div>
        </div>

        <div class="space-y-1">
            <label for="ff-order" class="block text-xs font-medium text-slate-500 dark:text-slate-400">{dict.order}</label>
            <input type="number" id="ff-order" value={selectedItem.order} on:input={(e) => updateItem(selectedItem.id, 'order', e.currentTarget.value)} class="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-1.5 min-h-[44px] outline-none">
        </div>

      </div>
    {:else}
      <div class="text-sm text-slate-500 dark:text-slate-400 italic text-center p-4 bg-slate-100 dark:bg-slate-800/30 rounded-xl">
        Select an item in the workspace to edit its properties.
      </div>
    {/if}
  </div>
</div>
