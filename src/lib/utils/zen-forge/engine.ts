import type { SoundId } from '$lib/types/zen-forge';

export type { SoundId };

interface StoppableAudioNode extends AudioNode {
    stop?: (when?: number) => void;
}

interface Channel {
    gain: GainNode; // User volume
    modGain: GainNode; // Modulation (breathing, etc)
    source: StoppableAudioNode;
    isPlaying: boolean;
}

export class ZenEngine {
    context: AudioContext | null = null;
    masterGain: GainNode | null = null;
    channels: Map<string, Channel> = new Map();

    init() {
        if (!this.context) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.context = new AudioContextClass();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
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

        // Wrap in gain for consistent API
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

        // LFO for wind modulation
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

    createBinaural(baseFreq: number, beatFreq: number): StoppableAudioNode {
        const merger = this.context!.createChannelMerger(2);

        // Left
        const oscL = this.context!.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.value = baseFreq;
        const panL = this.context!.createStereoPanner();
        panL.pan.value = -1;
        oscL.connect(panL);
        panL.connect(merger, 0, 0);

        // Right
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
        return output;
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
         gain.gain.value = 0.3; // Drone should be quieter by default

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

    toggle(id: SoundId, volume: number = 0.5): boolean {
        this.init(); // Ensure context is ready

        if (this.channels.has(id)) {
            // Stop
            const ch = this.channels.get(id)!;
            // Fade out
            const now = this.context!.currentTime;
            ch.gain.gain.cancelScheduledValues(now);
            ch.gain.gain.setValueAtTime(ch.gain.gain.value, now);
            ch.gain.gain.linearRampToValueAtTime(0, now + 0.1);

            setTimeout(() => {
                if (ch.source.stop) ch.source.stop();
                ch.source.disconnect();
                ch.gain.disconnect();
                ch.modGain.disconnect();
            }, 150);

            this.channels.delete(id);
            return false; // stopped
        } else {
            const gain = this.context!.createGain();
            gain.gain.value = 0;
            gain.connect(this.masterGain!);

            const modGain = this.context!.createGain();
            modGain.gain.value = 1;
            modGain.connect(gain);

            let source: StoppableAudioNode;

            switch (id) {
                case 'white':
                case 'pink':
                case 'brown':
                    source = this.createNoise(id);
                    source.connect(modGain);
                    (source as AudioBufferSourceNode).start();
                    break;
                case 'rain':
                    source = this.createRain();
                    source.connect(modGain);
                    break;
                case 'wind':
                    source = this.createWind();
                    source.connect(modGain);
                    break;
                case 'binaural_alpha':
                     source = this.createBinaural(200, 10); // Alpha 10Hz
                     source.connect(modGain);
                     break;
                case 'binaural_theta':
                     source = this.createBinaural(200, 6); // Theta 6Hz
                     source.connect(modGain);
                     break;
                case 'binaural_delta':
                     source = this.createBinaural(200, 2); // Delta 2Hz
                     source.connect(modGain);
                     break;
                 case 'drone':
                     source = this.createDrone();
                     source.connect(modGain);
                     break;
                 default:
                    throw new Error("Unknown sound id");
            }

            // Fade in
            const now = this.context!.currentTime;
            gain.gain.linearRampToValueAtTime(volume, now + 0.5);

            this.channels.set(id, { gain, modGain, source, isPlaying: true });
            return true; // playing
        }
    }

    setVolume(id: SoundId, value: number) {
        const ch = this.channels.get(id);
        if (ch) {
            const now = this.context!.currentTime;
            ch.gain.gain.cancelScheduledValues(now);
            ch.gain.gain.linearRampToValueAtTime(value, now + 0.1);
        }
    }

    setMasterVolume(value: number) {
        if (!this.masterGain) return;
        const now = this.context!.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(value, now + 0.1);
    }

    setModulation(id: SoundId, value: number, rampTime: number = 0.1) {
        const ch = this.channels.get(id);
        if (ch) {
            const now = this.context!.currentTime;
            ch.modGain.gain.cancelScheduledValues(now);
            ch.modGain.gain.linearRampToValueAtTime(value, now + rampTime);
        }
    }

    stopAll() {
        this.channels.forEach((ch) => {
            if (ch.source.stop) ch.source.stop();
            ch.source.disconnect();
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
        if (this.context) {
            this.context.close();
            this.context = null;
        }
    }

    playChime() {
        this.init();
        const osc = this.context!.createOscillator();
        const gain = this.context!.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.frequency.setValueAtTime(880, this.context!.currentTime); // High A
        osc.frequency.exponentialRampToValueAtTime(440, this.context!.currentTime + 1.5);

        gain.gain.setValueAtTime(0, this.context!.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, this.context!.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context!.currentTime + 2);

        osc.start();
        osc.stop(this.context!.currentTime + 2);
    }
}

export const engine = new ZenEngine();
