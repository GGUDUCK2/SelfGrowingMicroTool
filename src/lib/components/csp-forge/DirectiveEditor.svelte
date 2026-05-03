<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let directives: Record<string, string[]> = {};


  const dispatch = createEventDispatcher();

  const availableDirectives = [
    'default-src', 'script-src', 'style-src', 'img-src', 'connect-src',
    'font-src', 'object-src', 'media-src', 'frame-src', 'child-src',
    'form-action', 'frame-ancestors', 'base-uri', 'worker-src', 'manifest-src'
  ];

  const presetSources = [
    "'self'",
    "'none'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https:",
    "data:",
    "blob:"
  ];

  let customInputs: Record<string, string> = {};

  function toggleSource(directive: string, source: string) {
    if (!directives[directive]) {
        directives[directive] = [];
    }

    // If 'none' is selected, clear everything else
    if (source === "'none'") {
        if (!directives[directive].includes("'none'")) {
            directives[directive] = ["'none'"];
        } else {
            directives[directive] = directives[directive].filter(s => s !== "'none'");
        }
    } else {
        // Remove 'none' if selecting something else
        directives[directive] = directives[directive].filter(s => s !== "'none'");

        if (directives[directive].includes(source)) {
            directives[directive] = directives[directive].filter(s => s !== source);
        } else {
            directives[directive] = [...directives[directive], source];
        }
    }

    if (directives[directive].length === 0) {
        delete directives[directive];
        directives = { ...directives };
    } else {
        directives = { ...directives };
    }

    dispatch('change', directives);
  }

  function addCustomSource(directive: string) {
    const val = customInputs[directive]?.trim();
    if (val) {
        if (!directives[directive]) {
            directives[directive] = [];
        }
        directives[directive] = directives[directive].filter(s => s !== "'none'");
        if (!directives[directive].includes(val)) {
             directives[directive] = [...directives[directive], val];
        }
        customInputs[directive] = '';
        directives = { ...directives };
        dispatch('change', directives);
    }
  }

  function handleKeydown(e: KeyboardEvent, directive: string) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addCustomSource(directive);
    }
  }

  function removeSource(directive: string, source: string) {
    directives[directive] = directives[directive].filter(s => s !== source);
    if (directives[directive].length === 0) {
        delete directives[directive];
    }
    directives = { ...directives };
    dispatch('change', directives);
  }

  function getDirectiveSources(d: string) {
      return directives[d] || [];
  }
</script>

<div class="space-y-6">
  {#each availableDirectives as directive}
    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h3 class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
           <span class="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           </span>
           {directive}
        </h3>

        <div class="flex flex-wrap gap-2">
           {#each presetSources as source}
             <button
               type="button"
               on:click={() => toggleSource(directive, source)}
               class="px-3 py-1.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors border {getDirectiveSources(directive).includes(source) ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}"
             >
               {source}
             </button>
           {/each}
        </div>
      </div>

      <div class="flex flex-wrap gap-2 items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
         {#each getDirectiveSources(directive).filter(s => !presetSources.includes(s)) as customSrc}
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg shadow-sm">
                {customSrc}
                <button type="button" on:click={() => removeSource(directive, customSrc)} class="text-slate-400 hover:text-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2" aria-label="Remove {customSrc}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </span>
         {/each}

         <div class="flex items-center gap-2 flex-1 min-w-[200px]">
             <input
               type="text"
               bind:value={customInputs[directive]}
               on:keydown={(e) => handleKeydown(e, directive)}
               placeholder="Add custom source (e.g. *.example.com)"
               class="flex-1 min-h-[44px] px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
             <button
               type="button"
               on:click={() => addCustomSource(directive)}
               class="min-h-[44px] px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
             >
               Add
             </button>
         </div>
      </div>
    </div>
  {/each}
</div>
