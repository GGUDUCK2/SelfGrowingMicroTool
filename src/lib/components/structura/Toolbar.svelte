<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Copy, Check, Download, RotateCcw } from '@lucide/svelte';

  export let showCopy = true;
  export let showDownload = true;
  export let showClear = true;

  export let labels = {
    copy: 'Copy',
    download: 'Download',
    clear: 'Clear'
  };

  const dispatch = createEventDispatcher();
  let copied = false;

  function handleCopy() {
    dispatch('copy');
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

<div class="flex items-center gap-2">
  <slot />

  {#if showCopy}
    <button
      class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
      on:click={handleCopy}
      aria-label={labels.copy}
      title={labels.copy}
    >
      {#if copied}
        <Check size={18} class="text-green-500" />
      {:else}
        <Copy size={18} />
      {/if}
    </button>
  {/if}

  {#if showDownload}
    <button
      class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
      on:click={() => dispatch('download')}
      aria-label={labels.download}
      title={labels.download}
    >
      <Download size={18} />
    </button>
  {/if}

  {#if showClear}
    <button
      class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
      on:click={() => dispatch('clear')}
      aria-label={labels.clear}
      title={labels.clear}
    >
      <RotateCcw size={18} />
    </button>
  {/if}
</div>
