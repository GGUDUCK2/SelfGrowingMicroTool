import type { GridState } from './types';
import { nanoid } from 'nanoid';

// Helper to create basic state
const createBase = (rows: string[], cols: string[]): GridState => ({
    rows,
    cols,
    gap: '1rem',
    rowGap: '1rem',
    colGap: '1rem',
    areas: [],
    items: [],
    justifyItems: 'stretch',
    alignItems: 'stretch',
    justifyContent: 'start',
    alignContent: 'start'
});

export const templates: Record<string, GridState> = {
    'holy-grail': {
        ...createBase(['auto', '1fr', 'auto'], ['250px', '1fr', '200px']),
        areas: [
            { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 4, color: 'indigo' },
            { id: nanoid(), name: 'nav', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, color: 'emerald' },
            { id: nanoid(), name: 'main', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, color: 'slate' },
            { id: nanoid(), name: 'aside', rowStart: 2, rowEnd: 3, colStart: 3, colEnd: 4, color: 'amber' },
            { id: nanoid(), name: 'footer', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 4, color: 'rose' }
        ]
    },
    'sidebar-left': {
        ...createBase(['1fr'], ['250px', '1fr']),
        areas: [
            { id: nanoid(), name: 'sidebar', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 2, color: 'indigo' },
            { id: nanoid(), name: 'content', rowStart: 1, rowEnd: 2, colStart: 2, colEnd: 3, color: 'slate' }
        ]
    },
    'blog-post': {
        ...createBase(['auto', 'auto', '1fr', 'auto'], ['1fr', 'minmax(0, 65ch)', '1fr']),
        areas: [
            { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 4, color: 'blue' },
            { id: nanoid(), name: 'hero', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 4, color: 'sky' },
            { id: nanoid(), name: 'article', rowStart: 3, rowEnd: 4, colStart: 2, colEnd: 3, color: 'slate' },
            { id: nanoid(), name: 'footer', rowStart: 4, rowEnd: 5, colStart: 1, colEnd: 4, color: 'zinc' }
        ]
    },
    'gallery': {
        ...createBase(['1fr', '1fr', '1fr'], ['1fr', '1fr', '1fr']),
        areas: [
             { id: nanoid(), name: 'img1', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 2, color: 'red' },
             { id: nanoid(), name: 'img2', rowStart: 1, rowEnd: 2, colStart: 2, colEnd: 3, color: 'orange' },
             { id: nanoid(), name: 'img3', rowStart: 1, rowEnd: 2, colStart: 3, colEnd: 4, color: 'amber' },
             { id: nanoid(), name: 'img4', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, color: 'yellow' },
             { id: nanoid(), name: 'img5', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, color: 'lime' },
             { id: nanoid(), name: 'img6', rowStart: 2, rowEnd: 3, colStart: 3, colEnd: 4, color: 'green' },
             { id: nanoid(), name: 'img7', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 2, color: 'emerald' },
             { id: nanoid(), name: 'img8', rowStart: 3, rowEnd: 4, colStart: 2, colEnd: 3, color: 'teal' },
             { id: nanoid(), name: 'img9', rowStart: 3, rowEnd: 4, colStart: 3, colEnd: 4, color: 'cyan' },
        ]
    },
    '12-col': {
        ...createBase(['1fr'], Array(12).fill('1fr')),
        areas: []
    }
};
