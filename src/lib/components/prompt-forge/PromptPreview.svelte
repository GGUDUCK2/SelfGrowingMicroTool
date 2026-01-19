<script lang="ts">
  import { fade } from 'svelte/transition';

  export let compiledSystem: string = "";
  export let compiledUser: string = "";
  export let dict: Record<string, any>;

  let copiedSystem = false;
  let copiedUser = false;

  function copy(text: string, type: 'system' | 'user') {
    navigator.clipboard.writeText(text);
    if (type === 'system') {
        copiedSystem = true;
        setTimeout(() => copiedSystem = false, 2000);
    } else {
        copiedUser = true;
        setTimeout(() => copiedUser = false, 2000);
    }
  }
</script>

<div class="flex flex-col h-full gap-4">
  <!-- System Prompt Preview -->
  {#if compiledSystem}
  <div class="flex-none flex flex-col" transition:fade>
    <div class="flex justify-between items-center mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">System</span>
        <button
            on:click={() => copy(compiledSystem, 'system')}
            class="text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors {copiedSystem ? 'text-green-500' : 'text-slate-500'}"
            aria-label={copiedSystem ? dict.toolbar.copied : dict.toolbar.copy}
        >
            {copiedSystem ? dict.toolbar.copied : dict.toolbar.copy}
        </button>
    </div>
    <div class="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
        {compiledSystem}
    </div>
  </div>
  {/if}

  <!-- User Prompt Preview -->
  <div class="flex-1 flex flex-col min-h-0">
    <div class="flex justify-between items-center mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">User</span>
        <button
            on:click={() => copy(compiledUser, 'user')}
            class="text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors {copiedUser ? 'text-green-500' : 'text-slate-500'}"
            aria-label={copiedUser ? dict.toolbar.copied : dict.toolbar.copy}
        >
            {copiedUser ? dict.toolbar.copied : dict.toolbar.copy}
        </button>
    </div>
    <div class="flex-1 w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-y-auto custom-scrollbar">
        {compiledUser || '...'}
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
  }
</style>
