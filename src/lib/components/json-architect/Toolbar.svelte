<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let t: any; // dictionary object

  const dispatch = createEventDispatcher();
</script>

<div class="flex flex-wrap items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
  <div class="flex gap-2 mr-auto">
      <button
        on:click={() => dispatch('action', 'format')}
        class="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        {t.format}
      </button>
      <button
        on:click={() => dispatch('action', 'minify')}
        class="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        {t.minify}
      </button>
      <button
        on:click={() => dispatch('action', 'validate')}
        class="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        {t.validate}
      </button>
  </div>

  <div class="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2 hidden sm:block"></div>

  <div class="flex gap-2">
    <button
        on:click={() => dispatch('action', 'toTs')}
        class="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
      >
        TS
      </button>
      <button
        on:click={() => dispatch('action', 'toGo')}
        class="px-3 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 rounded hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors"
      >
        Go
      </button>
  </div>

  <div class="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2 hidden sm:block"></div>

  <div class="flex gap-2">
      <button
        on:click={() => dispatch('action', 'copy')}
        class="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        {t.copy}
      </button>
      <button
        on:click={() => dispatch('action', 'share')}
        class="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        {t.shareLink}
      </button>
      <button
        on:click={() => dispatch('action', 'clear')}
        class="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
      >
        {t.clear}
      </button>
  </div>
</div>
