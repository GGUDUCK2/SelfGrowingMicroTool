<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db } from '$lib/db';
  import { resumeStore } from '$lib/utils/resume-forge/store';
  import { Trash2, FolderOpen, Clock } from 'lucide-svelte';
  import { formatDistanceToNow } from 'date-fns';

  export let dict: any;

  let history$ = liveQuery(() => db.resumeForgeHistory.orderBy('updatedAt').reverse().toArray());

  function load(item: any) {
    // Confirm if dirty? For now just load.
    if (confirm(dict.actions.load + '?')) {
        resumeStore.load(item.data);
    }
  }

  async function remove(id: number) {
    if (confirm('Delete this resume?')) {
        await db.resumeForgeHistory.delete(id);
    }
  }
</script>

<div class="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-80">
    <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
        <Clock size={18} />
        {dict.history.title}
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-3">
        {#if $history$}
            {#each $history$ as item (item.id)}
                <button
                    class="w-full text-left group bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer relative"
                    on:click={() => load(item)}
                >
                    <div class="font-medium text-slate-900 dark:text-white pr-6 truncate">{item.name}</div>
                    <div class="text-xs text-slate-500 mt-1 flex justify-between">
                        <span>{item.data.meta.template}</span>
                        <span>{formatDistanceToNow(item.updatedAt, { addSuffix: true })}</span>
                    </div>

                    <div class="min-h-[44px] min-w-[44px] flex items-center justify-center absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1" role="button" tabindex="0" on:click|stopPropagation={() => remove(item.id!)} on:keydown|stopPropagation={(e) => e.key === 'Enter' && remove(item.id!)}>
                        <Trash2 size={14} />
                    </div>
                </button>
            {/each}
            {#if $history$.length === 0}
                <div class="text-center text-slate-500 text-sm py-8">
                    {dict.history.empty}
                </div>
            {/if}
        {/if}
    </div>
</div>
