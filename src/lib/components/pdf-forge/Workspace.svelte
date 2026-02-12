<script lang="ts">
  import { pages } from '$lib/utils/pdf-forge/store';
  import { loadPDFs } from '$lib/utils/pdf-forge/engine';
  import DropZone from './DropZone.svelte';
  import PageGrid from './PageGrid.svelte';
  import Toolbar from './Toolbar.svelte';
  import { fade } from 'svelte/transition';

  export let dict: any;

  function handleUpload(e: CustomEvent<FileList>) {
    loadPDFs(e.detail);
  }
</script>

<div class="relative min-h-[600px] flex flex-col">
  {#if $pages.length === 0}
    <div class="flex-1 flex items-center justify-center py-20" in:fade>
      <div class="max-w-xl w-full">
        <DropZone {dict} on:upload={handleUpload} />
      </div>
    </div>
  {:else}
    <div class="flex-1 pb-32" in:fade>
      <PageGrid />
    </div>
  {/if}

  <Toolbar {dict} />
</div>
