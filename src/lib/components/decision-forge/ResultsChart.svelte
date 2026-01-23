<script lang="ts">
  import { weightedScores } from '$lib/utils/decision-forge/store';
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
  <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
    Results Ranking
  </h3>

  <div class="space-y-6">
    {#each $weightedScores as option (option.id)}
      <div animate:flip={{duration: 400}} transition:fade class="relative">
        <div class="flex mb-2 items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-gray-700 dark:text-gray-200">
              {option.name || 'Untitled Option'}
            </span>
          </div>
          <div class="text-right">
            <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {option.totalScore}
            </span>
            <span class="text-xs text-gray-500 ml-1">pts</span>
          </div>
        </div>

        <div class="overflow-hidden h-3 text-xs flex rounded-full bg-gray-100 dark:bg-gray-700">
          <div
            style="width: {option.percentage}%"
            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
          ></div>
        </div>
      </div>
    {/each}

    {#if $weightedScores.length === 0}
      <p class="text-center text-gray-400 text-sm py-4">Add options to see results.</p>
    {/if}
  </div>
</div>
