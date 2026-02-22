export type SoundId = 'white' | 'pink' | 'brown' | 'rain' | 'wind' | 'binaural_alpha' | 'binaural_theta' | 'binaural_delta' | 'drone' | 'thunder' | 'birds' | 'chimes' | 'crickets' | 'fire';

export interface ZenForgeMix {
    id?: number;
    name: string;
    tracks: { id: string; volume: number; muted: boolean }[];
    binauralFreq?: number;
    createdAt: Date;
    starred?: number;
}

export interface ZenForgeDictionary {
    title: string;
    description: string;
    sounds: {
        [key in SoundId]: string;
    };
    controls: {
        master: string;
        timer: string;
        play: string;
        pause: string;
        reset: string;
        presets: string;
        visualizer: string;
        save: string;
        saved: string;
        mixName: string;
        record: string;
        recording: string;
        stopRecord: string;
        binauralFreq: string;
        fadeTimer: string;
        focusMode?: string;
        spatialAudio?: string;
        share?: string;
        shared?: string;
    };
    events: {
        title: string;
        density: string;
    };
    smartMix: {
        title: string;
        focus: string;
        relax: string;
        sleep: string;
        meditate: string;
    };
    history: {
        system: string;
        user: string;
        empty: string;
    };
    timerDict: {
        start: string;
        stop: string;
        min: string;
        remaining: string;
        fadeOut: string;
        journey?: string;
        chime?: string;
        startFreq?: string;
        endFreq?: string;
        interval?: string;
    };
    breathing: {
        start: string;
        inhale: string;
        hold: string;
        exhale: string;
    };
    presets: {
        focus: string;
        sleep: string;
        meditate: string;
        storm: string;
        coding: string;
    };
    guide: {
        title: string;
        intro: string;
        featuresTitle: string;
        f1: string;
        f2: string;
        f3: string;
        tipsTitle: string;
        tip1: string;
        tip2: string;
        tip3: string;
    };
    faqTitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
}
