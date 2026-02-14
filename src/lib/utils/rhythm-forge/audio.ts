import type { RhythmSettings, BeatEvent, SoundPack } from './types';

export class MetronomeEngine {
  private audioContext: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerID: number | undefined;

  private nextPrimaryTime: number = 0.0;
  private nextSecondaryTime: number = 0.0;

  private primaryBeatCount: number = 0;
  private secondaryBeatCount: number = 0;

  private totalBars: number = 0;
  private barsSinceIncrement: number = 0;

  private scheduleAheadTime: number = 0.1; // How far ahead to schedule audio (sec)
  private lookahead: number = 25.0; // How frequently to call scheduling function (ms)

  private settings: RhythmSettings;
  private onBeat: (event: BeatEvent) => void;
  private onBpmChange?: (bpm: number) => void;

  constructor(
      settings: RhythmSettings,
      onBeat: (event: BeatEvent) => void,
      onBpmChange?: (bpm: number) => void
  ) {
    this.settings = settings;
    this.onBeat = onBeat;
    this.onBpmChange = onBpmChange;
  }

  public updateSettings(newSettings: RhythmSettings) {
    // Keep internal counters if we are just updating settings while playing?
    // If we stop and start, they reset.
    // If we change settings while playing, we probably want to keep the "flow" but maybe reset bars counter if logic implies?
    // For now, simple update.
    this.settings = newSettings;
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
    this.totalBars = 0;
    this.barsSinceIncrement = 0;

    // Start slightly in future
    const startTime = this.audioContext.currentTime + 0.1;
    this.nextPrimaryTime = startTime;
    this.nextSecondaryTime = startTime;

    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerID) {
      window.clearTimeout(this.timerID);
      this.timerID = undefined;
    }
  }

  public dispose() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private scheduler() {
    if (!this.audioContext) return;

    while (this.nextPrimaryTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.nextPrimaryTime, 'primary', this.primaryBeatCount, this.settings.signature[0]);
      this.nextPrimary();
    }

    if (this.settings.polyrhythmEnabled && this.settings.polyrhythm) {
        while (this.nextSecondaryTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            const [polyNotes, referenceNotes] = this.settings.polyrhythm;
            if (polyNotes > 0) {
               // Ghost mode only applies to primary rhythm usually, but let's apply to everything for now
               // or maybe just primary? "Gap Click" usually mutes everything.
               this.scheduleNote(this.nextSecondaryTime, 'secondary', this.secondaryBeatCount, polyNotes);
               this.nextSecondary();
            } else {
               break;
            }
        }
    }

    if (this.isPlaying) {
        this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  private nextPrimary() {
    const secondsPerBeat = 60.0 / this.settings.bpm;
    this.nextPrimaryTime += secondsPerBeat;

    this.primaryBeatCount++;
    if (this.primaryBeatCount >= this.settings.signature[0]) {
        this.primaryBeatCount = 0;
        this.totalBars++;

        // Speed Trainer Logic
        if (this.settings.trainer && this.settings.trainer.enabled) {
            this.barsSinceIncrement++;
            if (this.barsSinceIncrement >= this.settings.trainer.interval) {
                this.barsSinceIncrement = 0;
                const newBpm = this.settings.bpm + this.settings.trainer.increment;
                if (
                    (this.settings.trainer.increment > 0 && newBpm <= this.settings.trainer.endBpm) ||
                    (this.settings.trainer.increment < 0 && newBpm >= this.settings.trainer.endBpm)
                ) {
                    this.settings.bpm = newBpm;
                    if (this.onBpmChange) this.onBpmChange(newBpm);
                }
            }
        }
    }
  }

  private nextSecondary() {
    if (!this.settings.polyrhythm) return;
    const [polyNotes, referenceNotes] = this.settings.polyrhythm;
    if (polyNotes === 0) return;
    const secondsPerPrimaryBeat = 60.0 / this.settings.bpm;
    const cycleDuration = referenceNotes * secondsPerPrimaryBeat;
    const secondsPerSecondaryBeat = cycleDuration / polyNotes;
    this.nextSecondaryTime += secondsPerSecondaryBeat;
    this.secondaryBeatCount = (this.secondaryBeatCount + 1) % polyNotes;
  }

  private scheduleNote(time: number, type: 'primary' | 'secondary', index: number, total: number) {
    if (!this.audioContext) return;

    // Check Ghost Mode
    let isMuted = false;
    if (this.settings.ghost && this.settings.ghost.enabled) {
        const cycleLen = this.settings.ghost.playBars + this.settings.ghost.muteBars;
        if (cycleLen > 0) {
            const currentCyclePos = this.totalBars % cycleLen;
            if (currentCyclePos >= this.settings.ghost.playBars) {
                isMuted = true;
            }
        }
    }

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const isDownbeat = index === 0;

    // Configure sound
    if (!isMuted) {
        this.configureSound(osc, gainNode, type, isDownbeat, time);
        osc.start(time);
        // Stop is handled in configureSound
    }

    // Schedule visualization (Visuals always run to keep reference)
    const timeDelta = time - this.audioContext.currentTime;
    if (timeDelta >= 0) {
        setTimeout(() => {
            this.onBeat({
                time: Date.now(),
                type: isDownbeat ? 'downbeat' : type,
                index,
                total
            });
        }, timeDelta * 1000);
    }
  }

  private configureSound(osc: OscillatorNode, gain: GainNode, type: 'primary' | 'secondary', isDownbeat: boolean, time: number) {
      const vol = this.settings.volume;
      const pack = this.settings.soundPack;

      if (pack === 'click') {
          osc.type = 'square';
          if (type === 'primary') {
              osc.frequency.value = isDownbeat ? 1500 : 1000;
              gain.gain.setValueAtTime(vol, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
              osc.stop(time + 0.05);
          } else {
              osc.frequency.value = 800;
              gain.gain.setValueAtTime(vol * 0.6, time);
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
          if (type === 'primary' && isDownbeat) {
              osc.type = 'sine';
              osc.frequency.setValueAtTime(150, time);
              osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
              gain.gain.setValueAtTime(vol, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
              osc.stop(time + 0.1);
          } else if (type === 'primary') {
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(200, time);
              gain.gain.setValueAtTime(vol * 0.8, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
              osc.stop(time + 0.05);
          } else {
              osc.type = 'square';
              osc.frequency.setValueAtTime(800, time);
              gain.gain.setValueAtTime(vol * 0.4, time);
              gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
              osc.stop(time + 0.02);
          }
      }
  }
}
