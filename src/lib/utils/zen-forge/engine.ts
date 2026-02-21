import type { SoundId } from '$lib/types/zen-forge';

export type { SoundId };

interface StoppableAudioNode extends AudioNode {
    stop?: (when?: number) => void;
}

interface Channel {
    gain: GainNode; // User volume
    modGain: GainNode; // Modulation (breathing, etc)
    source: StoppableAudioNode | null; // Null if it's an impulse channel
    isPlaying: boolean;
    type: 'static' | 'impulse';
    impulseId?: string; // For impulse manager
    oscillators?: OscillatorNode[]; // For dynamic control (e.g. binaural)
}

class ImpulseManager {
    context: AudioContext;
    output: GainNode;
    activeImpulses: Map<string, { density: number, interval: number, nextTime: number }> = new Map();
    engine: ZenEngine;
    private isRunning = false;

    constructor(context: AudioContext, output: GainNode, engine: ZenEngine) {
        this.context = context;
        this.output = output;
        this.engine = engine;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.loop();
    }

    stop() {
        this.isRunning = false;
        this.activeImpulses.clear();
    }

    add(id: string, density: number) {
        // density 0-1.
        // Map density to average interval.
        // 0.1 -> 30s, 1.0 -> 2s
        const interval = 30000 - (density * 28000);
        this.activeImpulses.set(id, {
            density,
            interval,
            nextTime: performance.now() + Math.random() * 2000 // Start soon
        });
        if (!this.isRunning) this.start();
    }

    updateDensity(id: string, density: number) {
        if (this.activeImpulses.has(id)) {
            const imp = this.activeImpulses.get(id)!;
            imp.density = density;
            imp.interval = 30000 - (density * 28000);
        }
    }

    remove(id: string) {
        this.activeImpulses.delete(id);
        if (this.activeImpulses.size === 0) {
            this.stop();
        }
    }

    private loop = () => {
        if (!this.isRunning) return;

        const now = performance.now();
        this.activeImpulses.forEach((imp, id) => {
            if (now >= imp.nextTime) {
                this.trigger(id);
                // Randomize next interval based on average interval
                const variance = imp.interval * 0.5;
                const next = imp.interval + (Math.random() * variance - variance/2);
                imp.nextTime = now + Math.max(1000, next);
            }
        });

        requestAnimationFrame(this.loop);
    }

    private trigger(id: string) {
        // Trigger sound based on ID
        switch (id) {
            case 'thunder':
                this.engine.playThunder();
                break;
            case 'birds':
                this.engine.playBird();
                break;
            case 'chimes':
                this.engine.playChimeSound();
                break;
            case 'crickets':
                this.engine.playCricket();
                break;
            case 'fire':
                this.engine.playFireCrack();
                break;
        }
    }
}

class Recorder {
    mediaRecorder: MediaRecorder | null = null;
    chunks: Blob[] = [];
    destination: MediaStreamAudioDestinationNode | null = null;

    constructor(context: AudioContext, sourceNode: AudioNode) {
        this.destination = context.createMediaStreamDestination();
        sourceNode.connect(this.destination);
    }

    start() {
        if (!this.destination) return;
        this.chunks = [];
        try {
            this.mediaRecorder = new MediaRecorder(this.destination.stream);
        } catch (e) {
            console.error('MediaRecorder not supported or failed', e);
            return;
        }

        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.chunks.push(e.data);
        };

        this.mediaRecorder.start();
    }

    stop(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') return reject('No active recorder');

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.chunks, { type: 'audio/webm' });
                this.chunks = [];
                resolve(blob);
            };

            this.mediaRecorder.stop();
        });
    }
}

export class ZenEngine {
    context: AudioContext | null = null;
    masterGain: GainNode | null = null;
    channels: Map<string, Channel> = new Map();
    impulseManager: ImpulseManager | null = null;
    recorder: Recorder | null = null;

    init() {
        if (!this.context) {
            // Check for AudioContext support
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioContextClass) {
                console.error("AudioContext is not supported in this browser.");
                return;
            }
            this.context = new AudioContextClass();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);

