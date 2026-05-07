<script lang="ts">
    import { Trash2, Play, Star } from 'lucide-svelte';
    import { zenStore } from '$lib/stores/zen-forge';
    import { getMixes, deleteMix, toggleStar } from '$lib/db/zen-forge';
    import type { ZenForgeDictionary, ZenForgeMix } from '$lib/types/zen-forge';

    export let dict: ZenForgeDictionary;

    let mixes = getMixes();

    function formatDate(date: Date) {
        return new Date(date).toLocaleDateString();
    }
</script>

<div class="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-4 shadow-xl">
    <h3 class="text-xs uppercase text-slate-500 font-bold mb-4 flex items-center justify-between">
        {dict.history?.user || 'My Mixes'}
        <span class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-400">{$mixes?.length || 0}</span>
    </h3>

    <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {#if $mixes && $mixes.length > 0}
            {#each $mixes as mix (mix.id)}
                <div class="group bg-slate-700/50 hover:bg-slate-700 rounded-xl p-3 transition-colors border border-transparent hover:border-slate-600 flex items-center justify-between">
                    <div class="flex-1 min-w-0 mr-3">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-medium text-slate-200 truncate text-sm">{mix.name}</span>
                            {#if mix.starred}
                                <Star size={12} class="fill-yellow-400 text-yellow-400" />
                            {/if}
                        </div>
                        <div class="text-[10px] text-slate-500">
                            {formatDate(mix.createdAt)} • {mix.tracks.length} tracks
                        </div>
                    </div>

                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="min-h-[44px] min-w-[44px] p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors" on:click={() => zenStore.loadFromHistory(mix.id!)}
                            title={dict.controls?.play || "Play"}
                        >
                            <Play size={16} class="fill-current" />
                        </button>
                        <button class="min-h-[44px] min-w-[44px] p-2 hover:bg-yellow-500/20 text-slate-400 hover:text-yellow-400 rounded-lg transition-colors" on:click={() => toggleStar(mix.id!, mix.starred)}
                            title="Star"
                        >
                            <Star size={16} class={mix.starred ? "fill-current" : ""} />
                        </button>
                        <button class="min-h-[44px] min-w-[44px] p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors" on:click={() => deleteMix(mix.id!)}
                            title={dict.controls?.reset || "Delete"}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            {/each}
        {:else}
            <div class="text-center py-8 text-slate-500 text-xs italic">
                {dict.history?.empty || 'No saved mixes yet.'}
            </div>
        {/if}
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #475569;
        border-radius: 4px;
    }
</style>
