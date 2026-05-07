<script lang="ts">
    import { onDestroy, createEventDispatcher } from 'svelte';
    import type { ZenForgeDictionary } from '$lib/types/zen-forge';

    export let dict: ZenForgeDictionary;

    let step: 'idle' | 'inhale' | 'hold' | 'exhale' = 'idle';
    let text = dict.breathing?.start || 'Breathe';
    let isRunning = false;
    let timeout: any;

    const dispatch = createEventDispatcher();

    function runCycle() {
        if (!isRunning) return;

        // Inhale (4s)
        step = 'inhale';
        text = dict.breathing?.inhale || 'Inhale';
        dispatch('breath', { phase: 'inhale', duration: 4000 });

        timeout = setTimeout(() => {
            if (!isRunning) return;

            // Hold (7s)
            step = 'hold';
            text = dict.breathing?.hold || 'Hold';
            dispatch('breath', { phase: 'hold', duration: 7000 });

            timeout = setTimeout(() => {
                if (!isRunning) return;

                // Exhale (8s)
                step = 'exhale';
                text = dict.breathing?.exhale || 'Exhale';
                dispatch('breath', { phase: 'exhale', duration: 8000 });

                timeout = setTimeout(() => {
                    if (!isRunning) return;
                    runCycle(); // Loop
                }, 8000);
            }, 7000);
        }, 4000);
    }

    function toggle() {
        isRunning = !isRunning;
        if (isRunning) {
            runCycle();
        } else {
            clearTimeout(timeout);
            step = 'idle';
            text = dict.breathing?.start || 'Breathe';
            dispatch('breath', { phase: 'idle' });
        }
    }

    onDestroy(() => {
        clearTimeout(timeout);
    });
</script>

<div class="flex flex-col items-center gap-4">
    <button class="min-h-[44px] min-w-[44px] relative w-48 h-48 flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-4 focus:ring-indigo-500/20 rounded-full"
        on:click={toggle}
        aria-label={isRunning ? 'Stop Breathing Exercise' : 'Start Breathing Exercise'}
    >
        <!-- Outer Ring (Static) -->
        <div class="absolute inset-0 rounded-full border border-slate-700 group-hover:border-indigo-500/50 transition-colors"></div>

        <!-- Ripple Effect (Optional) -->
        {#if isRunning}
            <div class="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping opacity-20"></div>
        {/if}

        <!-- Breathing Circle -->
        <div
            class="rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 backdrop-blur-sm flex items-center justify-center transition-all ease-in-out shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            class:w-16={step === 'idle'}
            class:h-16={step === 'idle'}
            class:opacity-50={step === 'idle'}

            class:w-full={step === 'inhale' || step === 'hold'}
            class:h-full={step === 'inhale' || step === 'hold'}
            class:duration-[4000ms]={step === 'inhale'}

            class:w-12={step === 'exhale'}
            class:h-12={step === 'exhale'}
            class:duration-[8000ms]={step === 'exhale'}

            class:bg-indigo-400={step === 'hold'}
        >
            <span class="text-sm font-medium text-white/90 pointer-events-none transition-all duration-500 drop-shadow-md">
                {text}
            </span>
        </div>

        {#if !isRunning}
            <div class="absolute -bottom-8 text-xs text-slate-500 font-medium tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                4-7-8 Technique
            </div>
        {/if}
    </button>
</div>
