<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let id: string;
    export let label: string;
    export let volume: number = 0.5;
    export let isPlaying: boolean = false;
    export let Icon: any;

    const dispatch = createEventDispatcher();

    function toggle() {
        dispatch('toggle', { id });
    }

    function updateVolume() {
        dispatch('volume', { id, volume });
    }
</script>

<div class="relative bg-slate-800 rounded-xl p-4 flex flex-col items-center gap-3 transition-all border border-slate-700
    {isPlaying ? 'ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-900/20 bg-slate-750' : 'opacity-80 hover:opacity-100 hover:bg-slate-750'}">

    <button class="min-h-[44px] min-w-[44px] w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-md
        {isPlaying ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'}" on:click={toggle}>
        <svelte:component this={Icon} size={24} />
    </button>

    <div class="text-sm font-medium text-slate-200 text-center leading-tight h-8 flex items-center justify-center px-2">
        {label}
    </div>

    <div class="w-full flex items-center gap-2 h-6 transition-opacity duration-200 {isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}">
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            bind:value={volume}
            on:input={updateVolume}
            class="w-full accent-indigo-500 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            aria-label="Volume for {label}"
        />
    </div>
</div>
