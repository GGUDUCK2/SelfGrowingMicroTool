import { nanoid } from 'nanoid';
import type { GridState, GridArea } from './types';
import { getRandomColor } from './constants';

interface Rect {
    r1: number;
    c1: number;
    r2: number;
    c2: number;
}

function splitRect(rect: Rect): [Rect, Rect] | null {
    const height = rect.r2 - rect.r1;
    const width = rect.c2 - rect.c1;

    // Minimum size 1
    if (height <= 1 && width <= 1) return null;

    const canSplitH = height > 1;
    const canSplitV = width > 1;

    let splitH = false;
    if (canSplitH && canSplitV) {
        splitH = Math.random() > 0.5;
    } else if (canSplitH) {
        splitH = true;
    } else if (canSplitV) {
        splitH = false;
    } else {
        return null;
    }

    if (splitH) {
        // Split Horizontally (cut a row line)
        // Range: rect.r1 + 1 to rect.r2 - 1
        const cut = Math.floor(Math.random() * (height - 1)) + rect.r1 + 1;
        return [
            { ...rect, r2: cut },
            { ...rect, r1: cut }
        ];
    } else {
        // Split Vertically (cut a col line)
        const cut = Math.floor(Math.random() * (width - 1)) + rect.c1 + 1;
        return [
            { ...rect, c2: cut },
            { ...rect, c1: cut }
        ];
    }
}

export function generateMagicLayout(): GridState {
    // 1. Define base grid size (e.g. 6x6 or 4x4)
    // Randomize grid size slightly
    const rowCount = Math.floor(Math.random() * 3) + 3; // 3 to 5
    const colCount = Math.floor(Math.random() * 3) + 3; // 3 to 5

    // 2. BSP Generation
    const regions: Rect[] = [{ r1: 1, c1: 1, r2: rowCount + 1, c2: colCount + 1 }];
    const targetRegions = Math.floor(Math.random() * 3) + 3; // 3 to 5 areas

    // Iterative split until we have enough regions or can't split
    let safety = 0;
    while (regions.length < targetRegions && safety < 20) {
        safety++;
        // Pick largest region to split
        regions.sort((a, b) => (b.r2 - b.r1) * (b.c2 - b.c1) - (a.r2 - a.r1) * (a.c2 - a.c1));
        const candidate = regions.shift();
        if (!candidate) break;

        const split = splitRect(candidate);
        if (split) {
            regions.push(...split);
        } else {
            regions.push(candidate);
            // Try next largest?
            // For simplicity, just continue, sort will handle it next iter if there's another candidate
            // But if largest can't split, others might not either.
            // Let's just shuffle to be safe
             // actually if split is null, we pushed it back.
             // If we keep picking the same one, we loop.
             // So if split fails, we should try a different one or stop.
             // Simplification: just stop if we can't split the biggest.
             break;
        }
    }

    // 3. Convert Regions to Areas
    const areas: GridArea[] = regions.map((r, i) => {
        // Name assignment logic
        let name = `area-${i + 1}`;
        // Simple heuristic for semantic names
        if (r.r1 === 1 && r.r2 === 2 && r.c1 === 1 && r.c2 === colCount + 1) name = 'header';
        else if (r.r1 === rowCount && r.r2 === rowCount + 1) name = 'footer';
        else if (r.c1 === 1 && r.c2 === 2 && r.r1 > 1 && r.r2 < rowCount + 1) name = 'sidebar';

        // Check duplicates
        if (regions.findIndex((_r, _i) => _i !== i && name === 'header') !== -1 && name === 'header') name = `header-${i}`;

        return {
            id: nanoid(),
            name,
            rowStart: r.r1,
            rowEnd: r.r2,
            colStart: r.c1,
            colEnd: r.c2,
            color: getRandomColor()
        };
    });

    // 4. Generate Rows/Cols definitions
    // Randomize units slightly
    const rows = Array(rowCount).fill('1fr').map(() => Math.random() > 0.7 ? 'auto' : '1fr');
    const cols = Array(colCount).fill('1fr').map(() => Math.random() > 0.7 ? '200px' : '1fr');

    // Ensure at least one fr
    if (!rows.includes('1fr')) rows[0] = '1fr';
    if (!cols.includes('1fr')) cols[1] = '1fr'; // usually main content

    // 5. Random Gaps
    const gaps = ['0px', '0.5rem', '1rem', '1.5rem', '2rem'];
    const gap = gaps[Math.floor(Math.random() * gaps.length)];

    return {
        rows,
        cols,
        gap,
        rowGap: gap,
        colGap: gap,
        areas,
        items: [],
        justifyItems: 'stretch',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        alignContent: 'stretch',
        includeMobile: false
    };
}

export function remixLayout(state: GridState): GridState {
    const gaps = ['0px', '0.5rem', '1rem', '2rem'];
    const newGap = gaps[Math.floor(Math.random() * gaps.length)];

    const newAreas = state.areas.map(area => ({
        ...area,
        color: getRandomColor()
    }));

    return {
        ...state,
        gap: newGap,
        rowGap: newGap,
        colGap: newGap,
        areas: newAreas
    };
}

