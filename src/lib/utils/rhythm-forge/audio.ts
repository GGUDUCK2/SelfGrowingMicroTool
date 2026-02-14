import type { RhythmSettings, BeatEvent, SoundPack } from './types';

export class MetronomeEngine {
  private audioContext: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerID: number | undefined;

  private nextPrimaryTime: number = 0.0;
  private nextSecondaryTime: number = 0.0;

  private primaryBeatCount: number = 0;
  private secondaryBeatCount: number = 0;

  private scheduleAheadTime: number = 0.1; // How far ahead to schedule audio (sec)
  private lookahead: number = 25.0; // How frequently to call scheduling function (ms)

  private settings: RhythmSettings;
  private onBeat: (event: BeatEvent) => void;

  constructor(settings: RhythmSettings, onBeat: (event: BeatEvent) => void) {
    this.settings = settings;
    this.onBeat = onBeat;
  }

  public updateSettings(newSettings: RhythmSettings) {
    const wasPlaying = this.isPlaying;

    // If BPM changed or Signature changed, we might need to reset calculations if we want to snap?
    // For smooth tempo change, we just let the next note time be.
    // However, if polyrhythm ratios change, we might want to reset the cycle?
    // For now, simple update.
    this.settings = newSettings;

    // Adjust volume immediately if playing
    // (Volume is applied at creation of oscillator, so this only affects next notes)
  }

  public async start() {
    if (this.isPlaying) return;

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isPlaying = true;
    this.primaryBeatCount = 0;
    this.secondaryBeatCount = 0;
    this.nextPrimaryTime = this.audioContext.currentTime + 0.1;
    this.nextSecondaryTime = this.audioContext.currentTime + 0.1; // Start synced

    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    window.clearTimeout(this.timerID);
  }

  private scheduler() {
    if (!this.audioContext) return;

    // while there are notes that will play this time interval
    while (this.nextPrimaryTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.nextPrimaryTime, 'primary', this.primaryBeatCount, this.settings.signature[0]);
      this.nextPrimary();
    }

    if (this.settings.polyrhythmEnabled && this.settings.polyrhythm) {
        while (this.nextSecondaryTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            // Avoid duplicating the downbeat if they align perfectly?
            // Usually 3:4 align at the 1.
            // If time is extremely close to primary, maybe skip or play different?
            // For now, let them play. The visualizer might overlap.

            const isDownbeat = this.secondaryBeatCount === 0;
            // If it's a downbeat, it aligns with primary downbeat usually.
            // We can play it, or let the primary take precedence visually.

            this.scheduleNote(this.nextSecondaryTime, 'secondary', this.secondaryBeatCount, this.settings.polyrhythm[0]);
            this.nextSecondary();
        }
    }

    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private nextPrimary() {
    const secondsPerBeat = 60.0 / this.settings.bpm;
    this.nextPrimaryTime += secondsPerBeat;
    this.primaryBeatCount = (this.primaryBeatCount + 1) % this.settings.signature[0];
  }

  private nextSecondary() {
    // Polyrhythm: Primary beats per bar / Secondary beats per bar
    // Bar duration = (60 / BPM) * PrimaryNumerator
    // Secondary Interval = BarDuration / SecondaryNumerator

    // Example: 4/4, BPM 60. Bar = 4s.
    // Poly 3:4 (3 against 4).
    // Secondary (3) interval = 4s / 3 = 1.33s.

    // Wait, the setting is [primary, secondary] ratio.
    // e.g. 3:4 means 3 beats in space of 4 beats.
    // Usually user selects "X : Y".
    // If X=3, Y=4.
    // Does it mean 3 notes in space of 4 notes?
    // Let's assume polyrhythm setting is "X over Y".
    // X notes playing while Y notes play.
    // Y is usually the primary time signature numerator? Or just a reference?

    // Let's assume the Polyrhythm setting is [X, Y].
    // And we map Y to the PRIMARY TIME SIGNATURE BAR.
    // No, that restricts it.

    // Simpler interpretation:
    // Primary is the metronome BPM.
    // Secondary is the polyrhythm.
    // If ratio is 3:2. (3 against 2).
    // 3 notes of Secondary in the time of 2 notes of Primary.

    // Primary Interval = 60/BPM.
    // 2 * PrimaryInterval = Duration.
    // Secondary Interval = Duration / 3.
    // Secondary Interval = (2 * (60/BPM)) / 3.

    if (!this.settings.polyrhythm) return;

    const [primaryRatio, secondaryRatio] = this.settings.polyrhythm;
    const secondsPerPrimaryBeat = 60.0 / this.settings.bpm;

    // Time for the cycle to complete
    // The "Cycle" duration is determined by the "secondaryRatio" number of primary beats?
    // No, usually "3 against 2" means 3 notes in the space of 2 notes.
    // So duration = secondaryRatio * secondsPerPrimaryBeat.
    // Interval = duration / primaryRatio.

    const cycleDuration = secondaryRatio * secondsPerPrimaryBeat;
    const secondsPerSecondaryBeat = cycleDuration / primaryRatio;

    this.nextSecondaryTime += secondsPerSecondaryBeat;
    this.secondaryBeatCount = (this.secondaryBeatCount + 1) % primaryRatio;
  }

