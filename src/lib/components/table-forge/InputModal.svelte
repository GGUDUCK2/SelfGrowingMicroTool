<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X } from 'lucide-svelte';

  export let open = false;
  let input = '';

  const dispatch = createEventDispatcher();

  function handleImport() {
      dispatch('import', input);
      input = '';
      open = false;
  }
</script>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" on:click|self={() => open = false}>
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
          <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 class="font-bold text-lg text-slate-900 dark:text-white">Import Data</h3>
              <button on:click={() => open = false} class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close modal">
                  <X size={20} />
              </button>
          </div>
          <div class="p-4 flex-1 min-h-0">
              <textarea
                  bind:value={input}
                  class="w-full h-full min-h-[300px] p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100"
                  placeholder="Paste CSV, JSON, or Markdown table here..."
              ></textarea>
          </div>
          <div class="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button on:click={() => open = false} class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded min-h-[44px]">Cancel</button>
              <button on:click={handleImport} class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm min-h-[44px] min-w-[44px]">Import</button>
          </div>
      </div>
  </div>
{/if}
