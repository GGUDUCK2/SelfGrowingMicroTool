export interface RhythmSettings {
  bpm: number;
  isPlaying: boolean;
  volume: number;
  signature: [number, number]; // [numerator, denominator] e.g. [4, 4]
  polyrhythm?: [number, number]; // [primary, secondary] e.g. [3, 4] (3 beats in the space of 4)
  polyrhythmEnabled: boolean;
  soundPack: SoundPack;
  visualizer: 'circle' | 'linear' | 'none';
}

export type SoundPack = 'click' | 'wood' | 'drum' | 'beep';

export interface BeatEvent {
  time: number;
  type: 'primary' | 'secondary' | 'downbeat';
  index: number; // which beat in the measure
  total: number; // total beats in this cycle
}
