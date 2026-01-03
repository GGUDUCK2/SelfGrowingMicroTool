<script lang="ts">
  import { fade } from 'svelte/transition';

  export let data: any;
  export let level: number = 0;

  let expanded = true;

  function toggle() {
    expanded = !expanded;
  }

  function getType(val: any) {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  }

  $: isObject = typeof data === 'object' && data !== null;
  $: type = getType(data);
  $: isEmpty = isObject && Object.keys(data).length === 0;
</script>

<div class="font-mono text-sm leading-6" style="padding-left: {level > 0 ? 1.5 : 0}rem">
  {#if isObject && !isEmpty}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div on:click|stopPropagation={toggle} class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 inline-flex items-center select-none rounded px-1 -ml-1">
      <span class="mr-1 text-gray-400 transform transition-transform duration-200 {expanded ? 'rotate-90' : ''}">▶</span>
      {#if Array.isArray(data)}
        <span class="text-yellow-600 dark:text-yellow-400 font-bold">Array</span>
        <span class="text-gray-400 ml-2 text-xs">[{data.length}]</span>
      {:else}
        <span class="text-purple-600 dark:text-purple-400 font-bold">Object</span>
        <span class="text-gray-400 ml-2 text-xs">{'{'}{Object.keys(data).length}{'}'}</span>
      {/if}
    </div>

    {#if expanded}
      <div transition:fade={{ duration: 150 }}>
        {#if Array.isArray(data)}
           {#each data as item, index}
             <div class="flex">
               <span class="text-gray-400 mr-2 select-none">{index}:</span>
               <svelte:self data={item} level={1} />
             </div>
           {/each}
        {:else}
           {#each Object.entries(data) as [key, val]}
             <div class="flex flex-col">
               <div class="flex items-start">
                  <span class="text-blue-600 dark:text-blue-400 mr-2 font-semibold">"{key}":</span>
                  <svelte:self data={val} level={1} />
               </div>
             </div>
           {/each}
        {/if}
      </div>
    {/if}
  {:else}
    <!-- Primitives -->
    <span class:text-green-600={type === 'string'}
          class:dark:text-green-400={type === 'string'}
          class:text-orange-600={type === 'number'}
          class:dark:text-orange-400={type === 'number'}
          class:text-red-500={type === 'boolean'}
          class:text-gray-500={type === 'null'}>
      {#if type === 'string'}
        "{data}"
      {:else if type === 'null'}
        null
      {:else}
        {data}
      {/if}
    </span>
  {/if}
</div>
