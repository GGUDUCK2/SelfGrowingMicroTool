<script lang="ts">
    import { Save, Folder, Trash2, Star, Sparkles } from 'lucide-svelte';
    import type { ZenForgeDictionary } from '$lib/types/zen-forge';
    import { getMixes, deleteMix, toggleStar } from '$lib/db/zen-forge';
    import { zenStore } from '$lib/stores/zen-forge';
    import { browser } from '$app/environment';

    export let dict: ZenForgeDictionary;

    // Live Query for User Mixes
    let userMixes = getMixes();

    const systemPresets = [
        { name: 'focus', tracks: [ {id: 'white', volume: 0.1, muted: false}, {id: 'binaural_alpha', volume: 0.5, muted: false} ] },
        { name: 'sleep', tracks: [ {id: 'brown', volume: 0.3, muted: false}, {id: 'rain', volume: 0.4, muted: false}, {id: 'binaural_delta', volume: 0.6, muted: false} ] },
        { name: 'meditate', tracks: [ {id: 'drone', volume: 0.4, muted: false}, {id: 'binaural_theta', volume: 0.6, muted: false}, {id: 'wind', volume: 0.2, muted: false} ] },
        { name: 'storm', tracks: [ {id: 'rain', volume: 0.7, muted: false}, {id: 'brown', volume: 0.4, muted: false}, {id: 'wind', volume: 0.5, muted: false} ] },
        { name: 'coding', tracks: [ {id: 'pink', volume: 0.2, muted: false}, {id: 'drone', volume: 0.3, muted: false} ] },
    ];

    async function handleSave() {
        const name = prompt(dict.controls.mixName || "Mix Name", `Mix ${new Date().toLocaleTimeString()}`);
        if (name) {
            await zenStore.saveMix(name);
        }
    }

    function load(tracks: any[]) {
        zenStore.loadMix(tracks);
    }

    async function remove(id: number) {
        if(confirm("Delete this mix?")) {
            await deleteMix(id);
        }
    }

    async function star(id: number, current: number) {
        await toggleStar(id, current);
    }
</script>

<div class="bg-slate-800/50 p-4 rounded-3xl border border-slate-700 flex flex-col gap-4 max-h-[400px] flex-1 min-h-[200px]">
    <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">{dict.controls.presets}</h3>
        <button style="min-height: 44px; min-width: 44px;"
            on:click={handleSave}
            class="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
            aria-label={dict.controls.save}
        >
            <Save size={16} />
            {dict.controls.save}
        </button>
    </div>

    <div class="overflow-y-auto flex-1 space-y-4 pr-2 custom-scrollbar">
        <!-- System Presets -->
        <div class="space-y-1">
            <div class="text-xs text-slate-500 font-bold px-2 uppercase tracking-wide opacity-50">{dict.history.system}</div>
            {#each systemPresets as preset}
                <button style="min-height: 44px; min-width: 44px;"
                    on:click={() => load(preset.tracks)}
                    class="w-full text-left px-3 py-2 rounded-xl bg-slate-700/30 hover:bg-slate-700 text-slate-300 text-sm transition-colors flex items-center gap-2 group"
                >
                    <div class="w-2 h-2 rounded-full bg-indigo-500/50 group-hover:bg-indigo-400"></div>
                    {dict.presets[preset.name as keyof typeof dict.presets] || preset.name}
                </button>
            {/each}
        </div>

        <!-- User Presets -->
        {#if $userMixes && $userMixes.length > 0}
            <div class="space-y-1 pt-2 border-t border-slate-700/50">
                <div class="text-xs text-slate-500 font-bold px-2 py-1 uppercase tracking-wide opacity-50">{dict.history.user}</div>
                {#each $userMixes as mix}
                    <div class="flex items-center group w-full bg-slate-700/30 hover:bg-slate-700 rounded-xl pr-2 transition-colors border border-transparent hover:border-slate-600">
                        <button style="min-height: 44px; min-width: 44px;"
                            on:click={() => load(mix.tracks)}
                            class="flex-1 text-left px-3 py-2 text-slate-300 text-sm flex items-center gap-2 overflow-hidden"
                        >
                            <Folder size={14} class="text-indigo-400 shrink-0" />
                            <span class="truncate">{mix.name}</span>
                        </button>

                        <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button style="min-height: 44px; min-width: 44px;"
                                on:click|stopPropagation={() => star(mix.id!, mix.starred || 0)}
                                class="p-1.5 hover:text-yellow-400 transition-colors {mix.starred ? 'text-yellow-400 opacity-100' : 'text-slate-500'}"
                                aria-label="Star Mix"
                            >
                                <Star size={14} fill={mix.starred ? "currentColor" : "none"} />
                            </button>
                            <button style="min-height: 44px; min-width: 44px;"
                                on:click|stopPropagation={() => remove(mix.id!)}
                                class="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                                aria-label="Delete Mix"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {:else if browser}
            <div class="text-center py-4 text-slate-500 text-xs italic border-t border-slate-700/50 pt-4">
                {dict.history.empty}
            </div>
        {/if}
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
    }
</style>
