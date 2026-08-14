<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { AlertTriangle } from '@lucide/svelte';

  export let title = 'Confirm Action';
  export let message = 'Are you sure you want to proceed?';
  export let confirmText = 'Yes';
  export let cancelText = 'Cancel';

  const dispatch = createEventDispatcher();

  function onConfirm() {
    dispatch('confirm');
  }

  function onCancel() {
    dispatch('cancel');
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" transition:fade role="dialog" aria-modal="true">
  <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 p-6" transition:scale={{ start: 0.95 }}>
    <div class="flex items-center gap-3 mb-4 text-amber-500">
      <AlertTriangle size={24} />
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
    </div>

    <p class="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
      {message}
    </p>

    <div class="flex justify-end gap-3">
      <button
        class="min-h-[44px] min-w-[44px] px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
        on:click={onCancel}
      >
        {cancelText}
      </button>
      <button
        class="min-h-[44px] min-w-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-colors"
        on:click={onConfirm}
      >
        {confirmText}
      </button>
    </div>
  </div>
</div>
