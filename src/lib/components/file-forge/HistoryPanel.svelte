<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { db } from '$lib/db';
  import { browser } from '$app/environment';
  import { liveQuery } from 'dexie';
  import { Clock, ArchiveRestore, Star, Trash2, Check, Copy, FileText } from '@lucide/svelte';
  import { slide } from 'svelte/transition';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dict: Record<string, any>;

  const dispatch = createEventDispatcher();

  // Reactive query
  let history = liveQuery(async () => {
    if (!browser) return [];
    return await db.fileForgeHistory
      .orderBy('createdAt')
      .reverse()
      .limit(20)
      .toArray();
  });

  async function deleteItem(id: number) {
    if (!browser) return;
    try {
      await db.fileForgeHistory.delete(id);
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleStar(item: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!browser || !item.id) return;
    try {
      await db.fileForgeHistory.update(item.id, { starred: item.starred ? 0 : 1 });
    } catch (e) {
      console.error(e);
    }
  }

  let copiedId: number | null = null;
  function copyHash(hash: string, id: number) {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    copiedId = id;
    setTimeout(() => copiedId = null, 2000);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function restore(item: any) {
    if (item.blob && item.blob instanceof Blob) {
        // Reconstruct File object
        const file = new File([item.blob], item.name, { type: item.type, lastModified: item.createdAt.getTime() });
        dispatch('restoreFile', file);
    } else if (item.data) {
        try {
            const data = JSON.parse(item.data);
            dispatch('restore', data);
        } catch (e) {
            console.error('Failed to parse history data', e);
        }
    }
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
      <Clock size={16} />
      {dict.history.title}
    </h3>
    <button
      on:click={() => { if(confirm(dict.history.confirmClear)) db.fileForgeHistory.clear(); }}
      class="text-xs text-red-500 hover:text-red-600 hover:underline"
    >
      {dict.history.clear}
    </button>
  </div>

  {#if $history}
    {#if $history.length === 0}
      <div class="text-center py-8 text-slate-400 text-sm italic">
        {dict.history.empty}
      </div>
    {:else}
      <div class="space-y-3">
        {#each $history as item (item.id)}
          <div transition:slide|local class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={item.name}>
                  {item.name}
                </h4>
                <p class="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>{(item.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </p>
              </div>
              <div class="flex items-center gap-1">
                <button
                  on:click={() => toggleStar(item)}
                  class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 {item.starred ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'} transition-colors"
                  title="Star"
                >
                  <Star size={14} fill={item.starred ? "currentColor" : "none"} />
                </button>
                <button
                  on:click={() => deleteItem(item.id!)}
                  class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
                  title={dict.history.delete || 'Delete'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {#if item.hash}
              <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded text-[10px] font-mono text-slate-600 dark:text-slate-400 mb-2 group/hash">
                <span class="truncate flex-1">{item.hash.substring(0, 16)}...</span>
                <button
                  on:click={() => copyHash(item.hash, item.id!)}
                  class="opacity-0 group-hover/hash:opacity-100 transition-opacity p-0.5 hover:text-indigo-500"
                >
                  {#if copiedId === item.id}
                    <Check size={12} class="text-green-500" />
                  {:else}
                    <Copy size={12} />
                  {/if}
                </button>
              </div>
            {/if}

            <button
              on:click={() => restore(item)}
              class="w-full py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded flex items-center justify-center gap-2 transition-colors"
            >
              {#if item.blob}
                  <FileText size={12} />
                  {dict.history.restoreFull || 'Full Restore'}
              {:else}
                  <ArchiveRestore size={12} />
                  {dict.history.restore || 'Restore Analysis'}
              {/if}
            </button>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
