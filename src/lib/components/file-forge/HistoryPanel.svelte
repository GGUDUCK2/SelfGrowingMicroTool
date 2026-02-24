<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { liveQuery } from 'dexie';
  import { db } from '$lib/db';
  import { browser } from '$app/environment';
  import { dictionaries } from '$lib/dictionaries';
  import { slide } from 'svelte/transition';
  import { Trash2, Clock, File, Copy, Check, Star } from 'lucide-svelte';

  export let dict: typeof dictionaries.en.tools.fileForge;

  const dispatch = createEventDispatcher();

  let history = liveQuery(async () => {
    if (browser) {
      return await db.fileForgeHistory.orderBy('createdAt').reverse().limit(20).toArray();
    }
    return [];
  });

  let copiedId: number | null = null;

  async function clearHistory() {
    if (confirm(dict?.history?.confirmClear || 'Clear all history?')) {
        await db.fileForgeHistory.clear();
    }
  }

  async function deleteItem(id: number) {
    await db.fileForgeHistory.delete(id);
  }

  async function toggleStar(id: number, currentStarred: number | undefined) {
    await db.fileForgeHistory.update(id, { starred: currentStarred ? 0 : 1 });
  }

  function copyHash(id: number, hash: string) {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    copiedId = id;
    setTimeout(() => copiedId = null, 2000);
  }

  function restore(item: any) {
    if (item.data) {
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
    {#if $history && $history.length > 0}
      <button on:click={clearHistory} class="text-xs text-red-500 hover:text-red-600 hover:underline">
        {dict.history.clear}
      </button>
    {/if}
  </div>

  {#if $history}
    {#if $history.length === 0}
      <div class="text-center py-8 text-slate-400 text-sm">
        {dict.history.empty}
      </div>
    {:else}
      <div class="space-y-2">
        {#each $history as item (item.id)}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            transition:slide
            class="group bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer hover:shadow-sm"
            on:click={() => restore(item)}
          >
            <div class="flex items-center gap-3 overflow-hidden flex-1">
              <!-- Star Button -->
              <button
                on:click|stopPropagation={() => item.id && toggleStar(item.id, item.starred)}
                class="shrink-0 focus:outline-none p-1 -ml-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label={item.starred ? 'Unstar' : 'Star'}
              >
                <Star size={16} class={item.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-400'} />
              </button>

              <div class="p-2 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 shrink-0">
                <File size={16} />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium truncate text-slate-800 dark:text-slate-200" title={item.name}>{item.name}</div>
                <div class="text-xs text-slate-400 flex gap-2 items-center">
                  <span>{(item.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  {#if item.hash}
                    <button
                      on:click|stopPropagation={() => item.id && copyHash(item.id, item.hash)}
                      class="ml-auto text-indigo-500 hover:text-indigo-600 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                      title="Copy SHA-256 Hash"
                    >
                      {#if copiedId === item.id}
                        <Check size={10} /> Copied
                      {:else}
                        <Copy size={10} /> Hash
                      {/if}
                    </button>
                  {/if}
                </div>
              </div>
            </div>
            <button
                on:click|stopPropagation={() => item.id && deleteItem(item.id)}
                class="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all shrink-0"
                aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
