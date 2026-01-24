<script lang="ts">
  import { liveQuery } from 'dexie';
  import { logPrismDB } from '$lib/db/log-prism';
  import type { LogSession } from '$lib/utils/log-prism/types';
  import { X, Clock, Trash2, FileText, Star } from 'lucide-svelte';
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

  async function toggleStar(session: LogSession) {
      if (session.id) {
        await logPrismDB.sessions.update(session.id, { starred: session.starred ? 0 : 1 });
      }
  }

  function loadSession(session: LogSession) {
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
                <div class="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative border {session.starred ? 'border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10' : 'border-transparent'}">
                    <button class="flex-1 text-left" on:click={() => loadSession(session)}>
                        <div class="flex items-center gap-2 mb-1">
                            <FileText size={14} class="text-indigo-500" />
                            <span class="font-medium text-sm text-slate-700 dark:text-slate-200 truncate w-40 block">{session.name}</span>
                        </div>
                        <div class="flex flex-col gap-0.5 pl-6">
                            <div class="text-[10px] text-slate-400">
                                {new Date(session.createdAt).toLocaleDateString()} {new Date(session.createdAt).toLocaleTimeString()}
                            </div>
                            {#if session.stats}
                                <div class="flex gap-2 text-[10px]">
                                    <span class={session.stats.errorCount > 0 ? 'text-red-500 font-bold' : 'text-slate-500'}>
                                        {session.stats.errorCount || 0} Err
                                    </span>
                                    <span class={session.stats.warnCount > 0 ? 'text-amber-500 font-bold' : 'text-slate-500'}>
                                        {session.stats.warnCount || 0} Warn
                                    </span>
                                </div>
                            {/if}
                        </div>
                    </button>

                    <div class="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 rounded p-1 shadow-sm">
                        <button
                            class="p-1 hover:text-amber-500 {session.starred ? 'text-amber-500' : 'text-slate-400'}"
                            on:click|stopPropagation={() => toggleStar(session)}
                            title="Star"
                        >
                            <Star size={14} fill={session.starred ? "currentColor" : "none"} />
                        </button>
                        <button
                            class="p-1 text-slate-400 hover:text-red-500"
                            on:click|stopPropagation={() => deleteSession(session.id)}
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>

                    {#if session.starred}
                        <div class="absolute top-3 right-3 group-hover:hidden text-amber-500">
                             <Star size={14} fill="currentColor" />
                        </div>
                    {/if}
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
