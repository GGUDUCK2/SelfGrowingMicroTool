import type { AnimationState } from './types';

export function generateCSS(state: AnimationState): string {
  const keyframes = state.keyframes
    .sort((a, b) => a.percentage - b.percentage)
    .map(kf => {
      const props = kf.properties
        .map(p => `  ${p.name}: ${p.value};`)
        .join('\n');
      return `${kf.percentage}% {\n${props}\n}`;
    })
    .join('\n\n');

  return `@keyframes ${state.name} {\n${keyframes}\n}\n\n.animate-${state.name} {\n  animation: ${state.name} ${state.duration}ms ${state.timingFunction} ${state.iterations} ${state.direction} ${state.fillMode};\n}`;
}

export function generateTailwind(state: AnimationState): string {
  const keyframesObj: Record<string, any> = {};

  state.keyframes
    .sort((a, b) => a.percentage - b.percentage)
    .forEach(kf => {
      const props: Record<string, string> = {};
      kf.properties.forEach(p => {
          props[p.name] = p.value;
      });
      keyframesObj[`${kf.percentage}%`] = props;
  });

  const config = {
      theme: {
          extend: {
              keyframes: {
                  [state.name]: keyframesObj
              },
              animation: {
                  [state.name]: `${state.name} ${state.duration}ms ${state.timingFunction} ${state.iterations} ${state.direction} ${state.fillMode}`
              }
          }
      }
  };

  return JSON.stringify(config, null, 2);
}
