<script lang="ts">
    import { engine, type SoundId } from '$lib/utils/zen-forge/engine';
    import SoundCard from './SoundCard.svelte';
    import { CloudRain, Wind, Waves, Brain, Activity, Zap, Fan, Disc } from 'lucide-svelte';

    export let dict: any;

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
</script>

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
