<script lang="ts">
  export let content: string;
  export let t: Record<string, any>;

  let compareContent = '';

  function parseEnv(str: string): Record<string, string> {
      const result: Record<string, string> = {};
      const lines = str.split('\n');
      for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
              result[match[1].trim()] = match[2].trim();
          }
      }
      return result;
  }

  $: baseEnv = parseEnv(content);
  $: compareEnv = parseEnv(compareContent);

  $: baseKeys = Object.keys(baseEnv);
  $: compareKeys = Object.keys(compareEnv);

  $: missingInBase = compareKeys.filter(k => !(k in baseEnv));
  $: missingInCompare = baseKeys.filter(k => !(k in compareEnv));
  $: differingValues = baseKeys.filter(k => k in compareEnv && baseEnv[k] !== compareEnv[k]);

</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col space-y-6">
  <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      {t.compare.title}
  </h3>

  <div class="flex-grow">
      <label for="compare-editor" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.compare.subtitle}</label>
      <textarea
          id="compare-editor"
          class="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none shadow-inner"
          placeholder={t.compare.placeholder}
          bind:value={compareContent}
          spellcheck="false"
      ></textarea>
  </div>

  {#if compareContent.trim()}
      <div class="space-y-4">
          {#if missingInBase.length === 0 && missingInCompare.length === 0 && differingValues.length === 0}
              <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  <p>{t.compare.identical}</p>
              </div>
          {:else}
              {#if missingInCompare.length > 0}
                  <div class="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800">
                      <h4 class="font-bold flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          {t.compare.missingInCompare}
                      </h4>
                      <ul class="list-disc list-inside text-sm font-mono space-y-1">
                          {#each missingInCompare as key}
                              <li>{key}</li>
                          {/each}
                      </ul>
                  </div>
              {/if}

              {#if missingInBase.length > 0}
                  <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800">
                      <h4 class="font-bold flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          {t.compare.missingInBase}
                      </h4>
                      <ul class="list-disc list-inside text-sm font-mono space-y-1">
                          {#each missingInBase as key}
                              <li>{key}</li>
                          {/each}
                      </ul>
                  </div>
              {/if}

              {#if differingValues.length > 0}
                  <div class="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800">
                      <h4 class="font-bold flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                          {t.compare.differingValues}
                      </h4>
                      <ul class="space-y-2 text-sm font-mono">
                          {#each differingValues as key}
                              <li class="break-all border-b border-amber-200 dark:border-amber-700/50 pb-2 last:border-0 last:pb-0">
                                  <span class="font-bold text-amber-900 dark:text-amber-500">{key}</span>
                                  <div class="mt-1 flex flex-col gap-1 pl-4">
                                      <span class="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t.compare.base}: <span class="text-amber-800 dark:text-amber-300 normal-case bg-amber-100 dark:bg-amber-900/50 px-1 rounded">{baseEnv[key]}</span></span>
                                      <span class="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">{t.compare.compare}: <span class="text-amber-800 dark:text-amber-300 normal-case bg-amber-100 dark:bg-amber-900/50 px-1 rounded">{compareEnv[key]}</span></span>
                                  </div>
                              </li>
                          {/each}
                      </ul>
                  </div>
              {/if}
          {/if}
      </div>
  {/if}
</div>
