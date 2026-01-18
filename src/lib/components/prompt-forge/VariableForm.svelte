<script lang="ts">
  import { slide } from 'svelte/transition';
  import { Sparkles, Plus, Trash2, Layers } from 'lucide-svelte';
  import { autoFillVariables } from '$lib/utils/prompt-forge/magic';

  export let variables: string[] = [];
  export let values: Record<string, string> = {};
  export let dict: any;

  // Scenario Management
  export let scenarios: Record<string, Record<string, string>> = { 'default': {} };
  export let activeScenarioId: string = 'default';

  function handleMagicFill() {
      values = autoFillVariables(variables, values);
      scenarios[activeScenarioId] = values;
  }

  function addScenario() {
      const name = prompt(dict.scenarioName || "Scenario Name:", `Case ${Object.keys(scenarios).length + 1}`);
      if (!name) return;

      // Save current
      scenarios[activeScenarioId] = { ...values };

      // Create new
      scenarios[name] = { ...values }; // Clone current
      activeScenarioId = name;
      values = scenarios[name];
  }

  function deleteScenario() {
      if (activeScenarioId === 'default') return;
      if (!confirm('Delete this scenario?')) return;

      const newScenarios = { ...scenarios };
      delete newScenarios[activeScenarioId];
      scenarios = newScenarios;

      activeScenarioId = 'default';
      values = scenarios['default'];
  }

  function handleScenarioChange(e: Event) {
      const select = e.target as HTMLSelectElement;
      const newId = select.value;

      // Save old (though reactivity might handle it, better be safe)
      scenarios[activeScenarioId] = values;

      activeScenarioId = newId;
      values = scenarios[newId] || {};

      // Ensure variables exist
      variables.forEach(v => {
          if (values[v] === undefined) values[v] = '';
      });
  }

  // Reactively ensure all variables exist in values object
  $: {
    variables.forEach(v => {
      if (values[v] === undefined) {
        values[v] = '';
      }
    });
    // Sync to scenario storage
    if (scenarios[activeScenarioId] !== values) {
         scenarios[activeScenarioId] = values;
    }
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-3">

    <div class="flex justify-between items-center">
        <h3 class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers class="w-4 h-4 text-indigo-500" />
            {dict.editor.variables}
        </h3>
        <span class="text-xs text-slate-500 px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-full font-mono">
        {variables.length}
        </span>
    </div>

    <!-- Scenarios Toolbar -->
    <div class="flex gap-2">
        <div class="relative flex-1">
            <select
                class="w-full h-9 pl-3 pr-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                value={activeScenarioId}
                on:change={handleScenarioChange}
                aria-label={dict.scenarios || 'Scenarios'}
            >
                {#each Object.keys(scenarios) as id}
                    <option value={id}>{id === 'default' ? (dict.defaultScenario || 'Default Case') : id}</option>
                {/each}
            </select>
            <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>

        <button on:click={addScenario} class="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition-colors" title={dict.addScenario || "Add Scenario"} aria-label={dict.addScenario || "Add Scenario"}>
            <Plus class="w-4 h-4" />
        </button>

        <button on:click={deleteScenario} disabled={activeScenarioId === 'default'} class="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title={dict.deleteScenario || "Delete Scenario"} aria-label={dict.deleteScenario || "Delete Scenario"}>
            <Trash2 class="w-4 h-4" />
        </button>
    </div>

    {#if variables.length > 0}
        <button
            on:click={handleMagicFill}
            class="w-full flex items-center justify-center gap-2 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-lg transition-colors group"
        >
            <Sparkles class="w-3.5 h-3.5 group-hover:animate-pulse" />
            {dict.magicFill || 'Magic Fill'}
        </button>
    {/if}

  </div>

  <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
    {#if variables.length === 0}
      <div class="text-center py-8 text-slate-400 dark:text-slate-500 italic text-sm">
        No variables detected.<br>
        Use <code class="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-indigo-500">{'{{variable}}'}</code> syntax.
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
