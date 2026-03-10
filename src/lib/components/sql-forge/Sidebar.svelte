<script lang="ts">
  import { slide } from 'svelte/transition';
  import { Database, History, ChevronRight, ChevronDown, Trash2, Star, Play } from 'lucide-svelte';
  import type { TableInfo } from '$lib/utils/sql-forge/engine';
  import type { SqlForgeHistory } from '$lib/db';
  import { db } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { createEventDispatcher, onMount } from 'svelte';

  export let tables: TableInfo[] = [];
  export let t: any;

  const dispatch = createEventDispatcher();
  let activeTab: 'tables' | 'history' = 'tables';
  let history: SqlForgeHistory[] = [];

  let expandedTables: Record<string, boolean> = {};

  onMount(() => {
     liveQuery(() => db.sqlForgeHistory.orderBy('timestamp').reverse().limit(50).toArray()).subscribe(data => {
         history = data;
     });
  });

  function toggleTable(name: string) {
      expandedTables[name] = !expandedTables[name];
  }

  function runHistory(item: SqlForgeHistory) {
      dispatch('run', item.query);
  }

  async function deleteHistory(id: number) {
      if (id) await db.sqlForgeHistory.delete(id);
  }

  async function toggleStar(item: SqlForgeHistory) {
      if (item.id) await db.sqlForgeHistory.update(item.id, { starred: item.starred ? 0 : 1 });
  }

  function formatTime(date: Date) {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-full md:w-64">
    <!-- Tabs -->
    <div class="flex border-b border-gray-200 dark:border-gray-700">
        <button
            class="flex-1 min-h-[44px] py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors {activeTab === 'tables' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
            on:click={() => activeTab = 'tables'}
        >
            <Database size={16} />
            {t.schema}
        </button>
        <button
            class="flex-1 min-h-[44px] py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors {activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
            on:click={() => activeTab = 'history'}
        >
            <History size={16} />
            {t.history}
        </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {#if activeTab === 'tables'}
            {#if tables.length === 0}
                <div class="text-center text-gray-400 py-8 text-sm">
                    {t.noTables}
                </div>
            {:else}
                <div class="space-y-2">
                    {#each tables as table}
                        <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button class="w-full min-h-[44px] flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left" on:click={() => toggleTable(table.name)}>
                                <span class="font-bold text-sm text-gray-700 dark:text-gray-200 truncate pr-2" title={table.name}>{table.name}</span>
                                <div class="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                                    <span>{table.rowCount}</span>
                                    {#if expandedTables[table.name]}
                                        <ChevronDown size={14} />
                                    {:else}
                                        <ChevronRight size={14} />
                                    {/if}
                                </div>
                            </button>
                            {#if expandedTables[table.name]}
                                <div transition:slide class="bg-white dark:bg-gray-800 p-2 space-y-1">
                                    {#each table.columns as col}
                                        <div class="text-xs text-gray-600 dark:text-gray-400 px-2 py-1 flex items-center gap-2 truncate" title={col}>
                                            <div class="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>
                                            {col}
                                        </div>
                                    {/each}
                                    <div class="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                                        <button
                                            class="w-full min-h-[44px] py-1 text-xs text-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                                            on:click={() => dispatch('run', `SELECT * FROM ${table.name} LIMIT 10`)}
                                        >
                                            SELECT * LIMIT 10
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        {:else}
            <!-- History -->
            <div class="space-y-3">
                {#each history as item}
                    <div class="group relative bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
                        <div class="flex justify-between items-start mb-2">
                             <span class="text-[10px] text-gray-400 font-mono">{formatTime(item.timestamp)}</span>
                             <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-yellow-500 text-gray-400" on:click={() => toggleStar(item)} aria-label="Star">
                                    <Star size={12} fill={item.starred ? "currentColor" : "none"} class={item.starred ? "text-yellow-500" : ""} />
                                </button>
                                <button class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-red-500 text-gray-400" on:click={() => deleteHistory(item.id!)} aria-label="Delete">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                        <div class="text-xs font-mono text-gray-700 dark:text-gray-300 line-clamp-3 mb-2 bg-gray-50 dark:bg-gray-800 p-1.5 rounded border border-gray-100 dark:border-gray-700/50 break-all">
                            {item.query}
                        </div>
                        <div class="flex justify-between items-center">
                            <span class={`text-[10px] px-1.5 py-0.5 rounded ${item.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                {item.status === 'success' ? 'OK' : 'ERR'}
                            </span>
                             <button
                                class="text-xs min-h-[44px] flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                                on:click={() => runHistory(item)}
                             >
                                <Play size={10} />
                                {t.run}
                             </button>
                        </div>
                    </div>
                {/each}
                {#if history.length === 0}
                    <div class="text-center text-gray-400 py-8 text-sm">
                        No history yet.
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.5);
        border-radius: 20px;
    }
</style>
