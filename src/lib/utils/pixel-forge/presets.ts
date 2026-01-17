import type { Preset } from './types';

export const presets: Preset[] = [
  {
    id: 'web-hq',
    name: 'Web High Quality',
    options: {
      format: 'image/webp',
      quality: 0.9,
      maintainAspectRatio: true
    }
  },
  {
    id: 'social',
    name: 'Social Media Post',
    options: {
      format: 'image/jpeg',
      quality: 0.85,
      width: 1200,
      maintainAspectRatio: true
    }
  },
  {
    id: 'thumbnail',
    name: 'Thumbnail',
    options: {
      format: 'image/webp',
      quality: 0.75,
      width: 400,
      maintainAspectRatio: true
    }
  },
  {
    id: 'email',
    name: 'Email Attachment',
    options: {
      format: 'image/jpeg',
      quality: 0.6,
      width: 800,
      maintainAspectRatio: true
    }
  },
  {
    id: 'icon',
    name: 'Icon / Avatar',
    options: {
      format: 'image/png',
      width: 256,
      maintainAspectRatio: true
    }
  }
];
