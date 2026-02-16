import type { dictionaries } from '$lib/dictionaries';

export interface SpeedTrainerConfig {
  enabled: boolean;
  startBpm: number;
  endBpm: number;
  increment: number; // BPM to add
  interval: number; // Bars between increments
}

export interface GhostModeConfig {
  enabled: boolean;
  playBars: number; // Number of bars to play
  muteBars: number; // Number of bars to mute
}

export interface RhythmSettings {
  bpm: number;
  isPlaying: boolean;
  volume: number;
  signature: [number, number]; // [numerator, denominator] e.g. [4, 4]
  polyrhythm?: [number, number]; // [primary, secondary] e.g. [3, 4] (3 beats in the space of 4)
  polyrhythmEnabled: boolean;
  soundPack: SoundPack;
  visualizer: VisualizerType;
  trainer: SpeedTrainerConfig;
  ghost: GhostModeConfig;
}

export type SoundPack = 'click' | 'wood' | 'drum' | 'beep';
export type VisualizerType = 'circle' | 'linear' | 'none';

export interface BeatEvent {
  time: number;
  type: 'primary' | 'secondary' | 'downbeat';
  index: number; // which beat in the measure
  total: number; // total beats in this cycle
}

export type RhythmForgeDictionary = typeof dictionaries['en']['tools']['rhythmForge'];
