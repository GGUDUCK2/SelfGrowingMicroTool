import type { GridState } from './types';

export interface Diagnosis {
    score: number;
    issues: Issue[];
}

export interface Issue {
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    details?: string;
}

export function analyzeGrid(state: GridState): Diagnosis {
    const issues: Issue[] = [];
    let score = 100;

    // 1. Check for Invalid/OOB Areas
    state.areas.forEach(area => {
        if (area.rowEnd <= area.rowStart || area.colEnd <= area.colStart) {
            issues.push({
                id: `invalid-area-${area.id}`,
                type: 'error',
                message: `Area "${area.name}" has invalid dimensions.`,
                details: 'Start line must be before end line.'
            });
            score -= 20;
        }

        // Check bounds
        if (area.rowEnd > state.rows.length + 1 || area.colEnd > state.cols.length + 1) {
             issues.push({
                id: `oob-area-${area.id}`,
                type: 'error',
                message: `Area "${area.name}" is out of bounds.`,
                details: 'It extends beyond the defined grid tracks.'
            });
            score -= 20;
        }
    });

    // 2. Check for Overlaps
    for (let i = 0; i < state.areas.length; i++) {
        for (let j = i + 1; j < state.areas.length; j++) {
            const a = state.areas[i];
            const b = state.areas[j];

            const rowOverlap = Math.max(a.rowStart, b.rowStart) < Math.min(a.rowEnd, b.rowEnd);
            const colOverlap = Math.max(a.colStart, b.colStart) < Math.min(a.colEnd, b.colEnd);

            if (rowOverlap && colOverlap) {
                 issues.push({
                    id: `overlap-${a.id}-${b.id}`,
                    type: 'warning',
                    message: `Overlap detected between "${a.name}" and "${b.name}".`,
                    details: 'While CSS Grid allows overlaps, ensure you handle z-index if intentional.'
                });
                score -= 10;
            }
        }
    }

    // 3. Track Sizing Check
    // Suggest 'fr' over 'px' for main content columns if not fixed layout
    const hasFr = state.cols.some(c => c.includes('fr'));
    if (!hasFr && state.cols.length > 1) {
         issues.push({
            id: `no-fr`,
            type: 'info',
            message: `Consider using fractional units (fr).`,
            details: 'Fixed pixel widths might break on smaller screens unless you use media queries.'
        });
        score -= 5;
    }

    // 4. Complexity Check
    if (state.rows.length > 12 || state.cols.length > 12) {
         issues.push({
            id: `complexity`,
            type: 'warning',
            message: `High grid complexity detected.`,
            details: 'Having more than 12 tracks can make the grid hard to manage.'
        });
        score -= 5;
    }

    // 5. Mobile Check
    if (state.includeMobile && state.mobileStrategy === 'hide-sidebar') {
        const sidebars = state.areas.filter(a => a.tag === 'aside' || a.name.includes('sidebar'));
        if (sidebars.length === 0) {
             issues.push({
                id: `mobile-hide`,
                type: 'info',
                message: `Mobile strategy is 'Hide Sidebar' but no sidebars found.`,
                details: 'Ensure you have areas with tag <aside> or name "sidebar".'
            });
        }
    }

    // 6. Semantic Check
    const tags = state.areas.map(a => a.tag || 'div');
    if (!tags.includes('main')) {
         issues.push({
            id: `no-main`,
            type: 'warning',
            message: `Missing <main> tag.`,
            details: 'For accessibility, every page should have one main content area.'
        });
        score -= 10;
    }

    return {
        score: Math.max(0, score),
        issues
    };
}
