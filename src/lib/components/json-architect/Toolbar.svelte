<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let t: any; // dictionary object

  const dispatch = createEventDispatcher();
</script>

<div class="flex flex-wrap items-center gap-2 mb-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
  <div class="flex gap-2 mr-auto">
      <button
        type="button"
        on:click={() => dispatch('action', 'format')}
        class="px-4 py-2.5 text-sm min-h-[44px] min-w-[44px] font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:outline-none touch-manipulation"
      >
        {t.format}
      </button>
      <button
        type="button"
        on:click={() => dispatch('action', 'minify')}
        class="px-4 py-2.5 text-sm min-h-[44px] min-w-[44px] font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:outline-none touch-manipulation"
      >
        {t.minify}
      </button>
      <button
        type="button"
        on:click={() => dispatch('action', 'validate')}
        class="px-4 py-2.5 text-sm min-h-[44px] min-w-[44px] font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:outline-none touch-manipulation"
      >
        {t.validate}
      </button>
  </div>

  <div class="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-2 hidden sm:block"></div>

  <div class="flex gap-2">
    <button
        type="button"
        on:click={() => dispatch('action', 'toTs')}
        class="px-4 py-2.5 text-sm min-h-[44px] min-w-[44px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:outline-none touch-manipulation"
      >
        TS
      </button>
      <button
        type="button"
        on:click={() => dispatch('action', 'toGo')}
        class="px-4 py-2.5 text-sm min-h-[44px] min-w-[44px] font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 rounded hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:outline-none touch-manipulation"
      >
        Go
      </button>
  </div>

  <div class="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-2 hidden sm:block"></div>

  <div class="flex gap-2">
      <button
        type="button"
        on:click={() => dispatch('action', 'copy')}
        class="px-4 py-2.5 text-sm min-h-[44px] min-w-[44px] font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:outline-none touch-manipulation"
      >
        {t.copy}
      </button>
      <button
        type="button"
        on:click={() => dispatch('action', 'share')}
        class="px-4 py-2.5 text-sm min-h-[44px] min-w-[44px] font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:outline-none touch-manipulation"
      >
        {t.shareLink}
      </button>
      <button
        type="button"
        on:click={() => dispatch('action', 'clear')}
        class="px-4 py-2.5 text-sm min-h-[44px] min-w-[44px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:outline-none touch-manipulation"
      >
        {t.clear}
      </button>
  </div>
</div>
