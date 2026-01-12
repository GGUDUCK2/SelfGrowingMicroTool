<script lang="ts">
  import { db, type RestroRequest, type RestroVariable } from '$lib/db/restro';
  import { executeRequest, substituteVariables } from '$lib/utils/restro/client';
  import { Play, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-svelte';
  import { liveQuery } from 'dexie';

  export let requests: RestroRequest[] = []; // Requests to run

  let results: { req: RestroRequest; status: 'pending' | 'running' | 'success' | 'error'; responseStatus?: number; time?: number }[] = [];
  let running = false;
  let progress = 0;

  // Load variables
  let variables$ = liveQuery(() => db.variables.where('enabled').equals(1).toArray());

  $: if (requests.length > 0 && results.length === 0) {
      results = requests.map(r => ({ req: r, status: 'pending' }));
  }

  async function runBatch() {
      if (running) return;
      running = true;
      progress = 0;

      let lastResponse = null;

      for (let i = 0; i < requests.length; i++) {
          results[i].status = 'running';
          results = [...results]; // Trigger reactivity

          const req = requests[i];
          const vars = ($variables$ || []).map(v => ({ key: v.key, value: v.value }));

          try {
              // Substitute variables
              const url = await substituteVariables(req.url, lastResponse, vars);
              const body = await substituteVariables(req.bodyContent, lastResponse, vars);
              const headers = await Promise.all(req.headers.map(async h => ({
                  ...h,
                  value: await substituteVariables(h.value, lastResponse, vars)
              })));
              const params = await Promise.all(req.params.map(async p => ({
                  ...p,
                  value: await substituteVariables(p.value, lastResponse, vars)
              })));

              // Construct URL
              let finalUrl = url;
               if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;
               const urlObj = new URL(finalUrl);
               params.forEach(p => {
                 if (p.enabled && p.key) {
                   urlObj.searchParams.append(p.key, p.value);
                 }
               });
               finalUrl = urlObj.toString();

              const res = await executeRequest(
                  req.method,
                  finalUrl,
                  headers,
                  req.bodyType,
                  body
              );

              lastResponse = res;
              results[i].responseStatus = res.status;
              results[i].time = res.time;

              if (res.ok) {
                  results[i].status = 'success';
              } else {
                  results[i].status = 'error';
                  // Stop on error? For now, continue but mark error.
              }

          } catch (e) {
              results[i].status = 'error';
          }

          progress = ((i + 1) / requests.length) * 100;
          results = [...results];
          // Small delay for UI update
          await new Promise(r => setTimeout(r, 100));
      }

      running = false;
  }
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Batch Runner</h3>
        <button
            on:click={runBatch}
            disabled={running || requests.length === 0}
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
        >
            {#if running}
                <Loader2 class="w-4 h-4 animate-spin" /> Running...
            {:else}
                <Play class="w-4 h-4" /> Run Batch
            {/if}
        </button>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style="width: {progress}%"></div>
    </div>

    <!-- Results List -->
    <div class="space-y-2 max-h-[60vh] overflow-y-auto">
        {#each results as item, i}
            <div class="flex items-center justify-between p-3 rounded-lg border {item.status === 'pending' ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800' : item.status === 'running' ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20' : item.status === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}">
                <div class="flex items-center gap-3">
                    <span class="text-sm font-mono text-slate-500 w-6">{i + 1}.</span>
                    <span class="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{item.req.method}</span>
                    <span class="text-sm truncate max-w-[200px] text-slate-700 dark:text-slate-300">{item.req.name || item.req.url}</span>
                </div>

                <div class="flex items-center gap-2">
                    {#if item.status === 'pending'}
                        <span class="text-xs text-slate-400">Pending</span>
                    {:else if item.status === 'running'}
                        <Loader2 class="w-4 h-4 animate-spin text-indigo-500" />
                    {:else if item.status === 'success'}
                         <span class="text-xs font-mono text-green-600 dark:text-green-400">{item.responseStatus} ({item.time}ms)</span>
                         <CheckCircle class="w-4 h-4 text-green-500" />
                    {:else}
                         <span class="text-xs font-mono text-red-600 dark:text-red-400">{item.responseStatus || 'ERR'}</span>
                         <XCircle class="w-4 h-4 text-red-500" />
                    {/if}
                </div>
            </div>
        {/each}

        {#if requests.length === 0}
            <div class="text-center p-4 text-slate-500 text-sm">No requests selected. Go to Collections to select requests.</div>
        {/if}
    </div>
</div>
