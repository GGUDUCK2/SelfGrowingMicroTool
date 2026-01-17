<script lang="ts">
  import { onMount } from 'svelte';
  import { Clock, Trash2, ArrowRight } from 'lucide-svelte';
  import type { PixelHistoryItem } from '$lib/utils/pixel-forge/types';
  import { getHistory, clearHistory } from '$lib/utils/pixel-forge/db';
  import { format } from 'date-fns';

  export let dict: any;

  let history: PixelHistoryItem[] = [];

  onMount(async () => {
    await loadHistory();
  });

  async function loadHistory() {
    history = await getHistory();
  }

  async function handleClear() {
    await clearHistory();
    history = [];
  }

  function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function getSavings(original: number, optimized: number): string {
    const saved = original - optimized;
    const percent = Math.round((saved / original) * 100);
    return percent > 0 ? `-${percent}%` : `+${Math.abs(percent)}%`;
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-bold text-slate-200 flex items-center gap-2">
      <Clock class="w-5 h-5 text-indigo-400" />
      {dict.pixelForge.history?.title || "History"}
    </h3>
    {#if history.length > 0}
      <button
        on:click={handleClear}
        class="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
      >
        <Trash2 class="w-3.5 h-3.5" />
        {dict.pixelForge.controls.clear || "Clear"}
      </button>
    {/if}
  </div>

  {#if history.length === 0}
    <div class="text-center py-8 text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700 border-dashed">
      <p>{dict.pixelForge.history?.empty || "No history yet"}</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each history as item (item.id)}
        <div class="bg-slate-800/50 border border-slate-700 p-3 rounded-lg flex items-center justify-between group hover:border-slate-600 transition-colors">
            <div class="min-w-0">
                <div class="flex items-baseline gap-2">
                    <span class="text-slate-200 font-medium truncate max-w-[200px] text-sm">{item.fileName}</span>
                    <span class="text-xs text-slate-500">{format(item.timestamp, 'MMM d, HH:mm')}</span>
                </div>
                <div class="flex items-center gap-2 text-xs mt-1">
                     <span class="text-slate-400">{formatSize(item.originalSize)}</span>
                     <ArrowRight class="w-3 h-3 text-slate-600" />
                     <span class="text-green-400 font-bold">{formatSize(item.optimizedSize)}</span>
                     <span class="text-slate-500 ml-1">({getSavings(item.originalSize, item.optimizedSize)})</span>
                     <span class="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] uppercase ml-2">{item.format.split('/')[1]}</span>
                </div>
            </div>
            <!-- Since we don't store the blob in history (too heavy), we can't re-download.
                 This is just a log. In a real app we might store in IndexedDB as blob but keeping it light here. -->
        </div>
      {/each}
    </div>
  {/if}
</div>
