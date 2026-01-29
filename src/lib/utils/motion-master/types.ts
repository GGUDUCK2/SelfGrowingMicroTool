export interface MotionProperty {
  name: string;
  value: string;
  unit?: string;
}

export interface Keyframe {
  id: string;
  percentage: number; // 0 to 100
  properties: MotionProperty[];
}

export interface AnimationState {
  name: string;
  duration: number; // ms
  timingFunction: string;
  iterations: string; // 'infinite' or number
  direction: string; // normal, reverse, alternate, alternate-reverse
  fillMode: string; // none, forwards, backwards, both
  keyframes: Keyframe[];
}

export interface PreviewSettings {
  type: 'box' | 'circle' | 'text' | 'image' | 'ghost';
  content?: string;
  color: string;
  bgColor: string;
}
