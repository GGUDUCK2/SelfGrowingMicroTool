<script lang="ts">
  import { db, type DockerForgeHistory } from '$lib/db';
  import { dictionaries } from '$lib/dictionaries';
  import { Trash2, RotateCcw, Clock, Star } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import { browser } from '$app/environment';

  export let lang: string;
  export let onRestore: (item: DockerForgeHistory) => void;

  $: dict = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
  $: d = dict.tools.dockerForge;

  let historyItems: Promise<DockerForgeHistory[]> = browser ? getHistory() : Promise.resolve([]);

  function getHistory() {
    return db.dockerForgeHistory.orderBy('createdAt').reverse().limit(50).toArray();
  }

  export function refreshHistory() {
      if (browser) historyItems = getHistory();
  }

  async function deleteItem(id: number | undefined) {
    if (id) {
      await db.dockerForgeHistory.delete(id);
      historyItems = getHistory();
    }
  }

  async function toggleStar(item: DockerForgeHistory) {
    if (item.id) {
      await db.dockerForgeHistory.update(item.id, { starred: item.starred ? 0 : 1 });
      historyItems = getHistory();
    }
  }

  async function clearHistory() {
    if (confirm(d.clear + '?')) {
      await db.dockerForgeHistory.filter(item => !item.starred).delete();
      historyItems = getHistory();
    }
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
    <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
      <Clock size={18} />
      {d.history}
    </div>
    <button
      class="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
      on:click={clearHistory}
    >
      {d.clear}
    </button>
  </div>

  <div class="flex-1 overflow-y-auto p-2 space-y-2 max-h-[600px]">
    {#await historyItems}
      <div class="p-4 text-center text-slate-500 dark:text-slate-400">Loading...</div>
    {:then items}
      {#if items.length === 0}
        <div class="p-8 text-center text-slate-500 dark:text-slate-400">
          No history yet.
        </div>
      {:else}
        {#each items as item (item.id)}
          <div transition:fade class="group relative bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <div class="flex justify-between items-start gap-2 mb-2">
              <div class="font-mono text-sm text-slate-900 dark:text-white truncate" title={item.baseImage}>
                {item.baseImage}
              </div>
              <div class="flex items-center gap-1">
                <button
                  class="text-slate-400 hover:text-yellow-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-1"
                  on:click={() => toggleStar(item)}
                  aria-label="Toggle Star"
                >
                  <Star size={16} class={item.starred ? 'fill-yellow-500 text-yellow-500' : ''} />
                </button>
                <button
                  class="text-slate-400 hover:text-blue-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-1"
                  on:click={() => onRestore(item)}
                  title={d.restore}
                  aria-label={d.restore}
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  class="text-slate-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-1"
                  on:click={() => deleteItem(item.id)}
                  title={d.delete}
                  aria-label={d.delete}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 truncate">
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
        {/each}
      {/if}
    {/await}
  </div>
</div>
