export interface BannerLayer {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  content: string; // text content or image url
  style: Record<string, string | number>;
}

export interface BannerState {
  width: number;
  height: number;
  background: {
    type: 'color' | 'gradient' | 'image' | 'pattern';
    value: string; // hex, gradient css, url, or pattern name
    overlay?: number; // 0-1 opacity
  };
  layers: BannerLayer[];
  selectedLayerId: string | null;
}

export interface Preset {
  id: string;
  name: string;
  width: number;
  height: number;
  icon?: string;
}
