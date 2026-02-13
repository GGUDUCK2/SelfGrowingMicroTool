<script lang="ts">
  import { selectedPages, isProcessing, pages, undo, redo, past, future } from '$lib/utils/pdf-forge/store';
  import { mergeAndDownload, rotateSelectedPages, deleteSelectedPages, clearAll, loadPDFs, extractSelectedPages } from '$lib/utils/pdf-forge/engine';
  import { saveSession } from '$lib/utils/pdf-forge/history';
  import { RotateCw, Trash2, Download, RefreshCw, Plus, FileOutput, History, Save, Undo, Redo } from 'lucide-svelte';
  import type { PdfForgeDictionary } from '$lib/types/pdf-forge';
  import HistoryModal from './HistoryModal.svelte';
  import { scale } from 'svelte/transition';

  export let dict: PdfForgeDictionary;

  let showHistory = false;

  $: hasSelection = $selectedPages.size > 0;
  $: hasPages = $pages.length > 0;
  $: canUndo = $past.length > 0;
  $: canRedo = $future.length > 0;

  function handleUpload(e: Event) {
      const target = e.target as HTMLInputElement;
      if (target.files) loadPDFs(target.files);
      target.value = '';
  }

  function toggleHistory() {
      showHistory = !showHistory;
  }

  async function handleSaveSession() {
      const name = prompt(dict.history.savePrompt, `Session ${new Date().toLocaleTimeString()}`);
      if (name) {
          await saveSession(name);
          alert(dict.history.saved);
      }
  }

  function handleKeydown(e: KeyboardEvent) {
      if ($isProcessing) return;

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
              if (canRedo) redo();
          } else {
              if (canUndo) undo();
          }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
          e.preventDefault();
          if (canRedo) redo();
      }

      // Ctrl+S to Save PDF
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          if (hasPages) mergeAndDownload();
      }
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
          // Only if not typing in an input
          if (document.activeElement?.tagName !== 'INPUT') {
             if (hasSelection) deleteSelectedPages();
          }
      }
      // R to rotate
      if (e.key === 'r' || e.key === 'R') {
          if (document.activeElement?.tagName !== 'INPUT') {
             if (hasSelection) rotateSelectedPages();
          }
      }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<HistoryModal isOpen={showHistory} {dict} on:close={() => showHistory = false} />

<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) overflow-x-auto max-w-[95vw]
  {hasPages ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'}">

  <!-- Undo/Redo -->
  <button
    class="p-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    disabled={!canUndo || $isProcessing}
    on:click={undo}
    title="Undo (Ctrl+Z)"
    aria-label="Undo"
  >
    <Undo class="w-5 h-5" />
  </button>
  <button
    class="p-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    disabled={!canRedo || $isProcessing}
    on:click={redo}
    title="Redo (Ctrl+Y)"
    aria-label="Redo"
  >
    <Redo class="w-5 h-5" />
  </button>

  <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

  <!-- Add More -->
  <button
    class="p-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors tooltip relative group"
    title={dict.actions.add}
    on:click={() => document.getElementById('toolbar-upload')?.click()}
    aria-label="Add Files"
  >
    <Plus class="w-5 h-5" />
    <input id="toolbar-upload" type="file" hidden multiple accept="application/pdf, image/jpeg, image/png, image/webp" on:change={handleUpload} />
  </button>

  <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

  <!-- History & Save Session -->
  <button
    class="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
    title={dict.actions.history}
    on:click={toggleHistory}
    aria-label="History"
  >
    <History class="w-5 h-5" />
  </button>

  <button
    class="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
    title={dict.actions.saveSession}
    on:click={handleSaveSession}
    aria-label="Save Session"
  >
    <Save class="w-5 h-5" />
  </button>

  <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

  <!-- Extract -->
  {#if hasSelection}
      <button
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
        on:click={() => extractSelectedPages()}
        transition:scale
      >
        <FileOutput class="w-4 h-4" />
        <span class="hidden sm:inline">{dict.actions.extract}</span>
      </button>
  {/if}

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
    aria-label="Reset"
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
