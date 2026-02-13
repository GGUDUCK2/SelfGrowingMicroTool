<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { db, type PdfForgeHistory } from '$lib/db';
  import { loadSession } from '$lib/utils/pdf-forge/engine';
  import type { PdfForgeDictionary } from '$lib/types/pdf-forge';
  import { fade, fly } from 'svelte/transition';
  import { X, Trash2, RotateCcw, FileText } from 'lucide-svelte';

  export let dict: PdfForgeDictionary;
  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let historyItems: PdfForgeHistory[] = [];

  async function loadHistory() {
    if (typeof window !== 'undefined') {
        historyItems = await db.pdfForgeHistory.orderBy('createdAt').reverse().toArray();
    }
  }

  onMount(() => {
    loadHistory();
  });

  $: if (isOpen) {
    loadHistory();
  }

  async function handleLoad(id: number) {
    if (confirm(dict.history.restoreConfirm)) {
      await loadSession(id);
      dispatch('close');
    }
  }

  async function handleDelete(id: number) {
    await db.pdfForgeHistory.delete(id);
    await loadHistory();
  }

  function close() {
    dispatch('close');
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" in:fade role="dialog" aria-modal="true">
    <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" on:click={close} on:keydown={(e) => e.key === 'Escape' && close()} role="button" tabindex="0" aria-label="Close modal"></div>
    <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden" in:fly={{ y: 20 }}>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">{dict.history.title}</h2>
        <button on:click={close} class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Close">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        {#if historyItems.length === 0}
          <div class="text-center py-12 text-slate-500 dark:text-slate-400">
            <p>{dict.history.empty}</p>
          </div>
        {:else}
          {#each historyItems as item (item.id)}
            <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
              <div class="flex items-start gap-4">
                <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <FileText class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(item.createdAt).toLocaleString()} • {item.files.length} files
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  on:click={() => item.id && handleLoad(item.id)}
                  class="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg"
                  title={dict.history.restore}
                  aria-label="Restore session"
                >
                  <RotateCcw class="w-5 h-5" />
                </button>
                <button
                  on:click={() => item.id && handleDelete(item.id)}
                  class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                  title={dict.history.delete}
                  aria-label="Delete session"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}
