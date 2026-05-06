<script lang="ts">
  import { format } from 'date-fns';
  import type { JwtHeader, JwtPayload } from '$lib/utils/jwt-forge/types';
  import { STANDARD_CLAIMS } from '$lib/utils/jwt-forge/constants';

  export let header: JwtHeader | null = null;
  export let payload: JwtPayload | null = null;
  export let dictionary: Record<string, any>;

</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="bg-white dark:bg-slate-800 rounded-xl border-l-4 border-red-500 shadow-sm overflow-hidden">
    <div class="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
      <div>
        <h3 class="font-medium text-red-500">{dictionary.jwtForge.header}</h3>
        <p class="text-xs text-slate-500">Algorithm & Token Type</p>
      </div>
      <div class="text-xs font-mono bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded">
        ALGORITHM & TOKEN TYPE
      </div>
    </div>
    <div class="p-4 font-mono text-sm overflow-x-auto">
      {#if header}
        <pre class="text-slate-700 dark:text-slate-300">{JSON.stringify(header, null, 2)}</pre>
      {:else}
        <p class="text-slate-400 italic">Invalid Header</p>
      {/if}
    </div>
  </div>

  <!-- Payload -->
  <div class="bg-white dark:bg-slate-800 rounded-xl border-l-4 border-purple-500 shadow-sm overflow-hidden">
    <div class="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
      <div>
        <h3 class="font-medium text-purple-500">{dictionary.jwtForge.payload}</h3>
        <p class="text-xs text-slate-500">Data & Claims</p>
      </div>
      <div class="text-xs font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">
        DATA
      </div>
    </div>
    <div class="p-4 font-mono text-sm overflow-x-auto">
      {#if payload}
        <table class="w-full text-left border-collapse">
          <tbody>
            {#each Object.entries(payload) as [key, value]}
              <tr class="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td class="py-3 pr-4 align-top w-1/3" title={STANDARD_CLAIMS[key] || ''}>
                  <div class="flex items-center flex-wrap gap-2">
                    <span class="font-semibold text-purple-600 dark:text-purple-400">{key}</span>
                    {#if STANDARD_CLAIMS[key]}
                      <span class="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                        {STANDARD_CLAIMS[key]}
                      </span>
                    {/if}
                  </div>
                </td>
                <td class="py-3 text-slate-700 dark:text-slate-300 break-all">
                  {#if ['exp', 'iat', 'nbf'].includes(key) && typeof value === 'number'}
                    <div class="flex flex-col gap-1">
                      <span class="text-blue-600 dark:text-blue-400 font-bold">{value}</span>
                      <span class="text-xs text-slate-500 flex items-center gap-1">
                         <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {format(new Date(value * 1000), 'yyyy-MM-dd HH:mm:ss')}
                      </span>
                    </div>
                  {:else}
                    <span class="whitespace-pre-wrap">{JSON.stringify(value)}</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p class="text-slate-400 italic">Invalid Payload</p>
      {/if}
    </div>
  </div>
</div>