export function generateSmartLayout(type: 'dashboard' | 'blog' | 'holy-grail' | 'gallery'): GridState {
    const common = {
        gap: '1rem',
        rowGap: '1rem',
        colGap: '1rem',
        items: [],
        justifyItems: 'stretch' as const,
        alignItems: 'stretch' as const,
        justifyContent: 'stretch' as const,
        alignContent: 'stretch' as const,
        includeMobile: true
    };

    if (type === 'dashboard') {
        return {
            ...common,
            rows: ['60px', '1fr'],
            cols: ['250px', '1fr'],
            areas: [
                { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 3, color: 'indigo' },
                { id: nanoid(), name: 'sidebar', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, color: 'slate' },
                { id: nanoid(), name: 'main', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, color: 'white' }
            ]
        };
    }

    if (type === 'blog') {
        return {
            ...common,
            rows: ['auto', '1fr', 'auto'],
            cols: ['1fr', '65ch', '300px', '1fr'],
            areas: [
                { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 5, color: 'indigo' },
                { id: nanoid(), name: 'article', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, color: 'white' },
                { id: nanoid(), name: 'aside', rowStart: 2, rowEnd: 3, colStart: 3, colEnd: 4, color: 'slate' },
                { id: nanoid(), name: 'footer', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 5, color: 'slate' }
            ]
        };
    }

    if (type === 'holy-grail') {
        return {
            ...common,
            rows: ['auto', '1fr', 'auto'],
            cols: ['200px', '1fr', '200px'],
            areas: [
                { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 4, color: 'indigo' },
                { id: nanoid(), name: 'nav', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, color: 'emerald' },
                { id: nanoid(), name: 'main', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, color: 'white' },
                { id: nanoid(), name: 'ads', rowStart: 2, rowEnd: 3, colStart: 3, colEnd: 4, color: 'amber' },
                { id: nanoid(), name: 'footer', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 4, color: 'slate' }
            ]
        };
    }

    if (type === 'gallery') {
        return {
            ...common,
            rows: ['auto', '1fr', '1fr', 'auto'],
            cols: ['1fr', '1fr', '1fr'],
            areas: [
                { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 4, color: 'indigo' },
                { id: nanoid(), name: 'img-1', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, color: 'sky' },
                { id: nanoid(), name: 'img-2', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, color: 'sky' },
                { id: nanoid(), name: 'img-3', rowStart: 2, rowEnd: 3, colStart: 3, colEnd: 4, color: 'sky' },
                { id: nanoid(), name: 'img-4', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 2, color: 'sky' },
                { id: nanoid(), name: 'img-5', rowStart: 3, rowEnd: 4, colStart: 2, colEnd: 3, color: 'sky' },
                { id: nanoid(), name: 'img-6', rowStart: 3, rowEnd: 4, colStart: 3, colEnd: 4, color: 'sky' },
                { id: nanoid(), name: 'footer', rowStart: 4, rowEnd: 5, colStart: 1, colEnd: 4, color: 'slate' }
            ]
        };
    }

    return generateMagicLayout();
}

export function generateLayoutFromText(input: string): GridState {
    const tokens = input.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const uniqueTokens = [...new Set(tokens)];

    if (uniqueTokens.length === 0) return generateMagicLayout();

    // Identify special roles
    const header = uniqueTokens.find(t => ['header', 'top', 'nav'].some(k => t.includes(k)));
    const footer = uniqueTokens.find(t => ['footer', 'bottom'].some(k => t.includes(k)));
    const sidebar = uniqueTokens.find(t => ['sidebar', 'aside', 'left', 'menu'].some(k => t.includes(k)));
    const rightbar = uniqueTokens.find(t => ['rightbar', 'ads', 'extra'].some(k => t.includes(k)));

    // Find 'main' or whatever is left that isn't one of the above
    const used = [header, footer, sidebar, rightbar].filter(Boolean);
    const main = uniqueTokens.find(t => !used.includes(t)) || 'main';

    // Construct Layout
    // Rows: Header? / Main+Sidebars / Footer?
    const rows: string[] = [];
    if (header) rows.push('auto');
    rows.push('1fr'); // Content area
    if (footer) rows.push('auto');

    // Cols: Sidebar? / Main / Rightbar?
    const cols: string[] = [];
    if (sidebar) cols.push('250px');
    cols.push('1fr');
    if (rightbar) cols.push('250px');

    const areas: GridArea[] = [];
    let currentRow = 1;

    // Header Area
    if (header) {
        areas.push({
            id: nanoid(),
            name: header,
            rowStart: currentRow,
            rowEnd: currentRow + 1,
            colStart: 1,
            colEnd: cols.length + 1,
            color: 'indigo'
        });
        currentRow++;
    }

    // Middle Section
    const middleRowStart = currentRow;
    const middleRowEnd = currentRow + 1;
    let currentCol = 1;

    if (sidebar) {
        areas.push({
            id: nanoid(),
            name: sidebar,
            rowStart: middleRowStart,
            rowEnd: middleRowEnd,
            colStart: currentCol,
            colEnd: currentCol + 1,
            color: 'emerald'
        });
        currentCol++;
    }

    // Main Area
    areas.push({
        id: nanoid(),
        name: main,
        rowStart: middleRowStart,
        rowEnd: middleRowEnd,
        colStart: currentCol,
        colEnd: currentCol + 1,
        color: 'slate'
    });
    currentCol++;

    if (rightbar) {
        areas.push({
            id: nanoid(),
            name: rightbar,
            rowStart: middleRowStart,
            rowEnd: middleRowEnd,
            colStart: currentCol,
            colEnd: currentCol + 1,
            color: 'amber'
        });
        currentCol++;
    }

    currentRow++;

    // Footer Area
    if (footer) {
        areas.push({
            id: nanoid(),
            name: footer,
            rowStart: currentRow,
            rowEnd: currentRow + 1,
            colStart: 1,
            colEnd: cols.length + 1,
            color: 'rose'
        });
    }

    return {
        rows,
        cols,
        gap: '1rem',
        rowGap: '1rem',
        colGap: '1rem',
        areas,
        items: [],
        justifyItems: 'stretch',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        alignContent: 'stretch',
        includeMobile: false
    };
}
