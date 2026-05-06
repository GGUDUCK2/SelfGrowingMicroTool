<script lang="ts">
  import { db, type InvoiceHistory } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { FileText, Trash2 } from 'lucide-svelte';
  import { format } from 'date-fns';
  import { formatCurrency } from '$lib/utils/invoice-forge/calculations';

  export let dictionary: Record<string, any>;
  export let onLoad: (data: any) => void;

  let historyQuery = liveQuery(() => db.invoiceForgeHistory.orderBy('createdAt').reverse().toArray());

  async function deleteHistory(id: number | undefined) {
    if (id) await db.invoiceForgeHistory.delete(id);
  }

  function load(item: InvoiceHistory) {
      onLoad(item.data);
  }
</script>

<div class="space-y-4">
    <h3 class="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
        <FileText size={20} />
        {dictionary.history.title}
    </h3>

    <div class="space-y-2 max-h-[500px] overflow-y-auto">
        {#if $historyQuery && $historyQuery.length > 0}
            {#each $historyQuery as item (item.id)}
                <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg group hover:border-blue-500 transition-colors">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="grow cursor-pointer" on:click={() => load(item)} role="button" tabindex="0">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-gray-900 dark:text-white text-sm">{item.invoiceNumber}</span>
                            <span class="text-xs text-gray-500">{format(item.createdAt, 'MMM d, yyyy')}</span>
                        </div>
                        <div class="flex items-center justify-between mt-1">
                             <span class="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{item.clientName || 'Unknown Client'}</span>
                             <span class="text-xs font-mono font-medium text-gray-800 dark:text-gray-200">{item.currency} {formatCurrency(item.total)}</span>
                        </div>
                    </div>
                    <button on:click={() => deleteHistory(item.id)} class="ml-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <Trash2 size={16} />
                    </button>
                </div>
            {/each}
        {:else}
            <div class="text-center py-8 text-gray-500 text-sm italic">
                {dictionary.history.empty}
            </div>
        {/if}
    </div>
</div>
