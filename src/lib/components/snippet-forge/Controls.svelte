<script lang="ts">
  import { snippetStore } from '$lib/utils/snippet-forge/store';
  import { LANGUAGES, THEMES, BACKGROUNDS, WINDOW_CONTROLS } from '$lib/utils/snippet-forge/constants';

  export let dict: any;
</script>

<div class="h-full overflow-y-auto p-4 space-y-8 pb-20">

  <!-- Language -->
  <div class="space-y-3">
    <label for="lang-select" class="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{dict.language}</label>
    <div class="relative">
      <select
        id="lang-select"
        bind:value={$snippetStore.language}
        class="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow dark:text-white"
      >
        {#each LANGUAGES as lang}
          <option value={lang.id}>{lang.name}</option>
        {/each}
      </select>
      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  </div>

  <!-- Theme -->
  <div class="space-y-3">
    <span class="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{dict.theme}</span>
    <div class="grid grid-cols-2 gap-3">
       {#each THEMES as theme}
          <button
             class="flex items-center gap-3 p-2.5 rounded-xl border text-xs font-medium transition-all text-left
             {$snippetStore.theme === theme.id ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:text-white' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}"
             on:click={() => $snippetStore.theme = theme.id}
          >
             <div class="w-6 h-6 rounded-full border border-black/10 shrink-0 shadow-sm" style="background: {theme.bg}"></div>
             <span class="truncate">{theme.name}</span>
          </button>
       {/each}
    </div>
  </div>

  <!-- Background -->
  <div class="space-y-3">
    <span class="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{dict.background}</span>
    <div class="grid grid-cols-4 gap-2">
       {#each BACKGROUNDS as bg}
          <button
             class="w-full aspect-square rounded-lg border transition-all relative overflow-hidden group hover:scale-105
             {$snippetStore.background === bg.id ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'}"
             style="background: {bg.value}"
             on:click={() => $snippetStore.background = bg.id}
             title={bg.name}
             aria-label={bg.name}
          >
             {#if bg.id === 'none'}
               <div class="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </div>
             {/if}
          </button>
       {/each}
    </div>
  </div>

  <!-- Window Settings -->
  <div class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
     <div class="space-y-3">
        <span class="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{dict.window}</span>

        <!-- Controls Type -->
        <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
           {#each WINDOW_CONTROLS as wc}
              <button
                 class="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all
                 {$snippetStore.windowControls === wc.id ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
                 on:click={() => $snippetStore.windowControls = wc.id}
              >
                 {wc.name}
              </button>
           {/each}
        </div>

        <!-- Window Title -->
        <div class="relative">
             <input
              type="text"
              bind:value={$snippetStore.windowTitle}
              placeholder="Window Title"
              class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
        </div>


        <!-- Padding Slider -->
        <div class="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
           <div class="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{dict.padding}</span>
              <span>{$snippetStore.padding}px</span>
           </div>
           <input
             type="range"
             min="0"
             max="128"
             step="16"
             bind:value={$snippetStore.padding}
             class="w-full accent-indigo-500 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
           />
        </div>

        <!-- Shadow Checkbox -->
        <label class="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
            <input type="checkbox" bind:checked={$snippetStore.dropShadow} class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Drop Shadow</span>
        </label>
     </div>
  </div>

</div>
