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
        const cut = Math.floor(Math.random() * (height - 1)) + rect.r1 + 1;
        return [
            { ...rect, r2: cut },
            { ...rect, r1: cut }
        ];
    } else {
        const cut = Math.floor(Math.random() * (width - 1)) + rect.c1 + 1;
        return [
            { ...rect, c2: cut },
            { ...rect, c1: cut }
        ];
    }
}

export function generateMagicLayout(): GridState {
    const rowCount = Math.floor(Math.random() * 3) + 3;
    const colCount = Math.floor(Math.random() * 3) + 3;

    const regions: Rect[] = [{ r1: 1, c1: 1, r2: rowCount + 1, c2: colCount + 1 }];
    const targetRegions = Math.floor(Math.random() * 3) + 3;

    let safety = 0;
    while (regions.length < targetRegions && safety < 20) {
        safety++;
        regions.sort((a, b) => (b.r2 - b.r1) * (b.c2 - b.c1) - (a.r2 - a.r1) * (a.c2 - a.c1));
        const candidate = regions.shift();
        if (!candidate) break;

        const split = splitRect(candidate);
        if (split) {
            regions.push(...split);
        } else {
            regions.push(candidate);
            break;
        }
    }

    const areas: GridArea[] = regions.map((r, i) => {
        let name = `area-${i + 1}`;
        if (r.r1 === 1 && r.r2 === 2 && r.c1 === 1 && r.c2 === colCount + 1) name = 'header';
        else if (r.r1 === rowCount && r.r2 === rowCount + 1) name = 'footer';
        else if (r.c1 === 1 && r.c2 === 2 && r.r1 > 1 && r.r2 < rowCount + 1) name = 'sidebar';

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

    const rows = Array(rowCount).fill('1fr').map(() => Math.random() > 0.7 ? 'auto' : '1fr');
    const cols = Array(colCount).fill('1fr').map(() => Math.random() > 0.7 ? '200px' : '1fr');

    if (!rows.includes('1fr')) rows[0] = '1fr';
    if (!cols.includes('1fr')) cols[1] = '1fr';

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

    // Smart track sizing mutation
    const mutateTrack = (track: string) => {
        if (track.endsWith('fr')) {
            // Toggle between 1fr, 1.5fr, 2fr
            return Math.random() > 0.7 ? `${[1, 1.5, 2][Math.floor(Math.random() * 3)]}fr` : '1fr';
        }
        if (track.endsWith('px')) {
            const val = parseFloat(track);
            // Slight variation +/- 20%
            if (Math.random() > 0.5) {
                const variation = Math.floor(val * 0.2);
                const sign = Math.random() > 0.5 ? 1 : -1;
                return `${Math.round(val + (variation * sign))}px`;
            }
        }
        return track;
    };

    const newRows = state.rows.map(mutateTrack);
    const newCols = state.cols.map(mutateTrack);

    return {
        ...state,
        rows: newRows,
        cols: newCols,
        gap: newGap,
        rowGap: newGap,
        colGap: newGap,
        areas: newAreas
    };
}

export function generateSmartLayout(type: 'dashboard' | 'blog' | 'holy-grail' | 'gallery' | 'kanban' | 'video' | 'feed', strategy: 'visual' | 'text' | 'data' = 'data'): GridState {
    const gap = strategy === 'visual' ? '0px' : (strategy === 'text' ? '2rem' : '1rem');

    const common = {
        gap,
        rowGap: gap,
        colGap: gap,
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
                { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 3, color: 'indigo', tag: 'header', contentType: 'header' },
                { id: nanoid(), name: 'sidebar', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, color: 'slate', tag: 'aside', contentType: 'form' },
                { id: nanoid(), name: 'main', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, color: 'white', tag: 'main', contentType: strategy === 'visual' ? 'gallery' : (strategy === 'text' ? 'feed' : 'chart') }
            ]
        };
    }

    if (type === 'blog') {
        return {
            ...common,
            rows: ['auto', '1fr', 'auto'],
            cols: strategy === 'text' ? ['1fr', '65ch', '1fr'] : ['1fr', '65ch', '300px', '1fr'],
            areas: strategy === 'text' ? [
                { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 4, color: 'indigo', tag: 'header', contentType: 'header' },
                { id: nanoid(), name: 'article', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, color: 'white', tag: 'article', contentType: 'none' },
                { id: nanoid(), name: 'footer', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 4, color: 'slate', tag: 'footer', contentType: 'footer' }
            ] : [
                { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 5, color: 'indigo', tag: 'header', contentType: 'header' },
                { id: nanoid(), name: 'article', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, color: 'white', tag: 'article', contentType: 'none' },
                { id: nanoid(), name: 'aside', rowStart: 2, rowEnd: 3, colStart: 3, colEnd: 4, color: 'slate', tag: 'aside', contentType: strategy === 'data' ? 'stats' : 'form' },
                { id: nanoid(), name: 'footer', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 5, color: 'slate', tag: 'footer', contentType: 'footer' }
            ]
        };
    }

    if (type === 'holy-grail') {
        return {
            ...common,
            rows: ['auto', '1fr', 'auto'],
            cols: ['200px', '1fr', '200px'],
            areas: [
                { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 4, color: 'indigo', tag: 'header' },
                { id: nanoid(), name: 'nav', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, color: 'emerald', tag: 'nav', contentType: 'form' },
                { id: nanoid(), name: 'main', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, color: 'white', tag: 'main', contentType: strategy === 'visual' ? 'hero' : 'none' },
                { id: nanoid(), name: 'ads', rowStart: 2, rowEnd: 3, colStart: 3, colEnd: 4, color: 'amber', tag: 'aside', contentType: 'pricing' },
                { id: nanoid(), name: 'footer', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 4, color: 'slate', tag: 'footer' }
            ]
        };
    }

    if (type === 'gallery') {
        return {
            ...common,
            rows: ['auto', '1fr', '1fr', 'auto'],
            cols: ['1fr', '1fr', '1fr'],
            areas: [
                { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 4, color: 'indigo', tag: 'header' },
                { id: nanoid(), name: 'img-1', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, color: 'sky', contentType: 'image' },
                { id: nanoid(), name: 'img-2', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, color: 'sky', contentType: 'image' },
                { id: nanoid(), name: 'img-3', rowStart: 2, rowEnd: 3, colStart: 3, colEnd: 4, color: 'sky', contentType: 'image' },
                { id: nanoid(), name: 'img-4', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 2, color: 'sky', contentType: 'image' },
                { id: nanoid(), name: 'img-5', rowStart: 3, rowEnd: 4, colStart: 2, colEnd: 3, color: 'sky', contentType: 'image' },
                { id: nanoid(), name: 'img-6', rowStart: 3, rowEnd: 4, colStart: 3, colEnd: 4, color: 'sky', contentType: 'image' },
                { id: nanoid(), name: 'footer', rowStart: 4, rowEnd: 5, colStart: 1, colEnd: 4, color: 'slate', tag: 'footer' }
            ]
        };
    }

    if (type === 'kanban') {
        return {
            ...common,
            rows: ['60px', '1fr'],
            cols: ['1fr', '1fr', '1fr', '1fr'],
            areas: [
                { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 5, color: 'indigo', tag: 'header' },
                { id: nanoid(), name: 'todo', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, color: 'slate', contentType: 'kanban' },
                { id: nanoid(), name: 'in-progress', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, color: 'sky', contentType: 'kanban' },
                { id: nanoid(), name: 'review', rowStart: 2, rowEnd: 3, colStart: 3, colEnd: 4, color: 'amber', contentType: 'kanban' },
                { id: nanoid(), name: 'done', rowStart: 2, rowEnd: 3, colStart: 4, colEnd: 5, color: 'emerald', contentType: 'kanban' }
            ]
        };
    }

    if (type === 'video') {
        return {
            ...common,
            rows: ['60px', '1fr', '150px'],
            cols: ['1fr', '350px'],
            areas: [
                { id: nanoid(), name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 3, color: 'indigo', tag: 'header' },
                { id: nanoid(), name: 'player', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, color: 'black', contentType: 'video' },
                { id: nanoid(), name: 'chat', rowStart: 2, rowEnd: 4, colStart: 2, colEnd: 3, color: 'white', contentType: strategy === 'data' ? 'table' : 'feed' },
                { id: nanoid(), name: 'desc', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 2, color: 'slate', contentType: 'none' }
            ]
        };
    }

    if (type === 'feed') {
        return {
            ...common,
            rows: ['60px', '1fr'],
            cols: ['250px', '600px', '1fr'],
            areas: [
                { id: nanoid(), name: 'nav', rowStart: 1, rowEnd: 3, colStart: 1, colEnd: 2, color: 'white', tag: 'nav', contentType: 'profile' },
                { id: nanoid(), name: 'feed', rowStart: 1, rowEnd: 3, colStart: 2, colEnd: 3, color: 'slate', contentType: 'feed' },
                { id: nanoid(), name: 'trending', rowStart: 1, rowEnd: 3, colStart: 3, colEnd: 4, color: 'white', contentType: strategy === 'visual' ? 'gallery' : 'list' }
            ],
            justifyContent: 'center'
        };
    }

    return generateMagicLayout();
}

