import type { Preset } from './types';

export const sizes: Preset[] = [
  { id: 'og', name: 'Open Graph', width: 1200, height: 630 },
  { id: 'twitter', name: 'Twitter Post', width: 1200, height: 675 },
  { id: 'instagram', name: 'Instagram Square', width: 1080, height: 1080 },
  { id: 'instagram-story', name: 'Instagram Story', width: 1080, height: 1920 },
  { id: 'linkedin', name: 'LinkedIn Post', width: 1200, height: 627 },
];

export const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
  'linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%)',
  'linear-gradient(135deg, #FCCF31 0%, #F55555 100%)',
  'linear-gradient(135deg, #ABDCFF 0%, #0396FF 100%)',
  'linear-gradient(135deg, #FEB692 0%, #EA5455 100%)',
  'linear-gradient(135deg, #ce9ffc 0%, #7367f0 100%)',
  'linear-gradient(135deg, #90F7EC 0%, #32CCBC 100%)',
];

export const patterns = [
  'dots',
  'lines',
  'grid',
  'checker'
];
