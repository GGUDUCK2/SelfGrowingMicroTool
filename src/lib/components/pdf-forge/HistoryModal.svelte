<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { X, Trash2, Clock, History } from 'lucide-svelte';
  import { restoreSession, getHistory, deleteSession } from '$lib/utils/pdf-forge/history';
  import { onMount, createEventDispatcher } from 'svelte';
  import type { PdfForgeDictionary } from '$lib/types/pdf-forge';

  export let dict: PdfForgeDictionary;
  export let isOpen = false;

  const dispatch = createEventDispatcher();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let historyItems: any[] = [];

  onMount(async () => {
      historyItems = await getHistory();
  });

  $: if (isOpen) {
      getHistory().then(items => historyItems = items);
  }

  function close() {
      dispatch('close');
  }

  async function handleRestore(id: number) {
      if (confirm(dict.history.restoreConfirm)) {
          await restoreSession(id);
          close();
      }
  }

  async function handleDelete(id: number) {
      await deleteSession(id);
      historyItems = await getHistory();
  }
</script>

{#if isOpen}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
        transition:fade
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        on:click|self={close}
    >
        <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]" transition:scale>
            <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <Clock class="w-5 h-5 text-indigo-500" />
                    <h3 class="font-bold text-lg text-slate-900 dark:text-white">{dict.history.title}</h3>
                </div>
                <button on:click={close} class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400" aria-label="Close">
                    <X class="w-5 h-5" />
                </button>
            </div>

            <div class="overflow-y-auto p-2 space-y-2 flex-1 min-h-[200px]">
                {#if historyItems.length === 0}
                    <div class="flex flex-col items-center justify-center h-full text-slate-500 gap-2 py-8">
                        <History class="w-8 h-8 opacity-20" />
                        <p>{dict.history.empty}</p>
                    </div>
                {/if}
                {#each historyItems as item (item.id)}
                    <div class="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl group border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                        <button class="flex-1 text-left" on:click={() => handleRestore(item.id)}>
                            <div class="font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
                            <div class="text-xs text-slate-500 mt-0.5">
                                {item.createdAt.toLocaleString()} • {item.pages.length} {dict.page}s
                            </div>
                        </button>
                        <button class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all" on:click={() => handleDelete(item.id)} aria-label="Delete">
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}
