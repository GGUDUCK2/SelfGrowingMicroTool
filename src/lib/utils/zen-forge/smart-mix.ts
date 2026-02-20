import type { SoundId } from '$lib/types/zen-forge';

export interface TrackConfig {
    id: SoundId;
    volume: number;
    muted: boolean;
}

export const SMART_MIX_TAGS = ['focus', 'sleep', 'relax', 'meditate', 'creative'] as const;
export type SmartMixTag = typeof SMART_MIX_TAGS[number];

export function generateSmartMix(tag: SmartMixTag): TrackConfig[] {
    const tracks: TrackConfig[] = [];

    // Helper to add track with probability
    const add = (id: SoundId, probability: number, minVol: number, maxVol: number) => {
        if (Math.random() < probability) {
            tracks.push({
                id,
                volume: Number((minVol + Math.random() * (maxVol - minVol)).toFixed(2)),
                muted: false
            });
        }
    };

    switch (tag) {
        case 'focus':
            add('pink', 0.8, 0.3, 0.5);
            add('rain', 0.6, 0.4, 0.6);
            add('binaural_alpha', 0.9, 0.4, 0.6);
            add('wind', 0.4, 0.2, 0.4);
            break;
        case 'sleep':
            add('brown', 0.9, 0.4, 0.6);
            add('rain', 0.7, 0.3, 0.5);
            add('binaural_delta', 1.0, 0.5, 0.7);
            add('wind', 0.3, 0.1, 0.3);
            break;
        case 'relax':
            add('rain', 0.8, 0.4, 0.7);
            add('wind', 0.6, 0.2, 0.5);
            add('binaural_theta', 0.7, 0.4, 0.6);
            add('drone', 0.4, 0.2, 0.4);
            break;
        case 'meditate':
            add('drone', 0.9, 0.3, 0.6);
            add('binaural_theta', 0.9, 0.5, 0.7);
            add('wind', 0.5, 0.2, 0.4);
            add('white', 0.2, 0.05, 0.1);
            break;
        case 'creative':
            add('white', 0.4, 0.1, 0.3);
            add('rain', 0.5, 0.3, 0.6);
            add('binaural_alpha', 0.8, 0.4, 0.6);
            add('wind', 0.6, 0.3, 0.6);
            break;
    }

    // Ensure at least one track
    if (tracks.length === 0) {
        add('pink', 1.0, 0.5, 0.5);
    }

    return tracks;
}
