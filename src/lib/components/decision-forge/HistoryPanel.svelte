<script lang="ts">
  import { db, type DecisionForgeMatrix } from '$lib/db';
  import { matrixStore } from '$lib/utils/decision-forge/store';
  import { liveQuery } from 'dexie';
  import { formatDistanceToNow } from 'date-fns';
  import { Trash2, Star, Save, FolderOpen } from '@lucide/svelte';
  import { fade, slide } from 'svelte/transition';

  let savedMatrices = liveQuery(() => db.decisionForgeMatrices.orderBy('createdAt').reverse().toArray());

  async function saveCurrent() {
    const state = $matrixStore;
    const existingId = state.id;

    // Check if we are updating an existing one or creating new
    if (existingId) {
       await db.decisionForgeMatrices.update(existingId, {
         name: state.name,
         criteria: state.criteria,
         options: state.options,
         createdAt: new Date() // Update timestamp to bring to top
       });
    } else {
       const id = await db.decisionForgeMatrices.add({
         name: state.name,
         criteria: state.criteria,
         options: state.options,
         createdAt: new Date(),
         starred: 0
       });
       matrixStore.update(s => ({ ...s, id: Number(id) }));
    }
  }

  async function loadMatrix(matrix: DecisionForgeMatrix) {
    if (confirm('Load this decision? Unsaved changes will be lost.')) {
      matrixStore.load({
        id: matrix.id,
        name: matrix.name,
        criteria: matrix.criteria,
        options: matrix.options,
        createdAt: matrix.createdAt
      });
    }
  }

  async function deleteMatrix(id: number) {
    if (confirm('Are you sure you want to delete this decision?')) {
      await db.decisionForgeMatrices.delete(id);
    }
  }

  async function toggleStar(matrix: DecisionForgeMatrix) {
    if (matrix.id) {
      await db.decisionForgeMatrices.update(matrix.id, { starred: matrix.starred ? 0 : 1 });
    }
  }

  function createNew() {
    if (confirm('Create new decision? Unsaved changes will be lost.')) {
      matrixStore.reset();
    }
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
      <FolderOpen class="w-5 h-5 text-indigo-500" />
      Library
    </h3>
    <button
      on:click={createNew}
      class="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
    >
      New Project
    </button>
  </div>

  <div class="mb-4">
    <button
      on:click={saveCurrent}
      class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors font-medium shadow-sm hover:shadow"
    >
      <Save size={18} />
      <span>Save Current</span>
    </button>
  </div>

  <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
    {#if $savedMatrices}
      {#each $savedMatrices as matrix (matrix.id)}
        <div
          class="group p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer relative"
          on:click={() => loadMatrix(matrix)}
          on:keydown={(e) => e.key === 'Enter' && loadMatrix(matrix)}
          tabindex="0"
          role="button"
        >
          <div class="flex justify-between items-start mb-1">
            <h4 class="font-semibold text-gray-700 dark:text-gray-200 text-sm truncate pr-6">{matrix.name}</h4>
            <button
              class="absolute top-3 right-3 text-gray-400 hover:text-yellow-400 transition-colors {matrix.starred ? 'text-yellow-400' : ''}"
              on:click|stopPropagation={() => toggleStar(matrix)}
            >
              <Star size={14} fill={matrix.starred ? "currentColor" : "none"} />
            </button>
          </div>
          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatDistanceToNow(matrix.createdAt)} ago</span>
            <button
              class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
              on:click|stopPropagation={() => matrix.id && deleteMatrix(matrix.id)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      {/each}
      {#if $savedMatrices.length === 0}
        <div class="text-center py-8 text-gray-400 text-sm">
          No saved decisions yet.
        </div>
      {/if}
    {:else}
      <div class="text-center py-8 text-gray-400">Loading...</div>
    {/if}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 4px;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #475569;
  }
</style>
