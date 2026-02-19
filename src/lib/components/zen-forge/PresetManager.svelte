<script lang="ts">
    import { db, type ZenForgeMix } from '$lib/db';
    import { liveQuery } from 'dexie';
    import { Save, Trash2, Folder } from 'lucide-svelte';
    import { createEventDispatcher } from 'svelte';
    import { browser } from '$app/environment';

    export let dict: any;
    export let getMix: () => any[];

    const dispatch = createEventDispatcher();
    let showSave = false;
    let mixName = '';
    let toastMessage = '';

    // Fix SSR issue by checking browser
    let mixes = liveQuery(() => browser ? db.zenForgeMixes.toArray() : []);

    async function save() {
        if (!mixName || !browser) return;
        const tracks = getMix();
        await db.zenForgeMixes.add({
            name: mixName,
            tracks: tracks,
            createdAt: new Date(),
            starred: 0
        });
        showSave = false;
        mixName = '';
        showToast(dict.controls.saved);
    }

    function showToast(msg: string) {
        toastMessage = msg;
        setTimeout(() => toastMessage = '', 3000);
    }

    function load(mix: ZenForgeMix) {
        dispatch('load', mix.tracks);
    }

    function remove(id: number) {
        if (!browser) return;
        if(confirm('Delete mix?')) db.zenForgeMixes.delete(id);
    }
</script>

<div class="flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 relative">
    {#if toastMessage}
        <div class="absolute top-0 left-0 right-0 z-50 flex justify-center -mt-8 pointer-events-none">
            <div class="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs shadow-lg animate-in fade-in zoom-in duration-300">
                {toastMessage}
            </div>
        </div>
    {/if}

    <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold uppercase text-slate-500">{dict.controls.presets}</h3>
        <button
            on:click={() => showSave = !showSave}
            class="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-indigo-600 rounded text-xs font-medium transition-colors text-white"
            aria-label={dict.controls.save}
        >
            <Save size={14} />
            {dict.controls.save}
        </button>
    </div>

    {#if showSave}
        <div class="flex gap-2 animate-in slide-in-from-top-2">
            <input
                type="text"
                bind:value={mixName}
                placeholder={dict.controls.mixName}
                class="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm flex-1 text-white focus:border-indigo-500 outline-none"
                aria-label={dict.controls.mixName}
            />
            <button
                on:click={save}
                class="bg-indigo-600 px-4 rounded text-sm font-medium text-white hover:bg-indigo-500"
                aria-label="Confirm Save"
            >
                Save
            </button>
        </div>
    {/if}

    <div class="grid gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
        {#if $mixes && $mixes.length > 0}
            {#each $mixes as mix (mix.id)}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="flex items-center justify-between p-2 bg-slate-700/30 rounded hover:bg-slate-700/80 hover:border-l-4 hover:border-l-indigo-500 transition-all group cursor-pointer border border-transparent"
                     on:click={() => load(mix)}>
                    <div class="flex items-center gap-2">
                        <Folder size={14} class="text-indigo-400" />
                        <span class="text-sm font-medium text-slate-200">{mix.name}</span>
                    </div>
                    <button
                        on:click|stopPropagation={() => remove(mix.id!)}
                        class="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        aria-label="Delete Mix"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            {/each}
        {:else}
            <div class="text-center py-4 text-slate-500 text-xs italic">
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
