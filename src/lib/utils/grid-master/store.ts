import { writable, derived, get } from 'svelte/store';
import { nanoid } from 'nanoid';
import type { GridState, GridArea, JustifyItems, AlignItems, JustifyContent, AlignContent } from './types';

export interface Snapshot {
    id: string;
    timestamp: number;
    name: string;
    state: GridState;
}

function createSnapshotStore() {
    const { subscribe, update, set } = writable<Snapshot[]>([]);

    return {
        subscribe,
        set,
        add: (name: string, state: GridState) => {
            update(snaps => [
                {
                    id: nanoid(),
                    timestamp: Date.now(),
                    name,
                    state: JSON.parse(JSON.stringify(state))
                },
                ...snaps
            ].slice(0, 20)); // Limit to 20 snapshots
        },
        restore: (id: string) => {
            const snaps = get({ subscribe });
            const snap = snaps.find(s => s.id === id);
            if (snap) {
                gridStore.load(snap.state);
            }
        },
        delete: (id: string) => {
            update(snaps => snaps.filter(s => s.id !== id));
        },
        clear: () => set([])
    };
}

export const snapshotStore = createSnapshotStore();

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
  items: [],
  justifyItems: 'stretch',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  alignContent: 'stretch',
  includeMobile: false
};

function createGridStore() {
  const { subscribe, set, update } = writable<GridState>(initialState);

  // History state
  const past = writable<GridState[]>([]);
  const future = writable<GridState[]>([]);

  const record = (currentState: GridState) => {
      past.update((h: GridState[]) => [...h, JSON.parse(JSON.stringify(currentState)) as GridState].slice(-50));
      future.set([]);
  };

  const withHistory = (fn: (s: GridState) => GridState) => {
      update(s => {
          record(s);
          return fn(s);
      });
  };

  return {
    subscribe,
    set,
    update,

    // History Actions
    undo: () => {
        update(current => {
            let previous: GridState | undefined;
            past.update(h => {
                if (h.length === 0) return h;
                previous = h[h.length - 1];
                return h.slice(0, -1);
            });

            if (previous) {
                future.update(f => [current, ...f]);
                return previous;
            }
            return current;
        });
    },

    redo: () => {
        update(current => {
            let next: GridState | undefined;
            future.update(f => {
                if (f.length === 0) return f;
                next = f[0];
                return f.slice(1);
            });

            if (next) {
                past.update(h => [...h, current]);
                return next;
            }
            return current;
        });
    },

    reset: () => {
        withHistory(() => initialState);
    },

    load: (state: GridState) => {
        // Ensure legacy states have new properties if loaded
        const safeState: GridState = {
            ...initialState,
            ...state,
            areas: state.areas || [], // Handle potential nulls
            rows: state.rows || initialState.rows,
            cols: state.cols || initialState.cols
        };
        set(safeState);
        past.set([]);
        future.set([]);
    },

    // Mutators
    addRow: (val = '1fr') => withHistory(s => ({ ...s, rows: [...s.rows, val] })),
    removeRow: (idx: number) => withHistory(s => ({ ...s, rows: s.rows.filter((_, i) => i !== idx) })),
    updateRow: (idx: number, val: string) => withHistory(s => {
        const newRows = [...s.rows];
        newRows[idx] = val;
        return { ...s, rows: newRows };
    }),
    addCol: (val = '1fr') => withHistory(s => ({ ...s, cols: [...s.cols, val] })),
    removeCol: (idx: number) => withHistory(s => ({ ...s, cols: s.cols.filter((_, i) => i !== idx) })),
    updateCol: (idx: number, val: string) => withHistory(s => {
        const newCols = [...s.cols];
        newCols[idx] = val;
        return { ...s, cols: newCols };
    }),
    setGap: (gap: string) => withHistory(s => ({ ...s, gap, rowGap: gap, colGap: gap })),
    setRowGap: (gap: string) => withHistory(s => ({ ...s, rowGap: gap })),
    setColGap: (gap: string) => withHistory(s => ({ ...s, colGap: gap })),
    addArea: (area: GridArea) => withHistory(s => ({ ...s, areas: [...s.areas, area] })),
    removeArea: (id: string) => withHistory(s => ({ ...s, areas: s.areas.filter(a => a.id !== id) })),
    updateArea: (id: string, patch: Partial<GridArea>) => withHistory(s => ({
        ...s,
        areas: s.areas.map(a => a.id === id ? { ...a, ...patch } : a)
    })),

    // Alignment Mutators
    setJustifyItems: (val: JustifyItems) => withHistory(s => ({ ...s, justifyItems: val })),
    setAlignItems: (val: AlignItems) => withHistory(s => ({ ...s, alignItems: val })),
    setJustifyContent: (val: JustifyContent) => withHistory(s => ({ ...s, justifyContent: val })),
    setAlignContent: (val: AlignContent) => withHistory(s => ({ ...s, alignContent: val })),

    // Responsive
    toggleMobile: () => withHistory(s => ({ ...s, includeMobile: !s.includeMobile })),

    reorderMobile: (id: string, direction: 'up' | 'down') => withHistory(s => {
        // Ensure all areas have a mobileOrder initialized if missing
        // Sort first to ensure stability
        const areas = s.areas.map((a, i) => ({ ...a, mobileOrder: a.mobileOrder ?? i }));
        areas.sort((a, b) => (a.mobileOrder || 0) - (b.mobileOrder || 0));

        const currentIndex = areas.findIndex(a => a.id === id);
        if (currentIndex === -1) return s;

        if (direction === 'up' && currentIndex > 0) {
             const prev = areas[currentIndex - 1];
             const curr = areas[currentIndex];
             const temp = curr.mobileOrder;
             curr.mobileOrder = prev.mobileOrder;
             prev.mobileOrder = temp;
        } else if (direction === 'down' && currentIndex < areas.length - 1) {
             const next = areas[currentIndex + 1];
             const curr = areas[currentIndex];
             const temp = curr.mobileOrder;
             curr.mobileOrder = next.mobileOrder;
             next.mobileOrder = temp;
        }

        return { ...s, areas };
    }),

    // Exports for UI
    canUndo: derived(past, $past => $past.length > 0),
    canRedo: derived(future, $future => $future.length > 0)
  };
}

export const gridStore = createGridStore();
