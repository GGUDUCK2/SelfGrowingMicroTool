<script lang="ts">
  import { FileDiff, Plus, Minus, Hash } from '@lucide/svelte';

  export let stats = {
      additions: 0,
      deletions: 0,
      unchanged: 0
  };
</script>

<div class="grid grid-cols-3 gap-4 mb-4">
    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
        <div class="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            <Plus class="w-5 h-5" />
        </div>
        <div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{stats.additions}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Additions</div>
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
        <div class="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            <Minus class="w-5 h-5" />
        </div>
        <div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{stats.deletions}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Deletions</div>
        </div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
        <div class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            <Hash class="w-5 h-5" />
        </div>
        <div>
            <div class="text-2xl font-bold text-gray-900 dark:text-white">{stats.unchanged}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Unchanged Parts</div>
        </div>
    </div>
</div>
