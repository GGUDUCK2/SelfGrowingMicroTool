import { nanoid } from 'nanoid';
import type { GridState, GridArea } from './types';

const COLORS = [
    'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
    'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
];

function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

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
    let regions: Rect[] = [{ r1: 1, c1: 1, r2: rowCount + 1, c2: colCount + 1 }];
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
