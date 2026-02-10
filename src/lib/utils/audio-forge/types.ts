export interface AudioProject {
  id?: number;
  name: string;
  blob: Blob;
  duration: number;
  format: string; // 'wav' | 'webm'
  createdAt: Date;
  starred?: number;
}

export interface AudioRegion {
  id: string;
  start: number; // in seconds
  end: number; // in seconds
  color?: string;
}

export type WaveformView = {
  zoom: number; // pixels per second
  offset: number; // seconds from start
};

export type AudioState = 'idle' | 'playing' | 'recording' | 'processing';
