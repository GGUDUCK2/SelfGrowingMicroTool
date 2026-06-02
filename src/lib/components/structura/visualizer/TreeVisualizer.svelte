<script lang="ts">
  import TreeNode from './TreeNode.svelte';
  import { Search, Expand, Minimize2 } from '@lucide/svelte';

  export let data: any;

  let searchTerm = '';
  // TODO: Implement search/filter logic if needed, for now just a prop
</script>

<div class="h-full flex flex-col bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
  <!-- Toolbar -->
  <div class="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
    <div class="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Tree Inspector</div>
    <div class="flex gap-1">
        <!-- Future: Expand/Collapse All buttons -->
    </div>
  </div>

  <!-- Tree Area -->
  <div class="flex-1 overflow-auto p-4 custom-scrollbar">
    {#if data === undefined || data === null}
       <div class="text-gray-400 italic text-sm">No data to visualize.</div>
    {:else}
       <TreeNode value={data} isLast={true} />
    {/if}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(107, 114, 128, 0.8);
  }
</style>
