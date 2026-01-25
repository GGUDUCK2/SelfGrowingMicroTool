import { writable } from 'svelte/store';
import type { GridState, GridArea } from './types';

const initialState: GridState = {
  rows: ['1fr', '1fr', '1fr'],
  cols: ['1fr', '1fr', '1fr'],
  gap: '1rem',
  rowGap: '1rem',
  colGap: '1rem',
  areas: [
    { id: '1', name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 4, color: '#6366f1' },
    { id: '2', name: 'sidebar', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, color: '#ec4899' },
    { id: '3', name: 'main', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 4, color: '#10b981' },
    { id: '4', name: 'footer', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 4, color: '#f59e0b' }
  ],
  items: []
};

function createGridStore() {
  const { subscribe, set, update } = writable<GridState>(initialState);

  return {
    subscribe,
    set,
    update,
    reset: () => set(initialState),
    addRow: (val = '1fr') => update(s => ({ ...s, rows: [...s.rows, val] })),
    removeRow: (idx: number) => update(s => ({ ...s, rows: s.rows.filter((_, i) => i !== idx) })),
    updateRow: (idx: number, val: string) => update(s => {
        const newRows = [...s.rows];
        newRows[idx] = val;
        return { ...s, rows: newRows };
    }),
    addCol: (val = '1fr') => update(s => ({ ...s, cols: [...s.cols, val] })),
    removeCol: (idx: number) => update(s => ({ ...s, cols: s.cols.filter((_, i) => i !== idx) })),
    updateCol: (idx: number, val: string) => update(s => {
        const newCols = [...s.cols];
        newCols[idx] = val;
        return { ...s, cols: newCols };
    }),
    setGap: (gap: string) => update(s => ({ ...s, gap, rowGap: gap, colGap: gap })),
    setRowGap: (gap: string) => update(s => ({ ...s, rowGap: gap })),
    setColGap: (gap: string) => update(s => ({ ...s, colGap: gap })),
    addArea: (area: GridArea) => update(s => ({ ...s, areas: [...s.areas, area] })),
    removeArea: (id: string) => update(s => ({ ...s, areas: s.areas.filter(a => a.id !== id) })),
    updateArea: (id: string, patch: Partial<GridArea>) => update(s => ({
        ...s,
        areas: s.areas.map(a => a.id === id ? { ...a, ...patch } : a)
    })),
    load: (state: GridState) => set(state)
  };
}

export const gridStore = createGridStore();
