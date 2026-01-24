<script lang="ts">
  import { liveQuery } from 'dexie';
  import { logPrismDB } from '$lib/db/log-prism';
  import { X, Clock, Trash2, FileText } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  export let onClose: () => void;
  export let onLoad: (data: string, name: string) => void;

  const dispatch = createEventDispatcher();

  let history$ = liveQuery(() => logPrismDB.sessions.orderBy('createdAt').reverse().toArray());

  async function deleteSession(id: number) {
      if (confirm('Delete this session?')) {
          await logPrismDB.sessions.delete(id);
      }
  }

  function loadSession(session: any) {
      onLoad(session.data, session.name);
      onClose();
  }
</script>

<div class="fixed inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 shadow-2xl z-50 border-r border-slate-200 dark:border-slate-800 flex flex-col">
    <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
        <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Clock size={18} />
            Recent Activity
        </h3>
        <button on:click={onClose} class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X size={20} />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-2">
        {#if $history$}
            {#each $history$ as session (session.id)}
                <div class="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                    <button class="flex-1 text-left" on:click={() => loadSession(session)}>
                        <div class="flex items-center gap-2 mb-1">
                            <FileText size={14} class="text-indigo-500" />
                            <span class="font-medium text-sm text-slate-700 dark:text-slate-200 truncate w-48 block">{session.name}</span>
                        </div>
                        <div class="text-xs text-slate-400 pl-6">
                            {new Date(session.createdAt).toLocaleString()}
                        </div>
                    </button>

                    <button
                        class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                        on:click|stopPropagation={() => deleteSession(session.id)}
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            {/each}
            {#if $history$.length === 0}
                <div class="text-center py-8 text-slate-400 text-sm">
                    No history found.
                </div>
            {/if}
        {/if}
    </div>
</div>