  private scheduleNote(time: number, type: 'primary' | 'secondary', index: number, total: number) {
    if (!this.audioContext) return;

    // Create oscillator
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const isDownbeat = index === 0;

    // Sound Pack Logic
    this.configureSound(osc, gainNode, type, isDownbeat, time);

    osc.start(time);
    // Stop time is handled in configureSound

    // Schedule visualization
    // We use setTimeout to trigger the UI callback at the right time
    // But we need to account for the lookahead time difference
    // AudioContext.currentTime is the hardware time.
    // Performance.now() is the UI time.
    // They are not the same clock domain, but usually synchronized enough for visuals if we diff them.

    // Better approach: Use the AudioContext.currentTime to calculate delay
    const timeDelta = time - this.audioContext.currentTime;
    // Sanity check
    if (timeDelta >= 0) {
        setTimeout(() => {
            this.onBeat({
                time: Date.now(), // Use generic timestamp for React/Svelte
                type: isDownbeat ? 'downbeat' : type,
                index,
                total
            });
        }, timeDelta * 1000);
    }
  }

  private configureSound(osc: OscillatorNode, gain: GainNode, type: 'primary' | 'secondary', isDownbeat: boolean, time: number) {
      if (!this.audioContext) return;

      const vol = this.settings.volume;
      const pack = this.settings.soundPack;

      // Primary Downbeat: louder, higher pitch
      // Primary Beat: normal
      // Secondary: softer, different pitch

      if (pack === 'click') {
          osc.type = 'square'; // penetrating sound
          if (type === 'primary') {
              osc.frequency.value = isDownbeat ? 1500 : 1000;
              gain.gain.setValueAtTime(vol, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
              osc.stop(time + 0.05);
          } else {
              osc.frequency.value = 800;
              gain.gain.setValueAtTime(vol * 0.6, time); // Softer
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
              osc.stop(time + 0.05);
          }
      } else if (pack === 'beep') {
          osc.type = 'sine';
          if (type === 'primary') {
              osc.frequency.value = isDownbeat ? 880 : 440;
              gain.gain.setValueAtTime(vol, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
              osc.stop(time + 0.1);
          } else {
              osc.frequency.value = 330;
              gain.gain.setValueAtTime(vol * 0.6, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
              osc.stop(time + 0.1);
          }
      } else if (pack === 'wood') {
          osc.type = 'sine';
          // Simulate woodblock roughly with short sine burst
          if (type === 'primary') {
              osc.frequency.value = isDownbeat ? 1200 : 800;
              gain.gain.setValueAtTime(vol, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
              osc.stop(time + 0.03);
          } else {
              osc.frequency.value = 600;
              gain.gain.setValueAtTime(vol * 0.6, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
              osc.stop(time + 0.03);
          }
      } else if (pack === 'drum') {
          // Simple drum synth
          if (type === 'primary' && isDownbeat) {
              // Kick/Bass-ish
              osc.type = 'sine';
              osc.frequency.setValueAtTime(150, time);
              osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
              gain.gain.setValueAtTime(vol, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
              osc.stop(time + 0.1);
          } else if (type === 'primary') {
              // Snare-ish (High sine + noise would be better but keeping simple)
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(200, time);
              gain.gain.setValueAtTime(vol * 0.8, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
              osc.stop(time + 0.05);
          } else {
              // Hi-hat-ish (High square)
              osc.type = 'square';
              osc.frequency.setValueAtTime(800, time);
              // Filter would be nice but sticking to basic oscillators
              gain.gain.setValueAtTime(vol * 0.4, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
              osc.stop(time + 0.02);
          }
      }
  }
}
