<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type CipherHistory } from '$lib/db';
  import { createEventDispatcher } from 'svelte';
  import { Trash2, Copy } from 'lucide-svelte';

  export let dict: any;

  let history = liveQuery(() => db.cipherHistory.orderBy('createdAt').reverse().limit(50).toArray());

  const dispatch = createEventDispatcher();

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    dispatch('copy');
  }

  function deleteItem(id: number) {
    db.cipherHistory.delete(id);
  }

  function clearAll() {
    db.cipherHistory.clear();
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }).format(date);
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-medium text-slate-900 dark:text-white">{dict.history}</h3>
    <button on:click={clearAll} class="text-xs text-red-500 hover:text-red-600 font-medium">
      {dict.clear}
    </button>
  </div>

  {#if $history && $history.length > 0}
    <div class="space-y-3">
      {#each $history as item (item.id)}
        <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3 shadow-sm hover:shadow-md transition-shadow relative group">
          <div class="flex justify-between items-start mb-1">
            <div class="flex items-center space-x-2">
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                {item.type === 'hash' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' :
                 item.type === 'jwt' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                 item.type === 'password' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}">
                {item.type}
              </span>
              {#if item.details}
                <span class="text-xs text-slate-500 dark:text-slate-400">{item.details}</span>
              {/if}
            </div>
            <span class="text-[10px] text-slate-400">{formatDate(item.createdAt)}</span>
          </div>

          <div class="font-mono text-sm text-slate-800 dark:text-slate-200 break-all line-clamp-2">
            {item.content}
          </div>

          <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white dark:bg-slate-800 rounded shadow-sm">
             <button on:click={() => item.id && copy(item.content)} class="p-1.5 text-slate-400 hover:text-indigo-600" title={dict.copy}>
               <Copy size={14} />
             </button>
             <button on:click={() => item.id && deleteItem(item.id)} class="p-1.5 text-slate-400 hover:text-red-600" title={dict.delete}>
               <Trash2 size={14} />
             </button>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center py-8 text-slate-500 dark:text-slate-400 text-sm italic">
      {dict.emptyHistory}
    </div>
  {/if}
</div>
