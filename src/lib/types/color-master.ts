import { dictionaries } from '$lib/dictionaries';

export type ColorMasterDictionary = typeof dictionaries.en.tools.colorMaster;

export interface ColorData {
  hex: string;
  rgb: string;
  hsl: string;
  name: string;
  isDark: boolean;
}

export type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'split-complementary' | 'monochromatic';
export type VisionType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface ScaleStep {
  step: number;
  hex: string;
}
