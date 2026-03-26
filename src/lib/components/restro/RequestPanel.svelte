<script lang="ts">
  import { Play, Save, Loader2 } from 'lucide-svelte';
  import type { RestroDictionary } from '$lib/types/restro';

  export let method: string;
  export let url: string;
  export let loading: boolean = false;
  export let dict: RestroDictionary;
  export let onSend: () => void;
  export let onSave: () => void;

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
        onSend();
    }
  }
</script>

<div class="flex flex-col sm:flex-row gap-2 mb-4">
  <div class="flex rounded-lg shadow-sm w-full">
    <select
      bind:value={method}
      class="rounded-l-lg border-r-0 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200 min-h-[44px]"
    >
      {#each methods as m}
        <option value={m}>{m}</option>
      {/each}
    </select>
    <input
      type="text"
      bind:value={url}
      on:keydown={handleKeydown}
      placeholder="https://api.example.com/v1/resource"
      aria-label={dict.url}
      class="flex-1 rounded-r-lg sm:rounded-r-none border border-slate-300 dark:border-slate-600 dark:bg-slate-800 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-mono min-h-[44px]"
    />
  </div>

  <div class="flex gap-2">
    <button
      on:click={onSend}
      disabled={loading}
      class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] min-h-[44px]"
    >
      {#if loading}
        <Loader2 class="w-4 h-4 animate-spin" />
      {:else}
        <Play class="w-4 h-4" />
        {dict.send}
      {/if}
    </button>

    <button
        on:click={onSave}
        class="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors min-w-[44px] min-h-[44px]"
        aria-label={dict.save}
    >
        <Save class="w-4 h-4" />
    </button>
  </div>
</div>
