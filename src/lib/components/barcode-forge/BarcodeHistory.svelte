<script lang="ts">
  import { liveQuery } from 'dexie';
  import { workspace, toggleStar, deleteHistoryItem } from '$lib/db/workspace';
  import type { BarcodeState } from './types';
  import Trash2 from '@lucide/svelte/icons/trash-2';

  export let dictionary: any;
  export let onLoad: (state: BarcodeState) => void;

  const TOOL_ID = 'barcode-forge';
  $: t = dictionary?.tools?.barcodeForge || {};

  let historyObservable = liveQuery(async () => {
       return await workspace.history
           .where('toolId')
           .equals(TOOL_ID)
           .reverse()
           .sortBy('timestamp');
  });

  function handleLoad(item: any) {
      if (item.input) {
          onLoad(item.input as BarcodeState);
      }
  }

  async function handleDelete(id: number | undefined) {
      if (id !== undefined) {
          await deleteHistoryItem(id);
      }
  }
</script>

<div class="h-full">
  <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium text-slate-300 uppercase tracking-wider">{t.history || 'Recent Activity'}</h3>
  </div>

  <div class="h-[calc(100vh-24rem)] lg:h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {#if $historyObservable && $historyObservable.length > 0}
          <div class="space-y-3">
              {#each $historyObservable as item (item.id)}
                  <div class="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors border border-slate-700/50">
                      <button
                          class="text-left cursor-pointer flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 min-h-[44px]"
                          on:click={() => handleLoad(item)}
                      >
                          <div class="font-medium text-slate-200">
                              {item.result?.preview || 'Barcode'}
                          </div>
                          <div class="text-xs text-slate-400 mt-1">
                              {new Date(item.timestamp).toLocaleString()}
                          </div>
                      </button>
                      <button
                          on:click={() => item.id && handleDelete(item.id)}
                          class="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-slate-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
                          aria-label="Delete"
                      >
                          <Trash2 size={16} />
                      </button>
                  </div>
              {/each}
          </div>
      {:else}
          <div class="text-center text-slate-500 text-sm py-8 bg-slate-800/30 rounded-xl border border-slate-700/30 border-dashed">
              No history yet.
          </div>
      {/if}
  </div>
</div>
