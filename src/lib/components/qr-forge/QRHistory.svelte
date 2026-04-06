<script lang="ts">
  import { db } from '$lib/db/qr-forge';
  import type { QRState } from '$lib/utils/qr-forge/types';
  import { liveQuery } from 'dexie';
  import { Trash2, RotateCcw, Star, Clock } from 'lucide-svelte';
  import { slide } from 'svelte/transition';

  export let onLoad: (state: QRState) => void;
  export let dictionary: any;

  let history = liveQuery(() => db.history.orderBy('createdAt').reverse().limit(50).toArray());

  const restore = (item: QRState) => {
     // Create a copy without ID to treat as new draft, or keep logic simple
     const { id, ...rest } = item;
     onLoad(JSON.parse(JSON.stringify(rest)) as QRState);
  };

  const remove = (id?: number) => {
      if (id) db.history.delete(id);
  };

  const toggleStar = (item: QRState) => {
      if (item.id) db.history.update(item.id, { starred: !item.starred });
  };

  const clearAll = () => {
      if (confirm('Clear all history?')) {
          db.history.clear();
      }
  };

  const d = dictionary.tools.qrForge || {};
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-semibold text-slate-200 flex items-center gap-2">
        <Clock size={20} />
        {d.history || 'Recent History'}
    </h3>
    <button on:click={clearAll} class="text-xs text-slate-400 hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
        {d.clear || 'Clear All'}
    </button>
  </div>

  {#if $history}
    {#if $history.length === 0}
        <div class="text-center py-8 text-slate-500 text-sm">
            {d.emptyHistory || 'No saved QR codes yet.'}
        </div>
    {:else}
        <div class="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {#each $history as item (item.id)}
                <div transition:slide class="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-center justify-between group hover:border-indigo-500/50 transition-colors">
                    <div class="flex-1 min-w-0 mr-4">
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-indigo-300 uppercase tracking-wider">
                                {item.type}
                            </span>
                            <span class="text-xs text-slate-500">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p class="text-sm text-slate-300 truncate">
                            {#if item.type === 'url'}{item.url}
                            {:else if item.type === 'wifi'}{item.wifi?.ssid}
                            {:else if item.type === 'email'}{item.email?.to}
                            {:else if item.type === 'text'}{item.text}
                            {:else if item.type === 'vcard'}{item.vcard?.firstName} {item.vcard?.lastName}
                            {:else if item.type === 'sms'}{item.sms?.phone}
                            {:else if item.type === 'crypto'}{item.crypto?.currency}
                            {/if}
                        </p>
                    </div>

                    <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            on:click={() => restore(item)}
                            class="p-1.5 text-slate-400 hover:text-indigo-400 rounded-md hover:bg-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title={d.restore || "Restore"}
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            on:click={() => toggleStar(item)}
                            class="p-1.5 rounded-md hover:bg-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center {item.starred ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'}"
                            title="Star"
                        >
                            <Star size={16} fill={item.starred ? "currentColor" : "none"} />
                        </button>
                        <button
                            on:click={() => remove(item.id)}
                            class="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title={d.delete || "Delete"}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
  {/if}
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #475569;
        border-radius: 20px;
    }
</style>
