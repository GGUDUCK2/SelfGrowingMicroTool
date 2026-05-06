<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type MockForgeSchema } from '$lib/db';
  import { Trash2, FolderOpen, Star, Clock } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import { browser } from '$app/environment';

  export let onLoad: (schema: MockForgeSchema) => void;
  export let dictionary: Record<string, any>;

  let history;

  if (browser) {
    history = liveQuery(() => db.mockForgeSchemas.orderBy('createdAt').reverse().limit(20).toArray());
  } else {
    history = { subscribe: (cb: any) => { cb([]); return () => {}; } };
  }

  async function deleteItem(id?: number) {
    if (id) await db.mockForgeSchemas.delete(id);
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="font-bold text-sm text-slate-700 dark:text-slate-200">History</h3>
    <span class="text-xs text-slate-400">Recent 20</span>
  </div>

  <div class="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
    {#if $history}
      {#if $history.length === 0}
        <div class="text-center py-8 text-slate-400 text-sm italic">
          {dictionary.actions.save} to see history here.
        </div>
      {:else}
        {#each $history as item (item.id)}
          <div
            transition:slide|local
            class="group flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer"
            on:click={() => onLoad(item)}
            role="button"
            tabindex="0"
            on:keydown={(e) => e.key === 'Enter' && onLoad(item)}
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-medium text-sm truncate text-slate-700 dark:text-slate-200">{item.name || 'Untitled Schema'}</span>
                <span class="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">{item.fields.length} fields</span>
              </div>
              <div class="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock size={10} />
                {formatDate(item.createdAt)}
              </div>
            </div>

            <button
              on:click|stopPropagation={() => deleteItem(item.id)}
              class="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        {/each}
      {/if}
    {/if}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #475569;
  }
</style>
