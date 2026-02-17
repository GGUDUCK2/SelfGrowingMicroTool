import { writable, get } from 'svelte/store';
import type { KeyForgeState, GameConfig, Language } from './types';
import { commonWords, codeSnippets, quotes } from './content';

function generateContent(config: GameConfig): string {
    if (config.mode === 'words') {
        const words = [];
        for (let i = 0; i < config.wordCount; i++) {
            words.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
        }
        return words.join(' ');
    } else if (config.mode === 'quote') {
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        return q.text;
    } else if (config.mode === 'zen') {
        const words = [];
        for (let i = 0; i < 50; i++) {
            words.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
        }
        return words.join(' ');
    } else {
        // Time mode or Code mode
        if (config.language !== 'english') {
            const snippets = codeSnippets[config.language as keyof typeof codeSnippets];
            if (snippets) {
                 return snippets[Math.floor(Math.random() * snippets.length)];
            }
        }
        // Fallback to words for time mode english
        const words = [];
        const count = 50;
        for (let i = 0; i < count; i++) {
            words.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
        }
        return words.join(' ');
    }
}

export class KeyForgeEngine {
    state = writable<KeyForgeState>({
        mode: 'time',
        language: 'english',
        content: '',
        originalContent: '',
        input: '',
        cursor: 0,
        startTime: null,
        endTime: null,
        wpm: 0,
        rawWpm: 0,
        accuracy: 100,
        consistency: 0,
        errors: 0,
        timeRemaining: 0,
        isFinished: false,
        isRunning: false,
        keystrokes: []
    });

    config: GameConfig;
    timer: any = null;

    constructor(config: GameConfig) {
        this.config = config;
        this.reset();
    }

    reset() {
        const content = generateContent(this.config);
        this.state.set({
            mode: this.config.mode,
            language: this.config.language,
            content: content,
            originalContent: content,
            input: '',
            cursor: 0,
            startTime: null,
            endTime: null,
            wpm: 0,
            rawWpm: 0,
            accuracy: 100,
            consistency: 0,
            errors: 0,
            timeRemaining: this.config.mode === 'time' ? this.config.duration : 0,
            isFinished: false,
            isRunning: false,
            keystrokes: []
        });
        if (this.timer) clearInterval(this.timer);
    }

    start() {
        this.state.update(s => ({ ...s, isRunning: true, startTime: Date.now() }));
        if (this.config.mode === 'time') {
            this.timer = setInterval(() => {
                this.state.update(s => {
                    const remaining = s.timeRemaining - 1;
                    if (remaining <= 0) {
                        this.finish();
                        return { ...s, timeRemaining: 0 };
                    }
                    this.calculateStats();
                    return { ...s, timeRemaining: remaining };
                });
            }, 1000);
        } else {
             this.timer = setInterval(() => {
                 this.calculateStats();
             }, 100);
        }
    }

    finish() {
        if (this.timer) clearInterval(this.timer);
        this.calculateStats();
        this.state.update(s => ({ ...s, isRunning: false, isFinished: true, endTime: Date.now() }));
    }

    appendContent() {
        const more = generateContent(this.config);
        this.state.update(s => ({ ...s, content: s.content + (this.config.language === 'english' ? ' ' : '\n\n') + more }));
    }

    type(char: string) {
        const s = get(this.state);
        if (s.isFinished) return;

        if (!s.isRunning) {
            this.start();
        }

        if (char === 'Backspace') {
             if (s.input.length > 0) {
                 this.state.update(st => ({
                     ...st,
                     input: st.input.slice(0, -1),
                     cursor: st.cursor - 1
                 }));
             }
             return;
        }

        if (char.length !== 1) return;

        const newInput = s.input + char;
        const newCursor = s.cursor + 1;
        const now = Date.now();

        const targetChar = s.content[s.cursor];
        let errors = s.errors;
        if (char !== targetChar) {
            errors++;
        }

        const keystrokes = [...s.keystrokes, now];

        this.state.update(st => ({
            ...st,
            input: newInput,
            cursor: newCursor,
            errors: errors,
            keystrokes: keystrokes
        }));

        this.calculateStats();

        if ((this.config.mode === 'time' || this.config.mode === 'zen') && (s.content.length - newCursor < 20)) {
             this.appendContent();
        }

        if (this.config.mode !== 'time' && this.config.mode !== 'zen') {
            if (newInput.length >= s.content.length) {
                this.finish();
            }
        }
    }

    calculateStats() {
        this.state.update(s => {
            if (!s.startTime) return s;
            const now = s.endTime || Date.now();
            const durationMin = (now - s.startTime) / 60000;

            if (durationMin <= 0) return s;

            const rawWpm = Math.round((s.input.length / 5) / durationMin);
            const accuracy = s.input.length > 0 ? Math.max(0, 100 - ((s.errors / s.input.length) * 100)) : 100;
            const wpm = Math.round(rawWpm * (accuracy / 100));

            let consistency = 0;
            if (s.keystrokes.length > 1) {
                const intervals = [];
                for(let i=1; i<s.keystrokes.length; i++) {
                    intervals.push(s.keystrokes[i] - s.keystrokes[i-1]);
                }
                const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
                const sd = Math.sqrt(variance);
                consistency = Math.max(0, Math.round(100 - (sd / 2)));
            }

            return {
                ...s,
                wpm,
                rawWpm,
                accuracy: Math.round(accuracy),
                consistency
            };
        });
    }

    setConfig(newConfig: Partial<GameConfig>) {
        this.config = { ...this.config, ...newConfig };
        this.reset();
    }
}
