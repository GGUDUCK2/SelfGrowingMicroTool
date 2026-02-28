<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let dict: any;
  export let url: string = "";

  const dispatch = createEventDispatcher();

  type QueryParam = { id: string; key: string; value: string; active: boolean };
  let params: QueryParam[] = [];
  let isUpdatingFromUrl = false;

  // Sync from URL to params
  $: {
    if (!isUpdatingFromUrl && url) {
        try {
            let validUrl = url;
            if (!/^https?:\/\//i.test(validUrl) && !validUrl.startsWith('data:')) {
                validUrl = 'https://' + validUrl;
            }
            const parsed = new URL(validUrl);
            const newParams: QueryParam[] = [];
            parsed.searchParams.forEach((value, key) => {
                newParams.push({
                    id: crypto.randomUUID(),
                    key,
                    value,
                    active: true
                });
            });
            // Only update if changed to prevent cursor jumping
            if (JSON.stringify(params.filter(p => p.active)) !== JSON.stringify(newParams)) {
                // Keep inactive params
                const inactiveParams = params.filter(p => !p.active);
                params = [...newParams, ...inactiveParams];
            }
        } catch (e) {
            // invalid url, do nothing
        }
    }
  }

  function updateUrl() {
      if (!url) return;
      try {
          isUpdatingFromUrl = true;
          let validUrl = url;
          if (!/^https?:\/\//i.test(validUrl) && !validUrl.startsWith('data:')) {
              validUrl = 'https://' + validUrl;
          }
          const parsed = new URL(validUrl);

          // Clear existing search params
          parsed.search = '';

          // Rebuild
          params.filter(p => p.active && p.key.trim() !== '').forEach(p => {
              parsed.searchParams.append(p.key.trim(), p.value);
          });

          // Fix the missing protocol issue from initial parsing if it was absent
          let finalStr = parsed.toString();
          if (!url.startsWith('http') && !url.startsWith('data:') && finalStr.startsWith('https://')) {
             finalStr = finalStr.replace('https://', '');
          }

          if (url !== finalStr) {
             url = finalStr;
             dispatch('change', { url });
          }
      } catch (e) {
         // ignore
      } finally {
          setTimeout(() => { isUpdatingFromUrl = false; }, 0);
      }
  }

  function addParam() {
      params = [...params, { id: crypto.randomUUID(), key: '', value: '', active: true }];
  }

  function removeParam(id: string) {
      params = params.filter(p => p.id !== id);
      updateUrl();
  }

  function toggleParam(id: string) {
      params = params.map(p => p.id === id ? { ...p, active: !p.active } : p);
      updateUrl();
  }

  function handleInput() {
      updateUrl();
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {dict.queryParams}
        </h2>
        <button on:click={addParam} class="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 touch-manipulation">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            {dict.addParam}
        </button>
    </div>

    {#if params.length === 0}
        <div class="text-center py-8 text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
            No query parameters found. Add one to start editing.
        </div>
    {:else}
        <div class="space-y-3">
            <div class="grid grid-cols-12 gap-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
                <div class="col-span-1 text-center">✓</div>
                <div class="col-span-4">{dict.key}</div>
                <div class="col-span-6">{dict.value}</div>
                <div class="col-span-1"></div>
            </div>

            {#each params as param (param.id)}
                <div class="grid grid-cols-12 gap-3 items-center group">
                    <div class="col-span-1 flex justify-center">
                        <input type="checkbox" checked={param.active} on:change={() => toggleParam(param.id)} class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 cursor-pointer" />
                    </div>
                    <div class="col-span-4">
                        <input
                            type="text"
                            bind:value={param.key}
                            on:input={handleInput}
                            placeholder="Key"
                            class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200 {param.active ? '' : 'opacity-50'}"
                        />
                    </div>
                    <div class="col-span-6">
                        <input
                            type="text"
                            bind:value={param.value}
                            on:input={handleInput}
                            placeholder="Value"
                            class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-200 {param.active ? '' : 'opacity-50'}"
                        />
                    </div>
                    <div class="col-span-1 flex justify-center">
                         <button on:click={() => removeParam(param.id)} class="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1" aria-label="Remove">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
