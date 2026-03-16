<script lang="ts">
  import { getStrength, getCrackTimeEstimation } from '$lib/utils/password-forge/generator';

  export let entropy: number = 0;
  export let dictionary: any;

  $: strength = getStrength(entropy);
  $: timeToCrack = getCrackTimeEstimation(entropy);
  $: score = strength ? strength.score : 0;
</script>

<div class="mt-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
  <div class="flex items-center justify-between mb-2">
    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
      {dictionary.strength}:
      <span class="font-bold {strength?.color?.replace('bg-', 'text-')}">{dictionary.levels[score - 1] || ''}</span>
    </span>
    <span class="text-xs text-slate-500 dark:text-slate-400">
      {dictionary.entropy}: {Math.round(entropy)} bits
    </span>
  </div>

  <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden flex">
    <div
      class="h-2.5 rounded-full transition-all duration-500 {strength?.color}"
      style="width: {score * 20}%"
    ></div>
  </div>

  <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
    {dictionary.timeToCrack}: <span class="font-medium text-slate-700 dark:text-slate-300">{timeToCrack}</span>
  </p>
</div>
