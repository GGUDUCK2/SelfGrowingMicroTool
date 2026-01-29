import type { AnimationState } from './types';

export const presets: Record<string, AnimationState> = {
  fadeInUp: {
    name: 'fadeInUp',
    duration: 800,
    timingFunction: 'ease-out',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'both',
    keyframes: [
      { id: '1', percentage: 0, properties: [{ name: 'opacity', value: '0' }, { name: 'transform', value: 'translateY(20px)' }] },
      { id: '2', percentage: 100, properties: [{ name: 'opacity', value: '1' }, { name: 'transform', value: 'translateY(0)' }] }
    ]
  },
  pulse: {
    name: 'pulse',
    duration: 2000,
    timingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    keyframes: [
        { id: '1', percentage: 0, properties: [{ name: 'opacity', value: '1' }] },
        { id: '2', percentage: 50, properties: [{ name: 'opacity', value: '0.5' }] },
        { id: '3', percentage: 100, properties: [{ name: 'opacity', value: '1' }] }
    ]
  },
  spin: {
    name: 'spin',
    duration: 1000,
    timingFunction: 'linear',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    keyframes: [
        { id: '1', percentage: 0, properties: [{ name: 'transform', value: 'rotate(0deg)' }] },
        { id: '2', percentage: 100, properties: [{ name: 'transform', value: 'rotate(360deg)' }] }
    ]
  },
  bounce: {
      name: 'bounce',
      duration: 1000,
      timingFunction: 'linear',
      iterations: 'infinite',
      direction: 'normal',
      fillMode: 'none',
      keyframes: [
          { id: '1', percentage: 0, properties: [{ name: 'transform', value: 'translateY(-25%)' }, {name: 'animation-timing-function', value: 'cubic-bezier(0.8,0,1,1)'}] },
          { id: '2', percentage: 50, properties: [{ name: 'transform', value: 'translateY(0)' }, {name: 'animation-timing-function', value: 'cubic-bezier(0,0,0.2,1)'}] },
          { id: '3', percentage: 100, properties: [{ name: 'transform', value: 'translateY(-25%)' }, {name: 'animation-timing-function', value: 'cubic-bezier(0.8,0,1,1)'}] }
      ]
  }
};
