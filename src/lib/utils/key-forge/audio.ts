export class AudioEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Lazy init on first user interaction typically, but we can setup
    }
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.createNoiseBuffer();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.1; // 0.1s noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  playClick(type: string) {
    if (type === 'mute') return;

    this.init();
    if (!this.ctx || !this.noiseBuffer) return;

    const t = this.ctx.currentTime;

    if (type === 'mechanical') {
        // High pitched click (blue switch style)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(2000, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.05);

        // Clack (bottom out)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(300, t);
        osc2.frequency.exponentialRampToValueAtTime(50, t + 0.1);

        gain2.gain.setValueAtTime(0.1, t);
        gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);

        osc2.start(t);
        osc2.stop(t + 0.1);
    } else if (type === 'typewriter') {
        // More noise based
        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.value = 800;

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        source.start(t);
        source.stop(t + 0.1);
    } else if (type === 'laptop') {
        // Soft thud
         const osc = this.ctx.createOscillator();
         const gain = this.ctx.createGain();

         osc.type = 'sine';
         osc.frequency.setValueAtTime(200, t);
         osc.frequency.exponentialRampToValueAtTime(50, t + 0.05);

         gain.gain.setValueAtTime(0.2, t);
         gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

         osc.connect(gain);
         gain.connect(this.ctx.destination);

         osc.start(t);
         osc.stop(t + 0.05);
    }
  }
}

export const audioEngine = new AudioEngine();
