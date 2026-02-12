<script lang="ts">
  import { selectedPages, isProcessing, pages } from '$lib/utils/pdf-forge/store';
  import { mergeAndDownload, rotateSelectedPages, deleteSelectedPages, clearAll, loadPDFs, extractSelectedPages } from '$lib/utils/pdf-forge/engine';
  import { saveSession, restoreSession, getHistory, deleteSession } from '$lib/utils/pdf-forge/history';
  import { RotateCw, Trash2, Download, RefreshCw, Plus, FileOutput, History, Save, X } from 'lucide-svelte';
  import type { PdfForgeDictionary } from '$lib/types/pdf-forge';
  import { onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';

  export let dict: PdfForgeDictionary;

  let showHistory = false;
  let historyItems: any[] = [];

  $: hasSelection = $selectedPages.size > 0;
  $: hasPages = $pages.length > 0;

  function handleUpload(e: Event) {
      const target = e.target as HTMLInputElement;
      if (target.files) loadPDFs(target.files);
      target.value = '';
  }

  async function toggleHistory() {
      if (!showHistory) {
          historyItems = await getHistory();
      }
      showHistory = !showHistory;
  }

  async function handleRestore(id: number) {
      if (confirm(dict.history.restoreConfirm)) {
          await restoreSession(id);
          showHistory = false;
      }
  }

  async function handleDeleteSession(id: number) {
      await deleteSession(id);
      historyItems = await getHistory();
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

<!-- History Modal/Panel -->
{#if showHistory}
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" transition:fade on:click|self={() => showHistory = false}>
        <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]" transition:scale>
            <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 class="font-bold text-lg">{dict.history.title}</h3>
                <button on:click={() => showHistory = false} class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <X class="w-5 h-5" />
                </button>
            </div>
            <div class="overflow-y-auto p-2 space-y-2 flex-1">
                {#if historyItems.length === 0}
                    <div class="text-center py-8 text-slate-500">{dict.history.empty}</div>
                {/if}
                {#each historyItems as item}
                    <div class="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl group border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                        <button class="flex-1 text-left" on:click={() => handleRestore(item.id)}>
                            <div class="font-medium">{item.name}</div>
                            <div class="text-xs text-slate-500">{item.createdAt.toLocaleString()} • {item.pages.length} {dict.page}s</div>
                        </button>
                        <button class="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" on:click={() => handleDeleteSession(item.id)}>
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}

<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
  {hasPages ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'}">

  <!-- Add More -->
  <button
    class="p-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors tooltip relative group"
    title={dict.actions.add}
    on:click={() => document.getElementById('toolbar-upload')?.click()}
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
  >
    <History class="w-5 h-5" />
  </button>

  <button
    class="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
    title={dict.actions.saveSession}
    on:click={handleSaveSession}
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
