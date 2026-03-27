<script lang="ts">
  import { X, Download, Shield } from 'lucide-svelte';
  import { fade, scale } from 'svelte/transition';

  export let show = false;
  export let dictionary: Record<string, any>;
  export let onGenerate: (count: number) => string;
  export let onClose: () => void;

  let count = 10;

  function handleDownload() {
    const csvContent = onGenerate(count);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bulk_passwords_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  }
</script>

{#if show}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" transition:fade={{ duration: 200 }} on:click={onClose}>
    <div
      class="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 relative"
      transition:scale={{ duration: 200, start: 0.95 }}
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <button
        class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        on:click={onClose}
        aria-label={dictionary.bulkCancel || 'Cancel'}
      >
        <X size={20} />
      </button>

      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Shield size={24} />
        </div>
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">
          {dictionary.bulkTitle || 'Bulk Generate Passwords'}
        </h2>
      </div>

      <div class="mb-8">
        <label for="bulk-count" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {dictionary.bulkCount || 'Number of Passwords'}
        </label>
        <input
          type="number"
          id="bulk-count"
          min="1"
          max="500"
          bind:value={count}
          class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-100 min-h-[44px]"
        />
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Generates a CSV file with multiple passwords based on your current settings.
        </p>
      </div>

      <div class="flex gap-3">
        <button
          class="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors min-h-[44px]"
          on:click={onClose}
        >
          {dictionary.bulkCancel || 'Cancel'}
        </button>
        <button
          class="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          on:click={handleDownload}
        >
          <Download size={18} />
          {dictionary.bulkDownload || 'Download CSV'}
        </button>
      </div>
    </div>
  </div>
{/if}
