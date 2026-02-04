import type { Font } from 'opentype.js';

export interface FontMeta {
  family: string;
  style: string;
  version: string;
  copyright: string;
  manufacturer: string;
  designer: string;
  license: string;
}

export interface VariableAxis {
  tag: string;
  name: string;
  min: number;
  max: number;
  default: number;
  current: number;
}

export interface LoadedFont {
  font: Font;
  meta: FontMeta;
  axes: VariableAxis[];
  fileName: string;
  fileSize: number;
  url: string; // Object URL
}
