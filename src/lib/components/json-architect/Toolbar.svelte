<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/Button.svelte';

  export let t: any; // dictionary object

  const dispatch = createEventDispatcher();
</script>

<div class="flex flex-wrap items-center gap-2 mb-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
  <div class="flex gap-2 mr-auto">
      <Button
        type="button"
        on:click={() => dispatch('action', 'format')}
      >
        {t.format}
      </Button>
      <Button
        type="button"
        on:click={() => dispatch('action', 'minify')}
      >
        {t.minify}
      </Button>
      <Button
        type="button"
        on:click={() => dispatch('action', 'validate')}
      >
        {t.validate}
      </Button>
  </div>

  <div class="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-2 hidden sm:block"></div>

  <div class="flex gap-2">
      <Button
        type="button"
        on:click={() => dispatch('action', 'toTs')}
        class="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
      >
        TS
      </Button>
      <Button
        type="button"
        on:click={() => dispatch('action', 'toGo')}
        class="text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/40"
      >
        Go
      </Button>
  </div>

  <div class="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-2 hidden sm:block"></div>

  <div class="flex gap-2">
      <Button
        type="button"
        on:click={() => dispatch('action', 'copy')}
      >
        {t.copy}
      </Button>
      <Button
        type="button"
        on:click={() => dispatch('action', 'share')}
      >
        {t.shareLink}
      </Button>
      <Button
        type="button"
        variant="danger"
        on:click={() => dispatch('action', 'clear')}
      >
        {t.clear}
      </Button>
  </div>
</div>
