<script lang="ts">
    import { Play, Pause, RefreshCw, Mic, Square, Share2, Maximize2, Headphones } from 'lucide-svelte';
    import { engine } from '$lib/utils/zen-forge/engine';
    import { zenStore } from '$lib/stores/zen-forge';
    import { createEventDispatcher } from 'svelte';
    import type { ZenForgeDictionary } from '$lib/types/zen-forge';

    export let dict: ZenForgeDictionary;

    let isPlaying = false; // Local tracking of context state

    const dispatch = createEventDispatcher();

    function togglePlay() {
        if (isPlaying) {
            engine.context?.suspend();
        } else {
            engine.init();
            engine.context?.resume();
        }
        isPlaying = !isPlaying;
    }

    async function toggleRecord() {
        if ($zenStore.isRecording) {
            const blob = await zenStore.stopRecording();
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `zen-forge-mix-${new Date().toISOString().slice(0,10)}.webm`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } else {
            zenStore.startRecording();
        }
    }

    function handleReset() {
        zenStore.reset();
        dispatch('reset');
    }

    let showToast = false;
    function handleShare() {
        const url = zenStore.getShareUrl();
        navigator.clipboard.writeText(url);
        showToast = true;
        setTimeout(() => showToast = false, 2000);
    }

    function toggleFocus() {
        zenStore.setFocusMode(!$zenStore.isFocusMode);
    }

    function toggleSpatial() {
        zenStore.setSpatialMode(!$zenStore.spatialMode);
    }
</script>

<div class="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-4 flex items-center gap-4 overflow-x-auto scrollbar-hide whitespace-nowrap shadow-xl">
    <!-- Play/Pause (Global Context) -->
    <button
        on:click={togglePlay}
        class="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all shadow-lg shadow-indigo-500/30"
        aria-label={isPlaying ? dict.controls.pause : dict.controls.play}
    >
        {#if isPlaying}
            <Pause class="w-6 h-6 fill-current" />
        {:else}
            <Play class="w-6 h-6 fill-current ml-1" />
        {/if}
    </button>

    <!-- Master Volume -->
    <div class="flex-1 min-w-[100px]">
        <label for="master-volume" class="text-[10px] uppercase text-slate-500 font-bold mb-1 block">{dict.controls.master}</label>
        <input
            id="master-volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={$zenStore.masterVolume}
            on:input={(e) => zenStore.setMasterVolume(parseFloat(e.currentTarget.value))}
            class="w-full accent-indigo-500 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            aria-label={dict.controls.master}
        />
    </div>

    <!-- Toggles Group -->
    <div class="flex items-center gap-2">
        <!-- Spatial Audio -->
        <button
            on:click={toggleSpatial}
            class="p-2 rounded-xl border transition-all {$zenStore.spatialMode ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-slate-200'}"
            title={dict.controls?.spatialAudio || "3D Spatial Audio"}
            aria-label={dict.controls?.spatialAudio || "3D Spatial Audio"}
        >
            <Headphones size={18} />
        </button>

        <!-- Record Button -->
        <button
            on:click={toggleRecord}
            class="p-2 rounded-xl border flex items-center gap-2 transition-all {$zenStore.isRecording ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white'}"
            title={$zenStore.isRecording ? dict.controls.stopRecord : dict.controls.record}
            aria-label={$zenStore.isRecording ? dict.controls.stopRecord : dict.controls.record}
        >
            {#if $zenStore.isRecording}
                <Square size={18} class="fill-current" />
            {:else}
                <Mic size={18} />
            {/if}
        </button>

        <!-- Focus Mode -->
        <button
            on:click={toggleFocus}
            class="p-2 rounded-xl border transition-all {$zenStore.isFocusMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-slate-200'}"
            title={dict.controls?.focusMode || "Focus Mode"}
            aria-label={dict.controls?.focusMode || "Focus Mode"}
        >
            <Maximize2 size={18} />
        </button>
    </div>

    <div class="h-6 w-px bg-slate-700 mx-1"></div>

    <div class="relative">
        <button
            on:click={handleShare}
            class="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
            title={dict.controls.share || 'Share Mix'}
            aria-label={dict.controls.share || 'Share Mix'}
        >
            <Share2 size={20} />
        </button>
        {#if showToast}
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-indigo-600 text-white text-[10px] rounded shadow-lg whitespace-nowrap z-50">
                {dict.controls.shared || 'Link Copied!'}
            </div>
        {/if}
    </div>

    <button on:click={handleReset} class="p-2 text-slate-400 hover:text-white" title={dict.controls.reset} aria-label={dict.controls.reset}>
        <RefreshCw size={20} />
    </button>
</div>
