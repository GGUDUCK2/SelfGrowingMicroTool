<script lang="ts">
  import { slide } from 'svelte/transition';

  export let variables: string[] = [];
  export let values: Record<string, string> = {};
  export let dict: any;

  // Reactively ensure all variables exist in values object
  $: {
    variables.forEach(v => {
      if (values[v] === undefined) {
        values[v] = '';
      }
    });
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
    <h3 class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/></svg>
      {dict.editor.variables}
    </h3>
    <span class="text-xs text-slate-500 px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-full font-mono">
      {variables.length}
    </span>
  </div>

  <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
    {#if variables.length === 0}
      <div class="text-center py-8 text-slate-400 dark:text-slate-500 italic text-sm">
        No variables detected.<br>
        Use <code class="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-indigo-500">{'{{variable}}'}</code> syntax in your prompt.
      </div>
    {:else}
      {#each variables as variable (variable)}
        <div transition:slide|local={{ duration: 200 }}>
          <label for="var-{variable}" class="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 font-mono truncate" title={variable}>
            {variable}
          </label>
          <input
            id="var-{variable}"
            type="text"
            bind:value={values[variable]}
            class="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            placeholder="Value for {variable}..."
          />
        </div>
      {/each}
    {/if}
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
