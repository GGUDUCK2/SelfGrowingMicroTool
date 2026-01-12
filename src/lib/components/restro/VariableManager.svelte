<script lang="ts">
  import { db, type RestroVariable } from '$lib/db/restro';
  import { liveQuery } from 'dexie';
  import { Plus, Trash2, Save, X } from 'lucide-svelte';
  import { onMount } from 'svelte';

  export let onClose: () => void;

  let variables$ = liveQuery(() => db.variables.toArray());
  let newKey = '';
  let newValue = '';

  async function addVariable() {
    if (!newKey) return;
    await db.variables.add({
        key: newKey,
        value: newValue,
        enabled: true
    });
    newKey = '';
    newValue = '';
  }

  async function deleteVariable(id: number) {
      await db.variables.delete(id);
  }

  async function toggleVariable(v: RestroVariable) {
      if (v.id) await db.variables.update(v.id, { enabled: !v.enabled });
  }

  function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
          onClose();
      }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[80vh]">
        <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 class="font-bold text-lg text-slate-800 dark:text-white">Environment Variables</h3>
            <button on:click={onClose} class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X class="w-5 h-5" />
            </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-2">
            <div class="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Define global variables to use in URL, Headers, or Body as <code>{`{{key}}`}</code>.
            </div>

            <div class="flex gap-2 mb-4">
                <input
                    type="text"
                    bind:value={newKey}
                    placeholder="Key (e.g. API_KEY)"
                    class="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
                <input
                    type="text"
                    bind:value={newValue}
                    placeholder="Value"
                    class="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
                <button
                    on:click={addVariable}
                    disabled={!newKey}
                    class="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg disabled:opacity-50"
                    aria-label="Add Variable"
                >
                    <Plus class="w-5 h-5" />
                </button>
            </div>

            {#if $variables$}
                {#each $variables$ as v (v.id)}
                    <div class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <input
                            type="checkbox"
                            checked={v.enabled}
                            on:change={() => toggleVariable(v)}
                            class="rounded text-indigo-600 focus:ring-indigo-500"
                            aria-label={`Toggle variable ${v.key}`}
                        />
                        <div class="flex-1 min-w-0 grid grid-cols-2 gap-2">
                            <div class="font-mono text-xs font-bold truncate text-indigo-600 dark:text-indigo-400" title={v.key}>{v.key}</div>
                            <div class="font-mono text-xs truncate text-slate-600 dark:text-slate-400" title={v.value}>{v.value}</div>
                        </div>
                         <button
                            on:click={() => deleteVariable(v.id!)}
                            class="text-slate-400 hover:text-red-500 p-1"
                            aria-label={`Delete variable ${v.key}`}
                        >
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>
                {/each}
                {#if $variables$.length === 0}
                    <div class="text-center text-slate-400 text-sm py-4">No variables defined.</div>
                {/if}
            {/if}
        </div>
    </div>
</div>
