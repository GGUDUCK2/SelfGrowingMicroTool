<script lang="ts">
  import type { SchemaProject } from '$lib/types/schema-forge';
  import { Plus, Table as TableIcon, Trash2, GripVertical } from '@lucide/svelte';
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  export let schema: SchemaProject;
  export let activeTableId: string | null = null;

  const dispatch = createEventDispatcher();

  function addTable() {
    dispatch('addTable');
  }

  function selectTable(id: string) {
    dispatch('select', id);
  }

  function deleteTable(id: string, e: Event) {
    e.stopPropagation();
    dispatch('delete', id);
  }

  function handleKeydown(e: KeyboardEvent, id: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectTable(id);
    }
  }
</script>

<div class="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 shrink-0">
    <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h3 class="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">Tables</h3>
        <button
            class="p-1.5 hover:bg-indigo-50 text-indigo-600 dark:hover:bg-indigo-900/30 dark:text-indigo-400 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            on:click={addTable}
            aria-label="Add Table"
        >
            <Plus size={18} />
        </button>
    </div>
    <div class="flex-1 overflow-y-auto p-2 space-y-1">
        {#each schema.tables as table (table.id)}
            <div
                class="w-full text-left px-3 py-2.5 rounded-lg flex justify-between items-center group transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] {activeTableId === table.id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}"
                on:click={() => selectTable(table.id)}
                on:keydown={(e) => handleKeydown(e, table.id)}
                role="button"
                tabindex="0"
                transition:slide|local
            >
                <div class="flex items-center space-x-2 overflow-hidden pointer-events-none">
                    <TableIcon size={16} class="shrink-0 opacity-70" />
                    <span class="truncate font-medium text-sm">{table.name}</span>
                </div>
                <button
                    class="opacity-0 group-hover:opacity-100 p-1 hover:bg-white dark:hover:bg-slate-700 hover:text-red-500 rounded transition-all z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    on:click={(e) => deleteTable(table.id, e)}
                    aria-label="Delete Table"
                    title="Delete Table"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        {/each}
        {#if schema.tables.length === 0}
            <div class="text-center py-10 px-4">
                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <TableIcon size={24} />
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">No tables yet</p>
                <p class="text-xs text-slate-400 mt-1">Click + to start modeling</p>
            </div>
        {/if}
    </div>
    <div class="p-3 border-t border-slate-200 dark:border-slate-800 text-xs text-center text-slate-400">
        {schema.tables.length} tables
    </div>
</div>
