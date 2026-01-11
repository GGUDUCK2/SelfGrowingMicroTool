<script lang="ts">
  import { slide } from 'svelte/transition';
  import { ChevronRight, ChevronDown, Braces, Brackets, Hash, Type, FileJson } from 'lucide-svelte';

  export let key: string | null = null;
  export let value: any;
  export let depth: number = 0;
  export let isLast: boolean = false;

  let expanded = true;
  let isHovered = false;

  // Determine type
  $: type = Array.isArray(value) ? 'array' :
            value === null ? 'null' :
            typeof value;

  $: isObjectOrArray = type === 'object' || type === 'array';
  $: itemCount = isObjectOrArray && value !== null ? Object.keys(value).length : 0;
  $: isEmpty = itemCount === 0;

  function toggle() {
    if (isObjectOrArray && !isEmpty) {
      expanded = !expanded;
    }
  }

  function getTypeColor(t: string) {
    switch(t) {
      case 'string': return 'text-green-600 dark:text-green-400';
      case 'number': return 'text-blue-600 dark:text-blue-400';
      case 'boolean': return 'text-purple-600 dark:text-purple-400';
      case 'null': return 'text-gray-400 italic';
      default: return 'text-gray-600 dark:text-gray-300';
    }
  }

  function formatValue(v: any) {
    if (v === null) return 'null';
    if (typeof v === 'string') return `"${v}"`;
    return String(v);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="font-mono text-sm leading-6"
  style="padding-left: {depth > 0 ? 1.5 : 0}rem"
  on:mouseenter={() => isHovered = true}
  on:mouseleave={() => isHovered = false}
>
  <div class="flex items-start group">
    <!-- Toggler -->
    <button
      class="mt-1 w-4 h-4 mr-1 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors"
      class:invisible={!isObjectOrArray || isEmpty}
      on:click|stopPropagation={toggle}
      aria-label={expanded ? "Collapse" : "Expand"}
    >
      {#if expanded}
        <ChevronDown size={14} />
      {:else}
        <ChevronRight size={14} />
      {/if}
    </button>

    <!-- Key & Value -->
    <div class="flex-1 break-all" on:click={toggle}>
      {#if key !== null}
        <span class="text-indigo-700 dark:text-indigo-300 font-medium cursor-pointer hover:underline">"{key}"</span>
        <span class="text-gray-400 mr-2">:</span>
      {/if}

      {#if isObjectOrArray}
        {#if type === 'array'}
           <span class="text-gray-500" title="{itemCount} items">
             <Brackets size={14} class="inline align-text-bottom mr-1" />
             Array({itemCount})
           </span>
        {:else}
           <span class="text-gray-500" title="{itemCount} properties">
             <Braces size={14} class="inline align-text-bottom mr-1" />
             Object
           </span>
        {/if}

        {#if !expanded}
           <button class="ml-2 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" on:click|stopPropagation={toggle}>...</button>
        {/if}
      {:else}
        <span class="{getTypeColor(type)} cursor-text select-text">{formatValue(value)}</span>
      {/if}

      {#if !isLast}<span class="text-gray-400">,</span>{/if}
    </div>
  </div>

  {#if isObjectOrArray && expanded && !isEmpty}
    <div transition:slide|local={{ duration: 200 }}>
      {#if type === 'array'}
        {#each value as item, i}
          <svelte:self
            key={null}
            value={item}
            depth={depth + 1}
            isLast={i === value.length - 1}
          />
        {/each}
      {:else}
        {#each Object.entries(value) as [k, v], i}
          <svelte:self
            key={k}
            value={v}
            depth={depth + 1}
            isLast={i === Object.keys(value).length - 1}
          />
        {/each}
      {/if}
    </div>
  {/if}
</div>
