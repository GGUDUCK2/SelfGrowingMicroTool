<script lang="ts">
  import { selectedPages, isProcessing, pages } from '$lib/utils/pdf-forge/store';
  import { mergeAndDownload, rotateSelectedPages, deleteSelectedPages, clearAll, loadPDFs } from '$lib/utils/pdf-forge/engine';
  import { RotateCw, Trash2, Download, RefreshCw, Plus } from 'lucide-svelte';

  export let dict: any;

  $: hasSelection = $selectedPages.size > 0;
  $: hasPages = $pages.length > 0;

  function handleUpload(e: Event) {
      const target = e.target as HTMLInputElement;
      if (target.files) loadPDFs(target.files);
      target.value = '';
  }
</script>

<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
  {hasPages ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'}">

  <!-- Add More -->
  <button
    class="p-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors tooltip relative group"
    title={dict.actions.add}
    on:click={() => document.getElementById('toolbar-upload')?.click()}
  >
    <Plus class="w-5 h-5" />
    <input id="toolbar-upload" type="file" hidden multiple accept="application/pdf" on:change={handleUpload} />
  </button>

  <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

  <!-- Rotation -->
  <button
    class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
    {hasSelection
      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
      : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}"
    disabled={!hasSelection}
    on:click={() => rotateSelectedPages(90)}
  >
    <RotateCw class="w-4 h-4" />
    <span class="hidden sm:inline">{dict.actions.rotate}</span>
  </button>

  <!-- Delete -->
  <button
    class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
    {hasSelection
      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
      : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}"
    disabled={!hasSelection}
    on:click={deleteSelectedPages}
  >
    <Trash2 class="w-4 h-4" />
    <span class="hidden sm:inline">{dict.actions.delete}</span>
  </button>

  <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

  <!-- Reset -->
  <button
    class="p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
    title={dict.actions.reset}
    on:click={() => { if(confirm('Clear all pages?')) clearAll(); }}
  >
    <RefreshCw class="w-5 h-5" />
  </button>

  <!-- Merge (Primary) -->
  <button
    class="flex items-center gap-2 pl-4 pr-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all
    {$isProcessing ? 'opacity-75 cursor-wait' : ''}"
    disabled={!hasPages || $isProcessing}
    on:click={() => mergeAndDownload()}
  >
    {#if $isProcessing}
      <RefreshCw class="w-4 h-4 animate-spin" />
      <span>Processing...</span>
    {:else}
      <Download class="w-4 h-4" />
      <span>{dict.actions.save}</span>
    {/if}
  </button>
</div>
