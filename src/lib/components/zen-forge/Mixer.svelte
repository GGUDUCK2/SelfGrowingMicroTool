<script lang="ts">
    import { zenStore } from '$lib/stores/zen-forge';
    import { engine, type SoundId } from '$lib/utils/zen-forge/engine';
    import type { ZenForgeDictionary } from '$lib/types/zen-forge';
    import SoundCard from './SoundCard.svelte';
    import { CloudRain, Wind, Waves, Brain, Activity, Zap, Fan, Disc, Sparkles, CloudLightning, Bird, Bell, Bug, Flame } from 'lucide-svelte';

    export let dict: ZenForgeDictionary;

    let sounds = [
        { id: 'rain', icon: CloudRain },
        { id: 'wind', icon: Wind },
        { id: 'white', icon: Fan },
        { id: 'pink', icon: Waves },
        { id: 'brown', icon: Zap },
        { id: 'drone', icon: Disc },
        { id: 'binaural_alpha', icon: Brain },
        { id: 'binaural_theta', icon: Brain },
        { id: 'binaural_delta', icon: Brain },
    ] as const;

    let events = [
        { id: 'thunder', icon: CloudLightning },
        { id: 'birds', icon: Bird },
        { id: 'chimes', icon: Bell },
        { id: 'crickets', icon: Bug },
        { id: 'fire', icon: Flame },
    ] as const;

    // Reactive check for binaural tracks
    $: hasBinaural = Array.from($zenStore.activeChannels).some(id => id.startsWith('binaural'));

    function handleToggle(e: CustomEvent) {
        zenStore.toggle(e.detail.id);
    }

    function handleVolume(e: CustomEvent) {
        zenStore.setVolume(e.detail.id, e.detail.volume);
    }

    // Breathing modulation logic (kept here for now, could be in store)
    export function handleBreath(e: CustomEvent) {
        const { phase, duration } = e.detail;
        const targets: SoundId[] = ['wind', 'pink', 'brown', 'rain'];
        const rampTime = duration ? duration / 1000 : 1;

        targets.forEach(id => {
            if ($zenStore.activeChannels.has(id)) {
                let targetMod = 1.0;
                if (phase === 'inhale') targetMod = 1.3;
                else if (phase === 'hold') targetMod = 1.3;
                else if (phase === 'exhale') targetMod = 0.7;

                engine.setModulation(id, targetMod, rampTime);
            }
        });
    }
</script>

<div class="flex flex-col gap-6">
    <!-- Smart Mix Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-indigo-900/20 border border-indigo-500/20 rounded-2xl">
        <div class="flex items-center gap-2 text-indigo-300">
            <Sparkles size={20} />
            <span class="font-bold text-sm uppercase tracking-wider">{dict.smartMix.title}</span>
        </div>
        <div class="flex flex-wrap gap-2">
            {#each ['focus', 'relax', 'sleep', 'meditate'] as tag}
                <button class="min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 transition-colors border border-indigo-500/30" on:click={() => zenStore.applySmartMix(tag)}
                >
                    {dict.smartMix[tag] || tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
            {/each}
        </div>
    </div>

    <!-- Binaural Controls (Conditional) -->
    {#if hasBinaural}
        <div class="p-4 bg-indigo-900/30 rounded-xl border border-indigo-500/30 transition-all">
            <div class="flex justify-between mb-2 items-center">
                <div class="flex items-center gap-2">
                    <Activity size={16} class="text-indigo-400" />
                    <span class="text-xs font-bold text-indigo-300 uppercase tracking-wider">{dict.controls.binauralFreq}</span>
                </div>
                <span class="text-xs font-mono text-indigo-200 bg-indigo-950 px-2 py-1 rounded">{$zenStore.binauralFreq.toFixed(1)} Hz</span>
            </div>
            <input
                type="range"
                min="1"
                max="40"
                step="0.5"
                value={$zenStore.binauralFreq}
                on:input={(e) => zenStore.setBinauralFreq(parseFloat(e.currentTarget.value))}
                class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div class="flex justify-between text-[10px] text-slate-500 mt-1 font-mono uppercase">
                <span>Delta (1-4)</span>
                <span>Theta (4-8)</span>
                <span>Alpha (8-13)</span>
                <span>Beta (13-30)</span>
            </div>
        </div>
    {/if}

    <!-- Static Sounds -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {#each sounds as sound (sound.id)}
            <SoundCard
                id={sound.id}
                label={dict.sounds[sound.id]}
                Icon={sound.icon}
                isPlaying={$zenStore.activeChannels.has(sound.id)}
                volume={$zenStore.volumes[sound.id] || 0.5}
                on:toggle={handleToggle}
                on:volume={handleVolume}
            />
        {/each}
    </div>

    <!-- Living Atmosphere -->
    <div class="space-y-4 pt-4 border-t border-slate-800">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">{dict.events.title}</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {#each events as event (event.id)}
                <SoundCard
                    id={event.id}
                    label={dict.sounds[event.id]}
                    Icon={event.icon}
                    isPlaying={$zenStore.activeChannels.has(event.id)}
                    volume={$zenStore.volumes[event.id] || 0.5}
                    on:toggle={handleToggle}
                    on:volume={handleVolume}
                />
            {/each}
        </div>
    </div>
</div>
