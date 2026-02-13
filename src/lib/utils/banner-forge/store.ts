import { writable } from 'svelte/store';
import type { BannerState, BannerLayer } from './types';

const initialState: BannerState = {
  width: 1200,
  height: 630,
  background: {
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    overlay: 0
  },
  layers: [
    {
      id: 'title',
      type: 'text',
      x: 600,
      y: 200,
      width: 1000,
      height: 150,
      rotation: 0,
      zIndex: 10,
      content: 'Banner Forge',
      style: {
        fontSize: '80px',
        fontWeight: '800',
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: 'Inter',
        lineHeight: '1.2'
      }
    },
    {
      id: 'subtitle',
      type: 'text',
      x: 600,
      y: 350,
      width: 1000,
      height: 100,
      rotation: 0,
      zIndex: 9,
      content: 'Create stunning social images',
      style: {
        fontSize: '40px',
        fontWeight: '500',
        color: '#e2e8f0',
        textAlign: 'center',
        fontFamily: 'Inter',
        lineHeight: '1.4'
      }
    }
  ],
  selectedLayerId: null
};

function createBannerStore() {
  const { subscribe, set, update } = writable<BannerState>(initialState);

  return {
    subscribe,
    set,
    update,
    resize: (width: number, height: number) => update(s => ({ ...s, width, height })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setBackground: (type: any, value: string) => update(s => ({ ...s, background: { ...s.background, type, value } })),
    addLayer: (layer: BannerLayer) => update(s => ({ ...s, layers: [...s.layers, layer], selectedLayerId: layer.id })),
    updateLayer: (id: string, props: Partial<BannerLayer>) => update(s => ({
      ...s,
      layers: s.layers.map(l => l.id === id ? { ...l, ...props } : l)
    })),
    removeLayer: (id: string) => update(s => ({
      ...s,
      layers: s.layers.filter(l => l.id !== id),
      selectedLayerId: null
    })),
    selectLayer: (id: string | null) => update(s => ({ ...s, selectedLayerId: id })),
    reset: () => set(initialState),
    load: (state: BannerState) => set(state)
  };
}

export const bannerStore = createBannerStore();
