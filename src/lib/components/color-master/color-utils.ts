import { colord, extend, type Colord } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import harmoniesPlugin from 'colord/plugins/harmonies';
import namesPlugin from 'colord/plugins/names';

extend([a11yPlugin, harmoniesPlugin, namesPlugin]);

export interface ColorData {
  hex: string;
  rgb: string;
  hsl: string;
  name: string;
  isDark: boolean;
}

export const getColorData = (color: string | Colord): ColorData => {
  const c = typeof color === 'string' ? colord(color) : color;
  return {
    hex: c.toHex(),
    rgb: c.toRgbString(),
    hsl: c.toHslString(),
    name: c.toName({ closest: true }) || 'Unknown',
    isDark: c.isDark()
  };
};

export const getHarmonies = (color: string, type: 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'split-complementary' | 'monochromatic') => {
  const c = colord(color);
  let harmonies: Colord[] = [];

  switch (type) {
    case 'complementary':
      harmonies = c.harmonies('complementary');
      break;
    case 'analogous':
      harmonies = c.harmonies('analogous');
      break;
    case 'triadic':
      harmonies = c.harmonies('triadic');
      break;
    case 'tetradic':
      harmonies = c.harmonies('tetradic');
      break;
    case 'split-complementary':
      harmonies = c.harmonies('split-complementary');
      break;
    case 'monochromatic':
      // colord doesn't have explicit monochromatic in the harmonies plugin, so we simulate it
      harmonies = [
        c,
        c.lighten(0.1),
        c.lighten(0.2),
        c.darken(0.1),
        c.darken(0.2)
      ];
      break;
  }

  return harmonies.map(getColorData);
};

export const getContrast = (color1: string, color2: string) => {
  return colord(color1).contrast(color2);
};

export const getReadability = (textColor: string, bgColor: string) => {
  const contrast = getContrast(textColor, bgColor);
  return {
    contrast,
    level: colord(textColor).isReadable(bgColor, { level: 'AAA' }) ? 'AAA' : (colord(textColor).isReadable(bgColor, { level: 'AA' }) ? 'AA' : 'Fail'),
    largeLevel: colord(textColor).isReadable(bgColor, { level: 'AAA', size: 'large' }) ? 'AAA' : (colord(textColor).isReadable(bgColor, { level: 'AA', size: 'large' }) ? 'AA' : 'Fail')
  };
};

// Simple Color Blindness Simulation Matrices (Approximations)
// Sourced from various web accessibility resources
const simMatrices = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758]
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7]
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525]
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114]
  ]
};

export const simulateVision = (colorHex: string, type: keyof typeof simMatrices): string => {
  const rgb = colord(colorHex).toRgb();
  const m = simMatrices[type];

  const r = rgb.r * m[0][0] + rgb.g * m[0][1] + rgb.b * m[0][2];
  const g = rgb.r * m[1][0] + rgb.g * m[1][1] + rgb.b * m[1][2];
  const b = rgb.r * m[2][0] + rgb.g * m[2][1] + rgb.b * m[2][2];

  return colord({ r, g, b }).toHex();
};
