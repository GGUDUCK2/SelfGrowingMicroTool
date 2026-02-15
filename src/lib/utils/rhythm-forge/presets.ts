import type { SoundPack } from './types';

export interface RhythmPreset {
    name: string;
    description: string;
    bpm: number;
    signature: [number, number];
    polyrhythmEnabled: boolean;
    polyrhythm?: [number, number];
    soundPack: SoundPack;
}

export const BUILT_IN_PRESETS: RhythmPreset[] = [
    {
        name: "Standard 4/4",
        description: "The most common time signature in Western music.",
        bpm: 120,
        signature: [4, 4],
        polyrhythmEnabled: false,
        soundPack: 'click'
    },
    {
        name: "Waltz 3/4",
        description: "Classic waltz time.",
        bpm: 90,
        signature: [3, 4],
        polyrhythmEnabled: false,
        soundPack: 'wood'
    },
    {
        name: "Pass The Butter (3:4)",
        description: "Classic polyrhythm mnemonic. 3 beats in the space of 4.",
        bpm: 100,
        signature: [4, 4],
        polyrhythmEnabled: true,
        polyrhythm: [3, 4],
        soundPack: 'drum'
    },
    {
        name: "Hemiola (3:2)",
        description: "Two against three. Common in Baroque and Latin music.",
        bpm: 110,
        signature: [2, 4],
        polyrhythmEnabled: true,
        polyrhythm: [3, 2],
        soundPack: 'wood'
    },
    {
        name: "Cinillo / 5:4",
        description: "Five beats against four. Often found in jazz fusion.",
        bpm: 120,
        signature: [4, 4],
        polyrhythmEnabled: true,
        polyrhythm: [5, 4],
        soundPack: 'beep'
    },
    {
        name: "Compound 6/8",
        description: "Two groups of three eighth notes.",
        bpm: 80,
        signature: [6, 8],
        polyrhythmEnabled: false,
        soundPack: 'click'
    },
    {
        name: "Odd Meter 7/8",
        description: "Complex time signature, often counted as 3+2+2 or 2+2+3.",
        bpm: 140,
        signature: [7, 8],
        polyrhythmEnabled: false,
        soundPack: 'drum'
    }
];
