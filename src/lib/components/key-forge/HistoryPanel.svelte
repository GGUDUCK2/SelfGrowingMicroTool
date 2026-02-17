<script lang="ts">
  import { db } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { browser } from '$app/environment';

  export let dict: any;

  let history;

  if (browser) {
      history = liveQuery(async () => {
          if (db.keyForgeHistory) {
            return await db.keyForgeHistory.orderBy('timestamp').reverse().limit(50).toArray();
          }
          return [];
      });
  } else {
      history = { subscribe: (cb: any) => { cb([]); return () => {}; } };
  }

  function deleteItem(id: number) {
      if (confirm('Delete this record?')) {
          db.keyForgeHistory.delete(id);
      }
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden w-full">
    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
        <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            {dict.history}
        </h3>
    </div>

    <div class="max-h-96 overflow-y-auto">
        {#if $history && $history.length > 0}
            <table class="w-full text-sm text-left">
                <thead class="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th class="px-4 py-3">{dict.wpm}</th>
                        <th class="px-4 py-3">{dict.acc}</th>
                        <th class="px-4 py-3">{dict.mode}</th>
                        <th class="px-4 py-3">{dict.time}</th>
                        <th class="px-4 py-3 w-10"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                    {#each $history as item}
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                            <td class="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{item.wpm}</td>
                            <td class="px-4 py-3 tabular-nums">{item.accuracy}%</td>
                            <td class="px-4 py-3 capitalize">
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    {item.mode}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-slate-400 tabular-nums text-xs">{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                            <td class="px-4 py-3 text-right">
                                <button on:click={() => item.id && deleteItem(item.id)} class="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else}
            <div class="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{dict.empty}</p>
            </div>
        {/if}
    </div>
</div>
