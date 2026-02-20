<script lang="ts">
    import { Play, Pause, RefreshCw, Mic, Square } from 'lucide-svelte';
    import { engine } from '$lib/utils/zen-forge/engine';
    import { createEventDispatcher } from 'svelte';
    import type { ZenForgeDictionary } from '$lib/types/zen-forge';

    export let dict: ZenForgeDictionary;

    let isPlaying = false;
    let isRecording = false;
    let volume = 1;
    let timerValue = 0;
    let timerInterval: any;

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
        if (isRecording) {
            const blob = await engine.stopRecording();
            isRecording = false;
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `zen-forge-mix-${new Date().toISOString().slice(0,10)}.webm`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } else {
            engine.startRecording();
            isRecording = true;
        }
    }

    function handleReset() {
        dispatch('reset');
        isPlaying = false;
        clearInterval(timerInterval);
        timerValue = 0;
    }

    function setVolume() {
        engine.setMasterVolume(volume);
    }

    function startTimer(min: number) {
        clearInterval(timerInterval);
        timerValue = min * 60;
        timerInterval = setInterval(() => {
            timerValue--;
            if (timerValue <= 0) {
                clearInterval(timerInterval);
                engine.setMasterVolume(0); // Fade out
                // Optionally stop everything
                setTimeout(() => {
                    handleReset();
                    volume = 1; // Reset volume for UI
                    engine.setMasterVolume(1); // Reset engine volume
                }, 2000);
            }
        }, 1000);
    }

    function formatTime(sec: number) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
</script>

<div class="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-4 flex flex-wrap items-center gap-6 shadow-xl">
    <!-- Play/Pause -->
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
    <div class="flex-1 min-w-[120px]">
        <label class="text-xs uppercase text-slate-500 font-bold mb-1 block">{dict.controls.master}</label>
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            bind:value={volume}
            on:input={setVolume}
            class="w-full accent-indigo-500 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            aria-label={dict.controls.master}
        />
    </div>

    <!-- Record Button -->
    <button
        on:click={toggleRecord}
        class="p-2 rounded-xl border flex items-center gap-2 transition-all {isRecording ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white'}"
        title={isRecording ? dict.controls.stopRecord : dict.controls.record}
        aria-label={isRecording ? dict.controls.stopRecord : dict.controls.record}
    >
        {#if isRecording}
            <Square size={18} class="fill-current" />
            <span class="text-xs font-bold hidden sm:inline">{dict.controls.recording}</span>
        {:else}
            <Mic size={18} />
        {/if}
    </button>

    <!-- Timer (Embedded) -->
    <!-- Note: Keeping this as it was present, though +page.svelte also has ZenTimer -->
    <div class="flex items-center gap-2 border-l border-slate-700 pl-4">
        {#if timerValue > 0}
             <div class="flex flex-col items-center">
                 <div class="text-xl font-mono text-indigo-400 font-bold w-16 text-center leading-none">
                     {formatTime(timerValue)}
                 </div>
                 <button on:click={() => { clearInterval(timerInterval); timerValue = 0; }} class="text-xs text-slate-500 hover:text-red-400 mt-1">
                     {dict.timerDict.stop}
                 </button>
             </div>
        {:else}
            <div class="flex gap-1">
                <button on:click={() => startTimer(15)} class="px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600 transition-colors">15{dict.timerDict.min}</button>
                <button on:click={() => startTimer(25)} class="px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600 transition-colors">25{dict.timerDict.min}</button>
                <button on:click={() => startTimer(45)} class="px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600 transition-colors">45{dict.timerDict.min}</button>
            </div>
        {/if}
    </div>

    <button on:click={handleReset} class="p-2 text-slate-400 hover:text-white" title={dict.controls.reset} aria-label={dict.controls.reset}>
        <RefreshCw size={20} />
    </button>
</div>
