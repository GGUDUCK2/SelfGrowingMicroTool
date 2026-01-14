<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import { SubnetCalculator, type NetworkInfo } from '$lib/utils/subnet-scope/calculator';

  export let dict: any;

  // Plan State
  let planItems: { id: string; cidr: string; label: string; info: NetworkInfo }[] = [];
  let newItemCidr = '';
  let newItemLabel = '';
  let error = '';

  function addItem() {
      if (!newItemCidr) return;

      const info = SubnetCalculator.analyze(newItemCidr);
      if (!info.valid) {
          error = dict.error || 'Invalid CIDR';
          return;
      }

      // Overlap Check
      for (const item of planItems) {
           if (info.version !== item.info.version) continue;

           // Simple overlap check logic
           // Convert to BigInt range
           if (isOverlapping(info, item.info)) {
               error = `Overlaps with ${item.label} (${item.cidr})`;
               return;
           }
      }

      planItems = [...planItems, {
          id: crypto.randomUUID(),
          cidr: newItemCidr,
          label: newItemLabel || `Subnet ${planItems.length + 1}`,
          info
      }];

      newItemCidr = '';
      newItemLabel = '';
      error = '';
  }

  function removeItem(id: string) {
      planItems = planItems.filter(i => i.id !== id);
  }

  function isOverlapping(a: NetworkInfo, b: NetworkInfo): boolean {
       if (a.version !== b.version) return false;

       // Handle IPv4
       if (a.version === 4 && a.networkAddress && a.broadcastAddress && b.networkAddress && b.broadcastAddress) {
           const aStart = ipToBigInt(a.networkAddress);
           const aEnd = ipToBigInt(a.broadcastAddress);
           const bStart = ipToBigInt(b.networkAddress);
           const bEnd = ipToBigInt(b.broadcastAddress);

           return (aStart <= bEnd && aEnd >= bStart);
       }

       // IPv6 overlap not implemented in this demo, assumes false
       return false;
  }

  function ipToBigInt(ip: string): bigint {
      if (ip.includes(':')) return 0n;
      const parts = ip.split('.').map(BigInt);
      return (parts[0] << 24n) | (parts[1] << 16n) | (parts[2] << 8n) | parts[3];
  }
</script>

<div class="space-y-6">
    <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 class="text-xl font-bold mb-4 text-slate-900 dark:text-white">Network Planner</h3>
        <p class="text-slate-600 dark:text-slate-400 mb-6">Build a network plan and check for overlaps.</p>

        <div class="flex flex-col md:flex-row gap-4 mb-4">
            <input
                type="text"
                bind:value={newItemLabel}
                placeholder="Label (e.g. Web Servers)"
                class="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
            <input
                type="text"
                bind:value={newItemCidr}
                placeholder="CIDR (e.g. 10.0.1.0/24)"
                class="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
            />
            <button
                on:click={addItem}
                class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
            >
                Add
            </button>
        </div>

        {#if error}
            <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm mb-4" transition:slide>
                {error}
            </div>
        {/if}

        <div class="space-y-2">
            {#each planItems as item (item.id)}
                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600" transition:slide>
                    <div>
                        <div class="font-bold text-slate-900 dark:text-white">{item.label}</div>
                        <div class="text-sm font-mono text-slate-500 dark:text-slate-400">{item.cidr}</div>
                    </div>
                     <div class="text-right text-xs text-slate-400 mr-4">
                        {item.info.totalHosts} hosts
                    </div>
                    <button
                        on:click={() => removeItem(item.id)}
                        class="text-slate-400 hover:text-red-500 transition-colors"
                        aria-label="Remove"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            {/each}
            {#if planItems.length === 0}
                <div class="text-center py-8 text-slate-500 italic">
                    No subnets added yet.
                </div>
            {/if}
        </div>
    </div>
</div>
