<script lang="ts">
  import { Search, Filter, X } from 'lucide-svelte';

  export let searchTerm = '';
  export let selectedLevels: Record<string, boolean> = { error: true, warn: true, info: true, debug: true };
  export let dict: any;

  function toggle(level: string) {
      selectedLevels[level] = !selectedLevels[level];
  }

  function setPreset(type: 'all' | 'errors' | 'warnings') {
      if (type === 'all') {
          selectedLevels = { error: true, warn: true, info: true, debug: true };
          searchTerm = '';
      } else if (type === 'errors') {
          selectedLevels = { error: true, warn: false, info: false, debug: false };
      } else if (type === 'warnings') {
          selectedLevels = { error: false, warn: true, info: false, debug: false };
      }
  }
</script>

<div class="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 items-center">
    <div class="relative flex-1 w-full">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
            id="log-search"
            type="text"
            bind:value={searchTerm}
            placeholder={dict.search + " (Regex supported)"}
            class="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        {#if searchTerm}
            <button class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" on:click={() => searchTerm = ''}>
                <X size={16} />
            </button>
        {/if}
    </div>

    <div class="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
        <!-- Quick Actions -->
        <div class="flex gap-1 mr-2 border-r border-slate-200 dark:border-slate-700 pr-2">
            <button class="text-xs font-medium text-slate-500 hover:text-indigo-600 px-2 py-1" on:click={() => setPreset('all')}>All</button>
            <button class="text-xs font-medium text-slate-500 hover:text-red-600 px-2 py-1" on:click={() => setPreset('errors')}>Errors</button>
        </div>

        <Filter size={16} class="text-slate-400 mr-2 shrink-0" />

        <button
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-colors border {selectedLevels.error ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50' : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700'}"
            on:click={() => toggle('error')}
        >
            Error
        </button>
        <button
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-colors border {selectedLevels.warn ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900/50' : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700'}"
            on:click={() => toggle('warn')}
        >
            Warn
        </button>
        <button
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-colors border {selectedLevels.info ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50' : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700'}"
            on:click={() => toggle('info')}
        >
            Info
        </button>
        <button
            class="px-3 py-1.5 rounded-full text-xs font-bold transition-colors border {selectedLevels.debug ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700'}"
            on:click={() => toggle('debug')}
        >
            Debug
        </button>
    </div>
</div>
