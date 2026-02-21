<script lang="ts">
    import { onDestroy } from 'svelte';
    import { Play, Pause, RotateCcw } from 'lucide-svelte';
    import { engine } from '$lib/utils/zen-forge/engine';
    import { zenStore } from '$lib/stores/zen-forge';
    import type { ZenForgeDictionary } from '$lib/types/zen-forge';

    export let dict: ZenForgeDictionary;

    let timeLeft = 25 * 60;
    let initialTime = 25 * 60;
    let isRunning = false;
    let fadeOut = true;
    let chime = true;
    let timerInterval: any;

    // New Features
    let journeyMode = false;
    let startHz = 14;
    let endHz = 4;

    let intervalChime = false;
    let chimeInterval = 15;

    const presets = [15, 25, 45, 60];

    function formatTime(seconds: number) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function setTime(minutes: number) {
        timeLeft = minutes * 60;
        initialTime = timeLeft;
        stop();
    }

    function toggle() {
        if (isRunning) {
            stop();
        } else {
            start();
        }
    }

    function start() {
        if (timeLeft <= 0) return;
        isRunning = true;
        engine.init();

        if (journeyMode) {
            zenStore.applyJourney(startHz, endHz, timeLeft);
        }

        timerInterval = setInterval(() => {
            timeLeft--;

            // Interval Chime
            if (intervalChime && timeLeft > 0 && (initialTime - timeLeft) > 0 && (initialTime - timeLeft) % (chimeInterval * 60) === 0) {
                engine.playChime();
            }

            // Smart Fade: Last 30 seconds if duration > 1 min
            if (timeLeft === 30 && fadeOut && initialTime > 60 && engine.masterGain && engine.context) {
                 const now = engine.context.currentTime;
                 // eslint-disable-next-line @typescript-eslint/no-unused-vars
                 const currentVol = $zenStore.masterVolume;
                 engine.masterGain.gain.cancelScheduledValues(now);
                 engine.masterGain.gain.setValueAtTime(engine.masterGain.gain.value, now);
                 engine.masterGain.gain.linearRampToValueAtTime(0, now + 30);
            }

            if (timeLeft <= 0) {
                complete();
            }
        }, 1000);
    }

    function stop() {
        isRunning = false;
        clearInterval(timerInterval);

        // Restore volume if we were fading out
        if (engine.masterGain && engine.context) {
            const now = engine.context.currentTime;
            engine.masterGain.gain.cancelScheduledValues(now);
            // Restore to store volume
            engine.masterGain.gain.linearRampToValueAtTime($zenStore.masterVolume, now + 0.5);
        }
    }

    function reset() {
        stop();
        timeLeft = initialTime;
    }

    function complete() {
        stop(); // This resets volume, which we might not want if we want silence...
        // But stop() is called to clear interval.

        // If fadeOut was true, we want to actually STOP everything.
        if (fadeOut) {
             zenStore.reset(); // Stop all sounds
             // Reset volume for next time (but logic in store might need update?)
             // zenStore.reset() sets activeChannels to empty.
             // We should restore volume for next interaction.
             zenStore.setMasterVolume($zenStore.masterVolume);
        } else if (chime) {
            engine.playChime();
        }
    }

    onDestroy(() => {
        clearInterval(timerInterval);
    });
</script>

<div class="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 flex flex-col items-center gap-6 relative overflow-hidden h-full justify-center">
    <!-- Timer Display -->
    <div class="relative z-10 flex flex-col items-center">
        <div class="text-6xl lg:text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-200 to-purple-200 tabular-nums tracking-wider drop-shadow-lg">
            {formatTime(timeLeft)}
        </div>
        <div class="text-xs font-medium text-slate-500 uppercase tracking-widest mt-2">
            {isRunning ? (dict.timerDict?.remaining || 'Remaining') : (dict.timerDict?.start || 'Focus Timer')}
        </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-4 z-10">
        <button
            on:click={toggle}
            class="p-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 transition-all hover:scale-105 active:scale-95"
            aria-label={isRunning ? (dict.timerDict?.stop || 'Stop') : (dict.timerDict?.start || 'Start')}
        >
            {#if isRunning}
                <Pause size={28} fill="currentColor" />
            {:else}
                <Play size={28} fill="currentColor" class="ml-1" />
            {/if}
        </button>

        <button
            on:click={reset}
            class="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            aria-label="Reset Timer"
        >
            <RotateCcw size={20} />
        </button>
    </div>

    <!-- Presets -->
    <div class="flex flex-wrap justify-center gap-2 z-10 max-w-[200px]">
        {#each presets as min}
            <button
                on:click={() => setTime(min)}
                class="px-3 py-1 rounded-full text-xs font-medium border border-slate-600 hover:border-indigo-500 hover:text-indigo-400 transition-colors {initialTime === min * 60 ? 'bg-indigo-900/30 text-indigo-300 border-indigo-500' : 'text-slate-400'}"
            >
                {min}{dict.timerDict?.min || 'm'}
            </button>
        {/each}
    </div>

    <!-- Options -->
    <div class="flex flex-col gap-3 z-10 w-full max-w-[240px] mt-2">
        <div class="flex gap-4 text-xs text-slate-400 justify-center">
            <label class="flex items-center gap-2 cursor-pointer hover:text-slate-200">
                <input type="checkbox" bind:checked={fadeOut} class="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500/50" />
                <span>{dict.timerDict?.fadeOut || 'Fade Out'}</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer hover:text-slate-200">
                <input type="checkbox" bind:checked={chime} class="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500/50" />
                <span>Finish Chime</span>
            </label>
        </div>

        <!-- Journey Mode -->
        <div class="border-t border-slate-700 pt-3 w-full">
            <label class="flex items-center justify-between cursor-pointer mb-2 hover:text-slate-200">
                <span class="text-xs font-medium text-slate-300">{dict.timerDict?.journey || 'Binaural Journey'}</span>
                <input type="checkbox" bind:checked={journeyMode} class="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500/50" />
            </label>

            {#if journeyMode}
                <div class="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                        <span class="text-slate-500 block mb-1">{dict.timerDict?.startFreq || 'Start Hz'}</span>
                        <input type="number" bind:value={startHz} min="1" max="40" class="w-full bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-center text-slate-200 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                        <span class="text-slate-500 block mb-1">{dict.timerDict?.endFreq || 'End Hz'}</span>
                        <input type="number" bind:value={endHz} min="1" max="40" class="w-full bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-center text-slate-200 focus:border-indigo-500 focus:outline-none" />
                    </div>
                </div>
            {/if}
        </div>

        <!-- Interval Chime -->
        <div class="border-t border-slate-700 pt-3 w-full">
             <label class="flex items-center justify-between cursor-pointer mb-2 hover:text-slate-200">
                <span class="text-xs font-medium text-slate-300">{dict.timerDict?.chime || 'Interval Chime'}</span>
                <input type="checkbox" bind:checked={intervalChime} class="rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500/50" />
            </label>

            {#if intervalChime}
                <div class="flex items-center gap-2">
                    <span class="text-[10px] text-slate-500 whitespace-nowrap">{dict.timerDict?.interval || 'Every (min)'}</span>
                    <select bind:value={chimeInterval} class="w-full bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none">
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                    </select>
                </div>
            {/if}
        </div>
    </div>

    <!-- Background Progress -->
    <div
        class="absolute bottom-0 left-0 h-1 bg-indigo-500/50 transition-all duration-1000 ease-linear"
        style="width: {(timeLeft / initialTime) * 100}%"
    ></div>
</div>