            this.impulseManager = new ImpulseManager(this.context, this.masterGain, this);
            this.recorder = new Recorder(this.context, this.masterGain);
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    createNoise(type: 'white' | 'pink' | 'brown'): AudioBufferSourceNode {
        if (!this.context) throw new Error("AudioContext not initialized");
        const bufferSize = 2 * this.context.sampleRate; // 2 seconds buffer
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const output = buffer.getChannelData(0);

        if (type === 'white') {
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
        } else if (type === 'pink') {
             let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
             for (let i = 0; i < bufferSize; i++) {
                 const white = Math.random() * 2 - 1;
                 b0 = 0.99886 * b0 + white * 0.0555179;
                 b1 = 0.99332 * b1 + white * 0.0750759;
                 b2 = 0.96900 * b2 + white * 0.1538520;
                 b3 = 0.86650 * b3 + white * 0.3104856;
                 b4 = 0.55000 * b4 + white * 0.5329522;
                 b5 = -0.7616 * b5 - white * 0.0168980;
                 output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                 output[i] *= 0.11; // (roughly) compensate for gain
                 b6 = white * 0.115926;
             }
        } else if (type === 'brown') {
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5; // (roughly) compensate for gain
            }
        }

        const noise = this.context.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        return noise;
    }

    // --- Static Sound Generators ---

    createRain(): StoppableAudioNode {
        const noise = this.createNoise('pink');
        const lp = this.context!.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 800;
        const hp = this.context!.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 200;

        noise.connect(lp);
        lp.connect(hp);
        noise.start();

        const output = this.context!.createGain() as StoppableAudioNode;
        hp.connect(output);

        output.stop = () => { noise.stop(); };
        return output;
    }

    createWind(): StoppableAudioNode {
        const noise = this.createNoise('pink');
        const bp = this.context!.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 400;
        bp.Q.value = 1; // Wide

        const lfo = this.context!.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Slow
        const lfoGain = this.context!.createGain();
        lfoGain.gain.value = 200; // Modulate by +/- 200Hz

        lfo.connect(lfoGain);
        lfoGain.connect(bp.frequency);
        lfo.start();
        noise.start();
        noise.connect(bp);

        const output = this.context!.createGain() as StoppableAudioNode;
        bp.connect(output);

        output.stop = () => { noise.stop(); lfo.stop(); };
        return output;
    }

    createBinaural(baseFreq: number, beatFreq: number): { node: StoppableAudioNode, oscs: OscillatorNode[] } {
        const merger = this.context!.createChannelMerger(2);

        const oscL = this.context!.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.value = baseFreq;
        const panL = this.context!.createStereoPanner();
        panL.pan.value = -1;
        oscL.connect(panL);
        panL.connect(merger, 0, 0);

        const oscR = this.context!.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.value = baseFreq + beatFreq;
        const panR = this.context!.createStereoPanner();
        panR.pan.value = 1;
        oscR.connect(panR);
        panR.connect(merger, 0, 1);

        oscL.start();
        oscR.start();

        const output = this.context!.createGain() as StoppableAudioNode;
        merger.connect(output);
        output.stop = () => { oscL.stop(); oscR.stop(); };

        return { node: output, oscs: [oscL, oscR] };
    }

    createDrone(): StoppableAudioNode {
         const osc = this.context!.createOscillator();
         osc.type = 'triangle';
         osc.frequency.value = 55; // Low A
         const lp = this.context!.createBiquadFilter();
         lp.type = 'lowpass';
         lp.frequency.value = 120;

         const osc2 = this.context!.createOscillator();
         osc2.type = 'sawtooth';
         osc2.frequency.value = 55.5;

         const gain = this.context!.createGain();
         gain.gain.value = 0.3;

         osc.connect(lp);
         osc2.connect(lp);
         lp.connect(gain);

         osc.start();
         osc2.start();

         const output = this.context!.createGain() as StoppableAudioNode;
         gain.connect(output);

         output.stop = () => { osc.stop(); osc2.stop(); };
         return output;
    }

    // --- Impulse Sound Generators ---

    playThunder() {
        if (!this.context || !this.masterGain) return;
        const t = this.context.currentTime;

        const noise = this.createNoise('pink');
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);

        const gain = this.context.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(1, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 3.0);

        noise.connect(filter);
        filter.connect(gain);

        const ch = this.channels.get('thunder');
        if (ch) {
            gain.connect(ch.gain);
        } else {
            gain.connect(this.masterGain);
        }

        noise.start();
        noise.stop(t + 4);
    }

    playBird() {
        if (!this.context) return;
        const t = this.context.currentTime;

        const osc = this.context.createOscillator();
        const mod = this.context.createOscillator();
        const modGain = this.context.createGain();
        const gain = this.context.createGain();

        // Randomize bird
        const baseFreq = 2000 + Math.random() * 2000;

        mod.frequency.value = 10 + Math.random() * 20; // 10-30Hz FM
        modGain.gain.value = 500;

        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.linearRampToValueAtTime(baseFreq * 0.8, t + 0.3);

        mod.connect(modGain);
        modGain.connect(osc.frequency);

        osc.connect(gain);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        const ch = this.channels.get('birds');
        if (ch) gain.connect(ch.gain);
        else gain.connect(this.masterGain!);

        osc.start();
        mod.start();
        osc.stop(t + 0.5);
        mod.stop(t + 0.5);
    }

    playChimeSound() {
        if (!this.context) return;
        const t = this.context.currentTime;

        const baseFreq = 1500 + Math.random() * 500;
        const ratios = [1, 1.42, 2.7, 4.1];

        const ch = this.channels.get('chimes');
        const dest = ch ? ch.gain : this.masterGain!;

        ratios.forEach((r, i) => {
            const osc = this.context!.createOscillator();
            const gain = this.context!.createGain();

            osc.frequency.value = baseFreq * r;
            osc.type = 'sine';

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.1 / (i + 1), t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 3 + Math.random() * 2);

            osc.connect(gain);
            gain.connect(dest);

            osc.start();
            osc.stop(t + 6);
        });
    }

    playCricket() {
        if (!this.context) return;
        const t = this.context.currentTime;

        const osc = this.context.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 4000 + Math.random() * 500;

        const gain = this.context.createGain();
        const ch = this.channels.get('crickets');
        const dest = ch ? ch.gain : this.masterGain!;

        // Pulse modulation
        const lfo = this.context.createOscillator();
        lfo.type = 'square';
        lfo.frequency.value = 30 + Math.random() * 10;

        const lfoGain = this.context.createGain();
        lfoGain.gain.value = 1;

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain); // AM modulation

        osc.connect(gain);
        gain.connect(dest);

        // Envelope
        const masterEnv = this.context.createGain();
        masterEnv.gain.setValueAtTime(0, t);
        masterEnv.gain.linearRampToValueAtTime(0.1, t + 0.1);
        masterEnv.gain.linearRampToValueAtTime(0, t + 0.5);

        gain.disconnect();
        gain.connect(masterEnv);
        masterEnv.connect(dest);

        osc.start();
        lfo.start();
        osc.stop(t + 0.6);
        lfo.stop(t + 0.6);
    }

    playFireCrack() {
        if (!this.context) return;
        const t = this.context.currentTime;

        const noise = this.createNoise('brown');
        const gain = this.context.createGain();

        // Very short burst
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.8, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        const ch = this.channels.get('fire');
        const dest = ch ? ch.gain : this.masterGain!;

        noise.connect(gain);
        gain.connect(dest);

        noise.start();
        noise.stop(t + 0.1);
    }

    // --- Control Methods ---

    toggle(id: SoundId, volume: number = 0.5): boolean {
        this.init();

        const isImpulse = ['thunder', 'birds', 'chimes', 'crickets', 'fire'].includes(id);

        if (this.channels.has(id)) {
            // Stop
            const ch = this.channels.get(id)!;

            if (ch.type === 'static' && ch.source) {
                const now = this.context!.currentTime;
                ch.gain.gain.cancelScheduledValues(now);
                ch.gain.gain.setValueAtTime(ch.gain.gain.value, now);
                ch.gain.gain.linearRampToValueAtTime(0, now + 0.1);

                setTimeout(() => {
                    if (ch.source?.stop) ch.source.stop();
                    ch.source?.disconnect();
                    ch.gain.disconnect();
                    ch.modGain.disconnect();
                }, 150);
            } else if (ch.type === 'impulse') {
                this.impulseManager?.remove(id);
                ch.gain.disconnect();
                ch.modGain.disconnect();
            }

            this.channels.delete(id);
            return false; // stopped
        } else {
            // Setup Gain Chain
            const gain = this.context!.createGain();
            gain.gain.value = isImpulse ? 1 : 0; // Impulse uses gain for master volume of that channel
            gain.connect(this.masterGain!);

            const modGain = this.context!.createGain();
            modGain.gain.value = 1;
            modGain.connect(gain);

            let oscillators: OscillatorNode[] = [];

            if (isImpulse) {
                // Register with Impulse Manager
                this.impulseManager?.add(id, volume); // volume here acts as density
                this.channels.set(id, {
                    gain,
                    modGain,
                    source: null,
                    isPlaying: true,
                    type: 'impulse',
                    impulseId: id
                });
            } else {
                // Static sound
                let source: StoppableAudioNode;
                switch (id) {
                    case 'white':
                    case 'pink':
                    case 'brown':
                        source = this.createNoise(id);
                        break;
                    case 'rain':
                        source = this.createRain();
                        break;
                    case 'wind':
                        source = this.createWind();
                        break;
                    case 'binaural_alpha': {
                         const bin = this.createBinaural(200, 10);
                         source = bin.node;
                         oscillators = bin.oscs;
                         break;
                    }
                    case 'binaural_theta': {
                         const bin = this.createBinaural(200, 6);
                         source = bin.node;
                         oscillators = bin.oscs;
                         break;
                    }
                    case 'binaural_delta': {
                         const bin = this.createBinaural(200, 2);
                         source = bin.node;
                         oscillators = bin.oscs;
                         break;
                    }
                     case 'drone':
                         source = this.createDrone();
                         break;
                     default:
                        throw new Error("Unknown sound id: " + id);
                }

                source.connect(modGain);
                if ((source as unknown as { start?: () => void }).start && id.includes('noise')) (source as AudioBufferSourceNode).start();

                // Fade in
                const now = this.context!.currentTime;
                gain.gain.linearRampToValueAtTime(volume, now + 0.5);

                this.channels.set(id, {
                    gain,
                    modGain,
                    source,
                    isPlaying: true,
                    type: 'static',
                    oscillators
                });
            }
            return true; // playing
        }
    }

    setVolume(id: SoundId, value: number) {
        const ch = this.channels.get(id);
        if (ch) {
            if (ch.type === 'static') {
                const now = this.context!.currentTime;
                ch.gain.gain.cancelScheduledValues(now);
                ch.gain.gain.linearRampToValueAtTime(value, now + 0.1);
            } else {
                // For impulse, value is density
                this.impulseManager?.updateDensity(id, value);
            }
        }
    }

    setMasterVolume(value: number) {
        if (!this.masterGain) return;
        const now = this.context!.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(value, now + 0.1);
    }

    setBinauralBeat(freq: number) {
        if (!this.context) return;
        // Check active binaural channels and update them
        ['binaural_alpha', 'binaural_theta', 'binaural_delta'].forEach(id => {
            const ch = this.channels.get(id as SoundId);
            if (ch && ch.oscillators && ch.oscillators.length === 2) {
                const baseFreq = 200; // Fixed base for now
                const now = this.context!.currentTime;

                ch.oscillators[0].frequency.linearRampToValueAtTime(baseFreq, now + 0.5);
                ch.oscillators[1].frequency.linearRampToValueAtTime(baseFreq + freq, now + 0.5);
            }
        });
    }

    rampBinaural(startFreq: number, endFreq: number, duration: number) {
        if (!this.context) return;
        ['binaural_alpha', 'binaural_theta', 'binaural_delta'].forEach(id => {
            const ch = this.channels.get(id as SoundId);
            if (ch && ch.oscillators && ch.oscillators.length === 2) {
                const now = this.context!.currentTime;
                const baseFreq = 200;
                const osc = ch.oscillators[1];
                osc.frequency.cancelScheduledValues(now);
                osc.frequency.setValueAtTime(baseFreq + startFreq, now);
                osc.frequency.linearRampToValueAtTime(baseFreq + endFreq, now + duration);
            }
        });
    }

    setModulation(id: SoundId, value: number, rampTime: number = 0.1) {
        const ch = this.channels.get(id);
        if (ch) {
            const now = this.context!.currentTime;
            ch.modGain.gain.cancelScheduledValues(now);
            ch.modGain.gain.linearRampToValueAtTime(value, now + rampTime);
        }
    }

    startRecording() {
        this.init();
        this.recorder?.start();
    }

    async stopRecording(): Promise<Blob | null> {
        if (!this.recorder) return null;
        return await this.recorder.stop();
    }

    stopAll() {
        this.channels.forEach((ch, id) => {
            if (ch.type === 'static' && ch.source) {
                if (ch.source.stop) ch.source.stop();
                ch.source.disconnect();
            } else if (ch.type === 'impulse') {
                this.impulseManager?.remove(id);
            }
            ch.gain.disconnect();
            ch.modGain.disconnect();
        });
        this.channels.clear();
    }

    fadeOut(duration: number) {
        if (!this.masterGain || !this.context) return;
        const now = this.context.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0, now + duration);
    }

    dispose() {
        this.stopAll();
        this.impulseManager?.stop();
        if (this.context) {
            this.context.close();
            this.context = null;
        }
    }

    playChime() {
        this.init();
        if (!this.context || !this.masterGain) return;

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const t = this.context.currentTime;

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.frequency.setValueAtTime(880, t); // High A
        osc.frequency.exponentialRampToValueAtTime(440, t + 1.5);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 2);

        osc.start();
        osc.stop(t + 2);
    }
}

export const engine = new ZenEngine();
