<script lang="ts">
  import type { LogEntry } from '$lib/utils/log-prism/types';
  import { X, Copy } from '@lucide/svelte';

  export let entry: LogEntry | null = null;
  export let dict: any;
  export let onClose: () => void;

  function copyJson() {
      if (!entry) return;
      const data = {
          timestamp: entry.timestamp,
          level: entry.level,
          message: entry.message,
          ...entry.metadata
      };
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  }
</script>

{#if entry}
    <div class="h-full flex flex-col bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-xl w-full sm:w-96 absolute right-0 top-0 bottom-0 z-20">
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
            <h3 class="font-bold text-slate-800 dark:text-white">{dict.details}</h3>
            <div class="flex gap-2">
                 <button class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500" on:click={copyJson} title="Copy JSON">
                    <Copy size={16} />
                </button>
                <button class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500" on:click={onClose}>
                    <X size={18} />
                </button>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4">
             <div>
                <div class="text-xs font-bold text-slate-500 uppercase block mb-1">Timestamp</div>
                <div class="text-sm font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                    {entry.timestamp?.toISOString() ?? 'N/A'}
                </div>
             </div>

             <div>
                <div class="text-xs font-bold text-slate-500 uppercase block mb-1">Level</div>
                <div class="text-sm font-mono inline-block px-2 py-1 rounded border {entry.level === 'error' ? 'bg-red-50 text-red-700 border-red-200' : entry.level === 'warn' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'}">
                    {entry.level.toUpperCase()}
                </div>
             </div>

             <div>
                <div class="text-xs font-bold text-slate-500 uppercase block mb-1">Message</div>
                <div class="text-sm font-mono bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 break-words whitespace-pre-wrap">
                    {entry.message}
                </div>
             </div>

             {#if Object.keys(entry.metadata).length > 0}
                 <div>
                    <div class="text-xs font-bold text-slate-500 uppercase block mb-1">Metadata</div>
                    <pre class="text-xs font-mono bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto">{JSON.stringify(entry.metadata, null, 2)}</pre>
                 </div>
             {/if}

             <div>
                <div class="text-xs font-bold text-slate-500 uppercase block mb-1">Raw Line</div>
                <div class="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-900/50 p-2 rounded break-all">
                    {entry.raw}
                </div>
             </div>
        </div>
    </div>
{/if}
