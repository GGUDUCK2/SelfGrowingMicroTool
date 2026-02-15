import { db } from '$lib/db';
import type { RhythmSettings } from './types';

export class SessionTracker {
    private startTime: number | null = null;

    start() {
        this.startTime = Date.now();
    }

    stop() {
        if (!this.startTime) return 0;
        const duration = (Date.now() - this.startTime) / 1000;
        this.startTime = null;
        return duration;
    }

    async save(settings: RhythmSettings, duration: number) {
        if (duration < 5) return; // Ignore very short sessions

        await db.rhythmForgeSessions.add({
            bpm: settings.bpm,
            duration,
            accuracy: 0, // Not applicable for standard metronome mode
            avgOffset: 0,
            createdAt: new Date()
        });
    }
}
