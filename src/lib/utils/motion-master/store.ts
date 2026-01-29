import { writable } from 'svelte/store';
import type { AnimationState, PreviewSettings } from './types';

const defaultKeyframes = [
  { id: 'start', percentage: 0, properties: [{ name: 'opacity', value: '0' }, { name: 'transform', value: 'translateY(20px)' }] },
  { id: 'end', percentage: 100, properties: [{ name: 'opacity', value: '1' }, { name: 'transform', value: 'translateY(0)' }] }
];

const initialState: AnimationState = {
  name: 'fadeInUp',
  duration: 1000,
  timingFunction: 'ease-out',
  iterations: 'infinite',
  direction: 'normal',
  fillMode: 'both',
  keyframes: defaultKeyframes
};

export const animationStore = writable<AnimationState>(initialState);
export const previewStore = writable<PreviewSettings>({
  type: 'box',
  color: '#6366f1', // Indigo 500
  bgColor: '#f8fafc' // Slate 50
});

export const isPlaying = writable(true);
export const currentTime = writable(0); // 0 to 100%
export const selectedKeyframeId = writable<string | null>(null);
