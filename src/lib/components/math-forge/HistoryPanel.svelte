<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db } from '$lib/db';
  import { browser } from '$app/environment';
  import { Trash2, Copy } from 'lucide-svelte';

  export let dict: any;
  export let onSelect: (expression: string) => void;

  let history = liveQuery(() => browser ? db.mathForgeHistory.orderBy('createdAt').reverse().limit(50).toArray() : []);

  async function clearHistory() {
      if (confirm('Clear all history?')) {
          await db.mathForgeHistory.clear();
      }
  }

  function copy(text: string) {
      navigator.clipboard.writeText(text);
  }
</script>

<div class="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
      <h3 class="font-bold text-slate-700 dark:text-slate-300">{dict.title}</h3>
      <button on:click={clearHistory} class="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors" title={dict.clear} aria-label={dict.clear}>
          <Trash2 size={16} />
      </button>
  </div>

  <div class="flex-1 overflow-y-auto p-2 space-y-2">
      {#if $history && $history.length > 0}
          {#each $history as item}
              <div class="group relative">
                  <button
                      type="button"
                      class="w-full min-h-[44px] text-left bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      on:click={() => onSelect(item.expression)}
                  >
                      <div class="text-xs text-slate-400 mb-1 flex justify-between">
                          <span>{item.type.toUpperCase()}</span>
                          <span class="opacity-0 group-hover:opacity-100 transition-opacity">
                              {new Date(item.createdAt).toLocaleTimeString()}
                          </span>
                      </div>
                      <div class="font-mono text-sm text-slate-700 dark:text-slate-200 truncate">{item.expression}</div>
                      <div class="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1 truncate">= {item.result}</div>
                  </button>

                  <button
                      class="absolute top-2 right-2 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      on:click|stopPropagation={() => copy(item.result)}
                      title="Copy Result"
                      aria-label="Copy Result"
                  >
                      <Copy size={14} />
                  </button>
              </div>
          {/each}
      {:else}
          <div class="text-center py-10 text-slate-400 text-sm">
              {dict.empty}
          </div>
      {/if}
  </div>
</div>
