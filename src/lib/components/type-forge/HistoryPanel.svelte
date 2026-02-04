<script lang="ts">
  import { db, type TypeForgeHistory } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { Clock, Star, Trash2, RotateCcw } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  export let dict: any;
  const dispatch = createEventDispatcher();

  let history = liveQuery(() => db.typeForgeHistory.orderBy('createdAt').reverse().limit(20).toArray());

  function formatDate(date: Date) {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }

  async function deleteItem(id?: number) {
      if (id) await db.typeForgeHistory.delete(id);
  }

  function restore(item: TypeForgeHistory) {
      dispatch('restore', item);
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
      <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock size={16} /> {dict.history.title}
      </h3>
  </div>

  <div class="max-h-[400px] overflow-y-auto p-2 space-y-1">
      {#if $history && $history.length > 0}
          {#each $history as item (item.id)}
              <div class="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-600 transition-all">
                  <div class="flex-1 min-w-0 mr-2">
                      <div class="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{item.fontName}</div>
                      <div class="text-xs text-slate-500 dark:text-slate-400 truncate">{formatDate(item.createdAt)}</div>
                  </div>
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                          on:click={() => restore(item)}
                          class="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                          title={dict.history.restore}
                          aria-label={dict.history.restore}
                      >
                          <RotateCcw size={14} />
                      </button>
                      <button
                          on:click={() => deleteItem(item.id)}
                          class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          title={dict.history.delete}
                          aria-label={dict.history.delete}
                      >
                          <Trash2 size={14} />
                      </button>
                  </div>
              </div>
          {/each}
      {:else}
          <div class="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              {dict.history.empty}
          </div>
      {/if}
  </div>
</div>
