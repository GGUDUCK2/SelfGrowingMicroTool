<script lang="ts">
  import { matrixStore } from '$lib/utils/decision-forge/store';
  import WeightSlider from './WeightSlider.svelte';
  import { fly, fade } from 'svelte/transition';
  import { Trash2, Plus } from 'lucide-svelte';

  let draggedItem: string | null = null;
  // Drag and drop is complex to implement perfectly in one go without a lib,
  // so I will stick to simple rendering first, maybe add dnd later if time permits.
  // For now, focusing on the grid logic.
</script>

<div class="overflow-x-auto pb-4">
  <table class="min-w-full border-collapse">
    <thead>
      <tr>
        <th class="p-4 text-left min-w-[140px] sm:min-w-[200px] w-1/4 sticky left-0 bg-gray-50 dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700">
          <span class="text-xs font-semibold uppercase text-gray-400 tracking-wider">Options / Criteria</span>
        </th>
        {#each $matrixStore.criteria as criterion (criterion.id)}
          <th class="p-4 min-w-[120px] sm:min-w-[180px] border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 relative group" transition:fade>
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <input
                  type="text"
                  value={criterion.name}
                  on:input={(e) => matrixStore.updateCriterion(criterion.id, { name: e.currentTarget.value })}
                  class="bg-transparent font-semibold text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 w-full"
                />
                <button
                  class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  on:click={() => matrixStore.removeCriterion(criterion.id)}
                  aria-label="Remove criterion"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <WeightSlider
                id={criterion.id}
                value={criterion.weight}
                onChange={(val) => matrixStore.updateCriterion(criterion.id, { weight: val })}
              />
            </div>
          </th>
        {/each}
        <th class="p-4 w-[50px] border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 align-middle">
          <button
            class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
            on:click={matrixStore.addCriterion}
            title="Add Criterion"
          >
            <Plus size={16} />
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each $matrixStore.options as option (option.id)}
        <tr class="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" transition:fade>
          <td class="p-4 sticky left-0 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 z-10 border-b border-gray-100 dark:border-gray-800">
            <div class="flex items-center gap-2">
              <input
                type="text"
                value={option.name}
                on:input={(e) => matrixStore.updateOptionName(option.id, e.currentTarget.value)}
                class="bg-transparent font-medium text-gray-800 dark:text-gray-200 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1"
                placeholder="Option Name"
              />
            </div>
          </td>
          {#each $matrixStore.criteria as criterion (criterion.id)}
            <td class="p-4 text-center border-b border-gray-100 dark:border-gray-800">
              <div class="relative flex items-center justify-center">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={option.scores[criterion.id] || 0}
                  on:input={(e) => matrixStore.updateScore(option.id, criterion.id, Number(e.currentTarget.value))}
                  class="w-16 text-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </td>
          {/each}
          <td class="p-4 text-center border-b border-gray-100 dark:border-gray-800">
            <button
              class="text-gray-300 hover:text-red-500 transition-colors"
              on:click={() => matrixStore.removeOption(option.id)}
              aria-label="Remove option"
            >
              <Trash2 size={16} />
            </button>
          </td>
        </tr>
      {/each}
      <tr>
        <td class="p-4 sticky left-0 bg-white dark:bg-gray-900 z-10">
          <button
            class="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 py-2 px-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            on:click={matrixStore.addOption}
          >
            <Plus size={16} />
            <span>Add Option</span>
          </button>
        </td>
        <td colspan={$matrixStore.criteria.length + 1}></td>
      </tr>
    </tbody>
  </table>
</div>
