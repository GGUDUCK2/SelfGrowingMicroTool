<script lang="ts">
    import { engine, type SoundId } from '$lib/utils/zen-forge/engine';
    import type { ZenForgeDictionary } from '$lib/types/zen-forge';
    import { generateSmartMix, type SmartMixTag } from '$lib/utils/zen-forge/smart-mix';
    import SoundCard from './SoundCard.svelte';
    import { CloudRain, Wind, Waves, Brain, Activity, Zap, Fan, Disc, Sparkles } from 'lucide-svelte';

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

    // Local state to track engine
    let activeChannels = new Map<string, boolean>();
    let volumes = new Map<string, number>();

    function updateState() {
        // Create a new map to trigger reactivity
        const newActive = new Map();
        for (const [key] of engine.channels) {
            newActive.set(key, true);
        }
        activeChannels = newActive;
    }

    function handleToggle(e: CustomEvent) {
        const id = e.detail.id as SoundId;
        const vol = volumes.get(id) || 0.5;
        const isPlaying = engine.toggle(id, vol);
        if (isPlaying) {
            volumes.set(id, vol);
        }
        updateState();
    }

    function handleVolume(e: CustomEvent) {
        const { id, volume } = e.detail;
        volumes.set(id, volume);
        if (engine.channels.has(id)) {
            engine.setVolume(id as SoundId, volume);
        }
    }

    export function loadMix(tracks: {id: string, volume: number, muted: boolean}[]) {
        engine.stopAll();
        activeChannels.clear();
        volumes.clear();

        tracks.forEach(t => {
            if (!t.muted) {
                volumes.set(t.id, t.volume);
                engine.toggle(t.id as SoundId, t.volume);
            }
        });
        updateState();
    }

    export function reset() {
        engine.stopAll();
        updateState();
    }

    export function getMix() {
        const mix = [];
        for (const [id, ch] of engine.channels) {
            mix.push({
                id,
                volume: ch.gain.gain.value,
                muted: false
            });
        }
        return mix;
    }

    export function handleBreath(e: CustomEvent) {
        const { phase, duration } = e.detail;
        // Natural sounds to modulate
        const targets: SoundId[] = ['wind', 'pink', 'brown', 'rain'];
        const rampTime = duration ? duration / 1000 : 1;

        targets.forEach(id => {
            if (activeChannels.has(id)) {
                let targetMod = 1.0;
                if (phase === 'inhale') targetMod = 1.3;
                else if (phase === 'hold') targetMod = 1.3;
                else if (phase === 'exhale') targetMod = 0.7;

                engine.setModulation(id, targetMod, rampTime);
            }
        });
    }

    export function applySmartMix(tag: SmartMixTag = 'focus') {
        const mix = generateSmartMix(tag);
        loadMix(mix);
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
                <button
                    on:click={() => applySmartMix(tag)}
                    class="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 transition-colors border border-indigo-500/30"
                >
                    {dict.smartMix[tag] || tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
            {/each}
        </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {#each sounds as sound (sound.id)}
            <SoundCard
                id={sound.id}
                label={dict.sounds[sound.id]}
                Icon={sound.icon}
                isPlaying={activeChannels.has(sound.id)}
                volume={volumes.get(sound.id) || 0.5}
                on:toggle={handleToggle}
                on:volume={handleVolume}
            />
        {/each}
    </div>
</div>