function parseSize(token: string): string | null {
    if (/^\d+(px|fr|%|rem|em)$/.test(token)) return token;
    if (token === 'auto') return token;
    return null;
}

export function generateLayoutFromText(input: string): GridState {
    let rawInput = input.toLowerCase().trim();

    // Extract Strategy
    let strategy: 'visual' | 'text' | 'data' = 'data';
    if (rawInput.includes('visual') || rawInput.includes('image') || rawInput.includes('gallery')) strategy = 'visual';
    if (rawInput.includes('text') || rawInput.includes('blog') || rawInput.includes('article')) strategy = 'text';
    if (rawInput.includes('data') || rawInput.includes('chart') || rawInput.includes('table')) strategy = 'data';

    rawInput = rawInput.replace(/visual|text|data/, '').trim();

    // Extract options: Gap
    let gap = '1rem';
    const gapMatch = rawInput.match(/gap\s+(\S+)/);
    if (gapMatch) {
        gap = gapMatch[1];
        if (!gap.endsWith('px') && !gap.endsWith('rem') && !gap.endsWith('%')) {
            if (gap === 'small') gap = '0.5rem';
            else if (gap === 'medium') gap = '1rem';
            else if (gap === 'large') gap = '2rem';
            else gap = '1rem';
        }
        rawInput = rawInput.replace(gapMatch[0], '').trim();
    }

    // Extract options: Mobile
    let includeMobile = false;
    if (rawInput.includes('mobile') || rawInput.includes('responsive')) {
        includeMobile = true;
        rawInput = rawInput.replace('mobile', '').replace('responsive', '').trim();
    }

    // Cleanup extra spaces
    rawInput = rawInput.replace(/\s+/g, ' ').trim();

    const override = { gap, rowGap: gap, colGap: gap, includeMobile };

    // 0. Check for keywords
    if (['dashboard', 'admin'].includes(rawInput)) return { ...generateSmartLayout('dashboard', strategy), ...override };
    if (['blog', 'article'].includes(rawInput)) return { ...generateSmartLayout('blog', strategy), ...override };
    if (['holy grail', 'holygrail'].includes(rawInput)) return { ...generateSmartLayout('holy-grail', strategy), ...override };
    if (['gallery', 'portfolio'].includes(rawInput)) return { ...generateSmartLayout('gallery', strategy), ...override };
    if (['kanban', 'board'].includes(rawInput)) return { ...generateSmartLayout('kanban', strategy), ...override };
    if (['video', 'player', 'youtube'].includes(rawInput)) return { ...generateSmartLayout('video', strategy), ...override };
    if (['feed', 'social', 'timeline'].includes(rawInput)) return { ...generateSmartLayout('feed', strategy), ...override };

    // 1. Check for "grid RxC" pattern (e.g. "grid 4x4" or "grid 3")
    const gridMatch = rawInput.match(/^grid\s+(\d+)(?:x(\d+))?$/);
    if (gridMatch) {
        const rowsCount = parseInt(gridMatch[1]);
        const colsCount = parseInt(gridMatch[2] || gridMatch[1]); // Default to square if xN is missing

        const areas: GridArea[] = [];
        for (let r = 0; r < rowsCount; r++) {
            for (let c = 0; c < colsCount; c++) {
                areas.push({
                    id: nanoid(),
                    name: `cell-${r * colsCount + c + 1}`,
                    rowStart: r + 1,
                    rowEnd: r + 2,
                    colStart: c + 1,
                    colEnd: c + 2,
                    color: getRandomColor(),
                    tag: 'div'
                });
            }
        }

        return {
            rows: Array(rowsCount).fill('1fr'),
            cols: Array(colsCount).fill('1fr'),
            ...override,
            areas,
            items: [],
            justifyItems: 'stretch',
            alignItems: 'stretch',
            justifyContent: 'stretch',
            alignContent: 'stretch'
        };
    }

    // 2. Check for "gallery N" pattern (e.g. "gallery 6")
    const galleryMatch = rawInput.match(/^gallery\s+(\d+)$/);
    if (galleryMatch) {
        const count = parseInt(galleryMatch[1]);
        // Auto-calculate columns based on count (approx square root)
        const colsCount = Math.ceil(Math.sqrt(count));
        const rowsCount = Math.ceil(count / colsCount);

        const areas: GridArea[] = [];
        for (let i = 0; i < count; i++) {
            const r = Math.floor(i / colsCount);
            const c = i % colsCount;
            areas.push({
                id: nanoid(),
                name: `img-${i + 1}`,
                rowStart: r + 1,
                rowEnd: r + 2,
                colStart: c + 1,
                colEnd: c + 2,
                color: 'sky',
                contentType: 'image',
                tag: 'div'
            });
        }

        return {
            rows: Array(rowsCount).fill('1fr'),
            cols: Array(colsCount).fill('1fr'),
            ...override,
            areas,
            items: [],
            justifyItems: 'stretch',
            alignItems: 'stretch',
            justifyContent: 'stretch',
            alignContent: 'stretch'
        };
    }

    // 4. Default Smart Parsing
    const rawTokens = rawInput.split(/[\s,]+/).filter(Boolean);
    const definitions: { name: string; size?: string }[] = [];

    for (let i = 0; i < rawTokens.length; i++) {
        const t = rawTokens[i];

        // No need to skip keywords here as they are already removed from rawInput

        const next = rawTokens[i+1];
        if (parseSize(t)) continue;

        const size = next ? parseSize(next) : undefined;
        definitions.push({ name: t, size: size || undefined });
        if (size) i++;
    }

    if (definitions.length === 0) return generateMagicLayout();

    const header = definitions.find(d => ['header', 'top', 'nav'].some(k => d.name.includes(k)));
    const footer = definitions.find(d => ['footer', 'bottom'].some(k => d.name.includes(k)));
    const sidebar = definitions.find(d => ['sidebar', 'aside', 'left', 'menu'].some(k => d.name.includes(k)));
    const rightbar = definitions.find(d => ['rightbar', 'ads', 'extra', 'right'].some(k => d.name.includes(k)));

    const usedNames = [header, footer, sidebar, rightbar].filter(Boolean).map(d => d!.name);
    // Find all "mains" or unspecified areas
    const contentAreas = definitions.filter(d => !usedNames.includes(d.name));

    // Default to at least one main if nothing left
    if (contentAreas.length === 0 && !header && !footer && !sidebar && !rightbar) {
        contentAreas.push({ name: 'main' });
    }

    const rows: string[] = [];
    if (header) rows.push(header.size || 'auto');
    rows.push('1fr');
    if (footer) rows.push(footer.size || 'auto');

    const cols: string[] = [];
    if (sidebar) cols.push(sidebar.size || '250px');

    // Distribute content areas
    if (contentAreas.length > 0) {
        contentAreas.forEach(c => cols.push(c.size || '1fr'));
    } else {
        cols.push('1fr'); // Default main
    }

    if (rightbar) cols.push(rightbar.size || '250px');

    const areas: GridArea[] = [];
    let currentRow = 1;
    const totalCols = cols.length;

    if (header) {
        areas.push({
            id: nanoid(),
            name: header.name,
            rowStart: currentRow,
            rowEnd: currentRow + 1,
            colStart: 1,
            colEnd: totalCols + 1,
            color: 'indigo',
            tag: 'header'
        });
        currentRow++;
    }

    const middleRowStart = currentRow;
    const middleRowEnd = currentRow + 1;
    let currentCol = 1;

    if (sidebar) {
        areas.push({
            id: nanoid(),
            name: sidebar.name,
            rowStart: middleRowStart,
            rowEnd: middleRowEnd,
            colStart: currentCol,
            colEnd: currentCol + 1,
            color: 'emerald',
            tag: 'aside'
        });
        currentCol++;
    }

    // Add content areas
    if (contentAreas.length > 0) {
        contentAreas.forEach((c, idx) => {
             areas.push({
                id: nanoid(),
                name: c.name,
                rowStart: middleRowStart,
                rowEnd: middleRowEnd,
                colStart: currentCol,
                colEnd: currentCol + 1,
                color: idx % 2 === 0 ? 'slate' : 'white',
                tag: 'main'
            });
            currentCol++;
        });
    } else {
         areas.push({
            id: nanoid(),
            name: 'main',
            rowStart: middleRowStart,
            rowEnd: middleRowEnd,
            colStart: currentCol,
            colEnd: currentCol + 1,
            color: 'slate',
            tag: 'main'
        });
        currentCol++;
    }


    if (rightbar) {
        areas.push({
            id: nanoid(),
            name: rightbar.name,
            rowStart: middleRowStart,
            rowEnd: middleRowEnd,
            colStart: currentCol,
            colEnd: currentCol + 1,
            color: 'amber',
            tag: 'aside'
        });
        currentCol++;
    }

    currentRow++;

    if (footer) {
        areas.push({
            id: nanoid(),
            name: footer.name,
            rowStart: currentRow,
            rowEnd: currentRow + 1,
            colStart: 1,
            colEnd: totalCols + 1,
            color: 'rose',
            tag: 'footer'
        });
    }

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
        includeMobile
    };
}
