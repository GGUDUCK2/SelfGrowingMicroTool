<script lang="ts">
  import type { SubnetResult } from '$lib/utils/subnet-scope/calculator';
  import { slide } from 'svelte/transition';

  export let subnets: SubnetResult[] = [];
  export let dict: any; // Dictionary for localization

  function copy(text: string) {
      navigator.clipboard.writeText(text);
      // Ideally show toast, but keeping it simple for component
  }
</script>

{#if subnets.length > 0}
  <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" transition:slide>
    <table class="w-full text-left text-sm">
      <thead class="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium">
        <tr>
          <th class="px-4 py-3">#</th>
          <th class="px-4 py-3">{dict.tools.subnetScope.network}</th>
          <th class="px-4 py-3">{dict.tools.subnetScope.range}</th>
          <th class="px-4 py-3 text-right">{dict.common?.actions || 'Actions'}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
        {#each subnets as subnet, i}
          <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-4 py-3 text-slate-500">{i + 1}</td>
            <td class="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">{subnet.network}</td>
            <td class="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{subnet.range}</td>
            <td class="px-4 py-3 text-right">
              <button
                class="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                on:click={() => copy(subnet.network)}
              >
                Copy
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <div class="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
    No subnets generated. Check the mask size.
  </div>
{/if}
