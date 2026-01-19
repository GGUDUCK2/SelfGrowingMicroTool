<script lang="ts">
  import { Download, Trash2, Filter } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  export let dict: any;
  export let events: any[] = [];
  export let onClear: () => void;

  function exportJson() {
      const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `input-lab-log-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
  }
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold flex items-center gap-2">
            <span class="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Log ({events.length})
        </h3>
        <div class="flex gap-2">
             <button
                class="px-3 py-1.5 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors flex items-center gap-2"
                on:click={exportJson}
                disabled={events.length === 0}
             >
                <Download size={14} />
                {dict.history.export}
             </button>
             <button
                class="px-3 py-1.5 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:text-red-600 transition-colors flex items-center gap-2"
                on:click={onClear}
             >
                <Trash2 size={14} />
                {dict.history.clear}
             </button>
        </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px] max-h-[600px] overflow-y-auto">
        {#if events.length === 0}
            <div class="flex flex-col items-center justify-center h-64 text-slate-400">
                <Filter size={32} class="mb-2 opacity-50" />
                <p>{dict.history.noEvents}</p>
            </div>
        {:else}
            <table class="w-full text-sm text-left">
                <thead class="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-medium text-slate-500 sticky top-0">
                    <tr>
                        <th class="px-4 py-3 w-32">{dict.history.time}</th>
                        <th class="px-4 py-3 w-32">{dict.history.type}</th>
                        <th class="px-4 py-3">{dict.history.detail}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    {#each [...events].reverse() as event (event.time)}
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-mono">
                            <td class="px-4 py-2 text-slate-400 whitespace-nowrap">
                                {event.time.toLocaleTimeString()} <span class="text-[10px] opacity-70">.{event.time.getMilliseconds().toString().padStart(3, '0')}</span>
                            </td>
                            <td class="px-4 py-2">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                    {event.type === 'keydown' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                     event.type === 'keyup' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                                     event.type === 'pointer' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' :
                                     event.type === 'gamepad' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''
                                    }"
                                >
                                    {event.type}
                                </span>
                            </td>
                            <td class="px-4 py-2 text-slate-700 dark:text-slate-300">
                                {#if event.code}
                                    <span class="font-bold">{event.code}</span>
                                    {#if event.key && event.key !== event.code}
                                        <span class="text-slate-400 mx-1">/</span> {event.key}
                                    {/if}
                                {:else if event.detail}
                                    {event.detail}
                                    {#if event.pressure}
                                       <span class="ml-2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">P: {event.pressure}</span>
                                    {/if}
                                {:else}
                                    -
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>
