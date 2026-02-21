import { writable, get } from 'svelte/store';
import { engine, type SoundId } from '$lib/utils/zen-forge/engine';
import { db } from '$lib/db';

interface ZenState {
    activeChannels: Set<SoundId>;
    volumes: Partial<Record<SoundId, number>>;
    masterVolume: number;
    binauralFreq: number;
    isRecording: boolean;
}

function createZenStore() {
    const store = writable<ZenState>({
        activeChannels: new Set<SoundId>(),
        volumes: {},
        masterVolume: 1,
        binauralFreq: 10, // Default to Alpha range
        isRecording: false
    });

    const { subscribe, set, update } = store;

    return {
        subscribe,

        // --- Audio Actions ---

        toggle: (id: SoundId) => {
            const state = get(store);
            const currentVol = state.volumes[id] || 0.5;

            const isPlaying = engine.toggle(id, currentVol);

            update(s => {
                const newActive = new Set(s.activeChannels);
                const newVolumes = { ...s.volumes };

                if (isPlaying) {
                    newActive.add(id);
                    newVolumes[id] = currentVol;
                } else {
                    newActive.delete(id);
                }
                return { ...s, activeChannels: newActive, volumes: newVolumes };
            });

            // If it's a binaural track, sync frequency
            if (id.startsWith('binaural')) {
                engine.setBinauralBeat(state.binauralFreq);
            }
        },

        setVolume: (id: SoundId, volume: number) => {
            engine.setVolume(id, volume);
            update(s => ({
                ...s,
                volumes: { ...s.volumes, [id]: volume }
            }));
        },

        setMasterVolume: (volume: number) => {
            engine.setMasterVolume(volume);
            update(s => ({ ...s, masterVolume: volume }));
        },

        setBinauralFreq: (freq: number) => {
            engine.setBinauralBeat(freq);
            update(s => ({ ...s, binauralFreq: freq }));
        },

        reset: () => {
            engine.stopAll();
            update(s => ({
                ...s,
                activeChannels: new Set(),
                volumes: {}
            }));
        },

        loadMix: (tracks: { id: string, volume: number, muted: boolean }[]) => {
            engine.stopAll();
            const newActive = new Set<SoundId>();
            const newVolumes: Partial<Record<SoundId, number>> = {};

            tracks.forEach(track => {
                if (!track.muted) {
                    const id = track.id as SoundId;
                    engine.toggle(id, track.volume);
                    newActive.add(id);
                    newVolumes[id] = track.volume;
                }
            });

            update(s => ({
                ...s,
                activeChannels: newActive,
                volumes: newVolumes
            }));
        },

        // --- Persistence ---

        saveMix: async (name: string) => {
            const state = get(store);
            const tracks = Array.from(state.activeChannels).map(id => ({
                id,
                volume: state.volumes[id] || 0.5,
                muted: false
            }));

            if (tracks.length === 0) return;

            try {
                await db.zenForgeMixes.add({
                    name,
                    tracks,
                    createdAt: new Date(),
                    starred: 0
                });
                return true;
            } catch (error) {
                console.error('Failed to save mix:', error);
                return false;
            }
        },

        loadFromHistory: async (id: number) => {
            try {
                const mix = await db.zenForgeMixes.get(id);
                if (mix) {
                    engine.stopAll();
                    const newActive = new Set<SoundId>();
                    const newVolumes: Partial<Record<SoundId, number>> = {};

                    mix.tracks.forEach(track => {
                        if (!track.muted) {
                            const soundId = track.id as SoundId;
                            engine.toggle(soundId, track.volume);
                            newActive.add(soundId);
                            newVolumes[soundId] = track.volume;
                        }
                    });

                    update(s => ({
                        ...s,
                        activeChannels: newActive,
                        volumes: newVolumes
                    }));
                }
            } catch (error) {
                console.error('Failed to load mix:', error);
            }
        },

        deleteMix: async (id: number) => {
             try {
                await db.zenForgeMixes.delete(id);
            } catch (error) {
                console.error('Failed to delete mix:', error);
            }
        },

        // --- Recording ---

        startRecording: () => {
            engine.startRecording();
            update(s => ({ ...s, isRecording: true }));
        },

        stopRecording: async () => {
            const blob = await engine.stopRecording();
            update(s => ({ ...s, isRecording: false }));
            return blob;
        },

        applySmartMix: (tag: 'focus' | 'relax' | 'sleep' | 'meditate') => {
             import('$lib/utils/zen-forge/smart-mix').then(({ generateSmartMix }) => {
                 const mix = generateSmartMix(tag);
                    engine.stopAll();
                    const newActive = new Set<SoundId>();
                    const newVolumes: Partial<Record<SoundId, number>> = {};

                    mix.forEach(track => {
                        if (!track.muted) {
                            const id = track.id as SoundId;
                            engine.toggle(id, track.volume);
                            newActive.add(id);
                            newVolumes[id] = track.volume;
                        }
                    });

                    update(s => ({
                        ...s,
                        activeChannels: newActive,
                        volumes: newVolumes
                    }));
             });
        },

        handleBreath: (phase: string, duration: number) => {
            const state = get(store);
            const targets: SoundId[] = ['wind', 'pink', 'brown', 'rain'];
            const rampTime = duration ? duration / 1000 : 1;

            targets.forEach(id => {
                if (state.activeChannels.has(id)) {
                    let targetMod = 1.0;
                    if (phase === 'inhale') targetMod = 1.3;
                    else if (phase === 'hold') targetMod = 1.3;
                    else if (phase === 'exhale') targetMod = 0.7;
                    // idle defaults to 1.0

                    engine.setModulation(id, targetMod, rampTime);
                }
            });
        },

        // --- New Features ---

        getShareUrl: () => {
            const state = get(store);
            const mix = Array.from(state.activeChannels).map(id => ({
                 id, v: state.volumes[id] || 0.5
            }));
            const data = mix.map(m => `${m.id}:${m.v.toFixed(2)}`).join('|');
            return `${window.location.origin}${window.location.pathname}?mix=${btoa(data)}`;
        },

        loadMixFromUrl: (hash: string) => {
            try {
                const data = atob(hash);
                const items = data.split('|');
                engine.stopAll();
                 const newActive = new Set<SoundId>();
                 const newVolumes: Partial<Record<SoundId, number>> = {};
                 items.forEach(item => {
                     const [id, v] = item.split(':');
                     if (id && v) {
                         const vol = parseFloat(v);
                         const sId = id as SoundId;
                         try {
                             if (engine.toggle(sId, vol)) {
                                 newActive.add(sId);
                                 newVolumes[sId] = vol;
                             }
                         } catch (e) {
                             console.warn("Invalid sound id in URL mix:", sId);
                         }
                     }
                 });
                 update(s => ({ ...s, activeChannels: newActive, volumes: newVolumes }));
            } catch (e) {
                console.error("Failed to load mix from URL", e);
            }
        },

        applyJourney: (start: number, end: number, duration: number) => {
             const state = get(store);
             let hasBinaural = false;
             state.activeChannels.forEach(id => {
                 if (id.startsWith('binaural')) hasBinaural = true;
             });

             if (!hasBinaural) {
                 // default to alpha if none
                 engine.toggle('binaural_alpha', 0.5);
                 update(s => {
                     const newActive = new Set(s.activeChannels).add('binaural_alpha');
                     const newVolumes = { ...s.volumes, binaural_alpha: 0.5 };
                     return { ...s, activeChannels: newActive, volumes: newVolumes };
                 });
             }

             engine.rampBinaural(start, end, duration);
        }
    };
}

export const zenStore = createZenStore();
