import type { dictionaries } from '$lib/dictionaries';

export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ExportOptions {
  format: ImageFormat;
  quality: number; // 0 to 1
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  targetSizeKB?: number;
}

export interface Preset {
  id: string;
  name: string;
  options: Partial<ExportOptions>;
}

export interface ImageJob {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  originalDimensions: { width: number; height: number };
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: {
    blob: Blob;
    url: string;
    size: number;
    dimensions: { width: number; height: number };
  };
  options: ExportOptions;
  error?: string;
  createdAt: number;
}

export interface PixelHistoryItem {
  id: string;
  fileName: string;
  originalSize: number;
  optimizedSize: number;
  format: ImageFormat;
  savings: number; // Percentage
  timestamp: number;
}

export type PixelForgeDictionary = typeof dictionaries['en']['tools']['pixelForge'];
export type Dictionary = typeof dictionaries['en'];
