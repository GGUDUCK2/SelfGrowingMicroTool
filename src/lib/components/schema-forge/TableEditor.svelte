<script lang="ts">
  import type { Table, Column } from '$lib/types/schema-forge';
  import { DATA_TYPES } from '$lib/types/schema-forge';
  import { inferColumnDetails } from '$lib/utils/schema-forge/smart-inference';
  import { Plus, Trash2, Key, Check, Info, Sparkles } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import { nanoid } from 'nanoid';
  import { slide } from 'svelte/transition';

  export let table: Table;

  const dispatch = createEventDispatcher();

  function addColumn() {
      const newCol: Column = {
          id: nanoid(),
          name: '',
          type: 'varchar',
          length: 255,
          isPk: false,
          isNullable: true,
          isUnique: false,
          isAutoIncrement: false
      };

      // If first column, make it ID often? Nah, strict behavior.
      if (table.columns.length === 0) {
          newCol.name = 'id';
          newCol.type = 'int';
          newCol.isPk = true;
          newCol.isAutoIncrement = true;
          newCol.isNullable = false;
          delete newCol.length;
      }

      table.columns = [...table.columns, newCol];
      dispatch('change');
  }

  function deleteColumn(id: string) {
      table.columns = table.columns.filter(c => c.id !== id);
      dispatch('change');
  }

  function handleNameChange() {
      dispatch('change');
  }

  function handleColumnNameInput(col: Column) {
      const inferred = inferColumnDetails(col.name);
      if (inferred) {
          // Only apply inference if the user hasn't explicitly set conflicting types
          // For now, we just auto-apply for better UX, effectively "Smart Mode"
          Object.assign(col, inferred);
      }
      dispatch('change');
  }
</script>

<div class="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
    <!-- Header -->
    <div class="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
        <div class="flex flex-col gap-4">
             <div>
                <label for="table-name" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Table Name</label>
                <input
                    id="table-name"
                    type="text"
                    bind:value={table.name}
                    on:input={handleNameChange}
                    class="w-full text-2xl font-bold bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-0 px-0 py-1 transition-colors dark:text-white"
                    placeholder="table_name"
                />
             </div>
             <div>
                <label for="table-comment" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description (Optional)</label>
                <input
                    id="table-comment"
                    type="text"
                    bind:value={table.comment}
                    on:input={handleNameChange}
                    class="w-full text-sm text-slate-600 dark:text-slate-400 bg-transparent border-0 border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-0 px-0 py-1 transition-colors"
                    placeholder="Describe this table..."
                />
             </div>
        </div>
    </div>

    <!-- Columns -->
    <div class="flex-1 overflow-y-auto p-6">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div class="grid grid-cols-[32px_1fr_1fr_80px_auto] gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider items-center">
                <span class="text-center">PK</span>
                <span>Name</span>
                <span>Type</span>
                <span>Flags</span>
                <span></span>
            </div>

            <div class="divide-y divide-slate-100 dark:divide-slate-800">
                {#each table.columns as col (col.id)}
                    <div class="grid grid-cols-[32px_1fr_1fr_80px_auto] gap-4 p-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group" transition:slide|local>
                         <!-- PK Toggle -->
                         <button
                            class="flex items-center justify-center min-w-[44px] min-h-[44px] rounded {col.isPk ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-300 hover:text-slate-500'}"
                            on:click={() => { col.isPk = !col.isPk; if(col.isPk) col.isNullable = false; dispatch('change'); }}
                            title="Primary Key"
                         >
                            <Key size={14} fill={col.isPk ? 'currentColor' : 'none'} />
                         </button>

                         <!-- Name -->
                         <div class="relative">
                            <input
                                type="text"
                                bind:value={col.name}
                                on:input={() => handleColumnNameInput(col)}
                                class="w-full bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 rounded px-2 py-1 text-sm font-mono text-slate-900 dark:text-slate-200 transition-colors outline-none min-h-[44px]"
                                placeholder="column_name"
                            />
                            {#if col.name && !col.name.includes('_') && !col.name.includes('id')}
                                <!-- Maybe show a small icon if inferred? -->
                            {/if}
                         </div>

                         <!-- Type & Options -->
                         <div class="flex gap-2">
                             <select
                                 bind:value={col.type}
                                 on:change={() => dispatch('change')}
                                 class="w-full bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 rounded px-2 py-1 text-sm text-slate-700 dark:text-slate-300 transition-colors outline-none cursor-pointer min-h-[44px]"
                             >
                                {#each DATA_TYPES as t}
                                    <option value={t}>{t}</option>
                                {/each}
                             </select>
                             {#if ['varchar'].includes(col.type)}
                                <input
                                    type="number"
                                    bind:value={col.length}
                                    on:input={() => dispatch('change')}
                                    class="w-16 bg-transparent border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-center text-slate-500 min-h-[44px]"
                                    placeholder="Length"
                                    title="Length"
                                />
                             {/if}
                         </div>

                         <!-- Flags -->
                         <div class="flex items-center gap-1">
                             <button
                                 class="p-1 rounded text-xs font-bold min-w-[44px] min-h-[44px] flex items-center justify-center {col.isNullable ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}"
                                 on:click={() => { col.isNullable = !col.isNullable; if(col.isPk) col.isNullable = false; dispatch('change'); }}
                                 title="Nullable (N)"
                             >
                                 N
                             </button>
                             <button
                                 class="p-1 rounded text-xs font-bold min-w-[44px] min-h-[44px] flex items-center justify-center {col.isUnique ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}"
                                 on:click={() => { col.isUnique = !col.isUnique; dispatch('change'); }}
                                 title="Unique (U)"
                             >
                                 U
                             </button>
                             {#if ['int', 'bigint'].includes(col.type)}
                                 <button
                                     class="p-1 rounded text-xs font-bold min-w-[44px] min-h-[44px] flex items-center justify-center {col.isAutoIncrement ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}"
                                     on:click={() => { col.isAutoIncrement = !col.isAutoIncrement; if(col.isAutoIncrement) col.isPk = true; dispatch('change'); }}
                                     title="Auto Increment (AI)"
                                 >
                                     AI
                                 </button>
                             {/if}
                         </div>

                         <!-- Actions -->
                         <button
                             class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                             on:click={() => deleteColumn(col.id)}
                         >
                             <Trash2 size={16} />
                         </button>
                    </div>
                {/each}
            </div>

            <button
                class="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-t border-slate-200 dark:border-slate-800 min-h-[44px]"
                on:click={addColumn}
            >
                <Plus size={16} />
                <span>Add Column</span>
            </button>
        </div>
    </div>
</div>
