export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}

export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return 1;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);

  return (lightest + 0.05) / (darkest + 0.05);
}

export type WCAGLevel = 'AAA' | 'AA' | 'Fail';

export function getWCAGStatus(ratio: number): { normal: WCAGLevel, large: WCAGLevel, ui: WCAGLevel } {
  return {
    normal: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail',
    large: ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA' : 'Fail',
    ui: ratio >= 3 ? 'AA' : 'Fail'
  };
}

export type ColorBlindnessType = 'normal' | 'protanomaly' | 'protanopia' | 'deuteranomaly' | 'deuteranopia' | 'tritanomaly' | 'tritanopia' | 'achromatopsia' | 'achromatomaly';

export function simulateColorBlindness(hex: string, type: ColorBlindnessType): string {
  const rgb = hexToRgb(hex);
  if (!rgb || type === 'normal') return hex;

  const r = rgb.r;
  const g = rgb.g;
  const b = rgb.b;

  const applyMatrix = (matrix: number[]) => {
      return {
          r: Math.max(0, Math.min(255, Math.round(r * matrix[0] + g * matrix[1] + b * matrix[2]))),
          g: Math.max(0, Math.min(255, Math.round(r * matrix[3] + g * matrix[4] + b * matrix[5]))),
          b: Math.max(0, Math.min(255, Math.round(r * matrix[6] + g * matrix[7] + b * matrix[8])))
      };
  };

  let newRgb = {r, g, b};

  // Matrices based on standard color blindness simulations (approximate)
  switch (type) {
      case 'protanomaly':
          newRgb = applyMatrix([0.817, 0.183, 0, 0.333, 0.667, 0, 0, 0.125, 0.875]);
          break;
      case 'protanopia':
          newRgb = applyMatrix([0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758]);
          break;
      case 'deuteranomaly':
          newRgb = applyMatrix([0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858]);
          break;
      case 'deuteranopia':
          newRgb = applyMatrix([0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7]);
          break;
      case 'tritanomaly':
          newRgb = applyMatrix([0.967, 0.033, 0, 0, 0.733, 0.267, 0, 0.183, 0.817]);
          break;
      case 'tritanopia':
          newRgb = applyMatrix([0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525]);
          break;
      case 'achromatopsia':
          newRgb = applyMatrix([0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114]);
          break;
      case 'achromatomaly':
          newRgb = applyMatrix([0.618, 0.320, 0.062, 0.163, 0.775, 0.062, 0.163, 0.320, 0.516]);
          break;
  }

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

// ARIA Roles Data
export const ariaRoles = [
  { role: 'alert', category: 'Live Region', description: 'A type of live region with important, and usually time-sensitive, information.', attributes: ['aria-expanded'], required: [] },
  { role: 'alertdialog', category: 'Window', description: 'A type of dialog that contains an alert message, where initial focus goes to an element within the dialog.', attributes: ['aria-expanded', 'aria-modal'], required: [] },
  { role: 'application', category: 'Document Structure', description: 'A structure containing one or more focusable elements requiring user input, such as keyboard or pointer events, that do not strictly conform to a standard Web interaction pattern.', attributes: ['aria-activedescendant', 'aria-details', 'aria-disabled', 'aria-errormessage', 'aria-expanded', 'aria-haspopup', 'aria-invalid'], required: [] },
  { role: 'article', category: 'Document Structure', description: 'A section of a page that consists of a composition that forms an independent part of a document, page, or site.', attributes: ['aria-posinset', 'aria-setsize'], required: [] },
  { role: 'banner', category: 'Landmark', description: 'A region that contains mostly site-oriented content, rather than page-specific content.', attributes: [], required: [] },
  { role: 'button', category: 'Widget', description: 'An input that allows for user-triggered actions when clicked or pressed.', attributes: ['aria-disabled', 'aria-haspopup', 'aria-expanded', 'aria-pressed'], required: [] },
  { role: 'checkbox', category: 'Widget', description: 'A checkable input that has three possible values: true, false, or mixed.', attributes: ['aria-controls', 'aria-disabled', 'aria-errormessage', 'aria-expanded', 'aria-haspopup', 'aria-invalid', 'aria-readonly', 'aria-required'], required: ['aria-checked'] },
  { role: 'combobox', category: 'Widget', description: 'A composite widget made up of the textbox and the popup that provides values that may be set into the textbox.', attributes: ['aria-activedescendant', 'aria-autocomplete', 'aria-errormessage', 'aria-invalid', 'aria-readonly', 'aria-required'], required: ['aria-controls', 'aria-expanded'] },
  { role: 'dialog', category: 'Window', description: 'A dialog is a descendant window of the primary window of a web application.', attributes: ['aria-modal'], required: [] },
  { role: 'listbox', category: 'Widget', description: 'A widget that allows the user to select one or more items from a list of choices.', attributes: ['aria-activedescendant', 'aria-disabled', 'aria-errormessage', 'aria-expanded', 'aria-haspopup', 'aria-invalid', 'aria-multiselectable', 'aria-readonly', 'aria-required'], required: [] },
  { role: 'menu', category: 'Widget', description: 'A type of widget that offers a list of choices to the user.', attributes: ['aria-activedescendant', 'aria-disabled', 'aria-errormessage', 'aria-expanded', 'aria-haspopup', 'aria-invalid', 'aria-orientation'], required: [] },
  { role: 'progressbar', category: 'Widget', description: 'An element that displays the progress status for tasks that take a long time.', attributes: ['aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext'], required: [] },
  { role: 'slider', category: 'Widget', description: 'A user input where the user selects a value from within a given range.', attributes: ['aria-disabled', 'aria-errormessage', 'aria-haspopup', 'aria-invalid', 'aria-readonly', 'aria-valuetext'], required: ['aria-valuemax', 'aria-valuemin', 'aria-valuenow'] },
  { role: 'switch', category: 'Widget', description: 'A type of checkbox that represents on/off values, as opposed to checked/unchecked values.', attributes: ['aria-controls', 'aria-disabled', 'aria-errormessage', 'aria-expanded', 'aria-haspopup', 'aria-invalid', 'aria-readonly', 'aria-required'], required: ['aria-checked'] },
  { role: 'tab', category: 'Widget', description: 'A grouping label providing a mechanism for selecting the tab content that is to be rendered to the user.', attributes: ['aria-disabled', 'aria-expanded', 'aria-haspopup', 'aria-posinset', 'aria-setsize', 'aria-selected'], required: [] },
  { role: 'tablist', category: 'Widget', description: 'A list of tab elements, which are references to tabpanel elements.', attributes: ['aria-level', 'aria-multiselectable', 'aria-orientation'], required: [] },
  { role: 'tabpanel', category: 'Widget', description: 'A container for the resources associated with a tab, where each tab is contained in a tablist.', attributes: [], required: [] }
];
