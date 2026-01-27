import type { GridState } from './types';

export function generateCSS(state: GridState, containerId = 'container'): string {
  const { rows, cols, gap, rowGap, colGap, areas } = state;
  const gridTemplateRows = rows.join(' ');
  const gridTemplateColumns = cols.join(' ');

  // Construct grid-template-areas
  const rowCount = rows.length;
  const colCount = cols.length;
  const gridMap: string[][] = Array(rowCount).fill(null).map(() => Array(colCount).fill('.'));

  areas.forEach(area => {
    // Grid lines are 1-based
    for (let r = area.rowStart - 1; r < area.rowEnd - 1; r++) {
      for (let c = area.colStart - 1; c < area.colEnd - 1; c++) {
        if (r >= 0 && r < rowCount && c >= 0 && c < colCount) {
          gridMap[r][c] = area.name;
        }
      }
    }
  });

  const templateAreas = gridMap.map(row => `    "${row.join(' ')}"`).join('\n');
  const hasDistinctGap = rowGap !== gap || colGap !== gap;

  let css = `.${containerId} {
  display: grid;
  grid-template-columns: ${gridTemplateColumns};
  grid-template-rows: ${gridTemplateRows};
  ${!hasDistinctGap ? `gap: ${gap};` : `row-gap: ${rowGap};\n  column-gap: ${colGap};`}
  justify-items: ${state.justifyItems};
  align-items: ${state.alignItems};
  justify-content: ${state.justifyContent};
  align-content: ${state.alignContent};
  grid-template-areas:
${templateAreas};
}
`;

  areas.forEach(area => {
    css += `\n.${area.name} {\n  grid-area: ${area.name};\n}`;
  });

  return css;
}

export function generateMobileQuery(state: GridState, containerClass = 'container'): string {
    const { areas } = state;
    const sorted = [...areas].sort((a, b) => {
        if (a.rowStart !== b.rowStart) return a.rowStart - b.rowStart;
        return a.colStart - b.colStart;
    });

    const areasString = sorted.map(a => `    "${a.name}"`).join('\n');

    return `
@media (max-width: 768px) {
  .${containerClass} {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
${areasString};
  }
}`;
}

export function generateTailwind(state: GridState, includeMobile = false): string {
    const { rows, cols, gap, rowGap, colGap, areas } = state;

    const safeJoin = (arr: string[]) => arr.join('_');
    const prefix = includeMobile ? 'md:' : '';

    const colClass = `${prefix}grid-cols-[${safeJoin(cols)}]`;
    const rowClass = `${prefix}grid-rows-[${safeJoin(rows)}]`;

    let gapClass = `gap-[${gap}]`;
    if (rowGap !== gap || colGap !== gap) {
        gapClass = `gap-y-[${rowGap}] gap-x-[${colGap}]`;
    }

    // Alignment classes
    const justifyItemsMap = {
        start: 'justify-items-start', end: 'justify-items-end', center: 'justify-items-center', stretch: 'justify-items-stretch'
    };
    const alignItemsMap = {
        start: 'items-start', end: 'items-end', center: 'items-center', stretch: 'items-stretch'
    };
    const justifyContentMap = {
        start: 'justify-start', end: 'justify-end', center: 'justify-center', stretch: 'justify-stretch',
        'space-around': 'justify-around', 'space-between': 'justify-between', 'space-evenly': 'justify-evenly'
    };
    const alignContentMap = {
        start: 'content-start', end: 'content-end', center: 'content-center', stretch: 'content-stretch',
        'space-around': 'content-around', 'space-between': 'content-between', 'space-evenly': 'content-evenly'
    };

    const alignClasses = [
        justifyItemsMap[state.justifyItems],
        alignItemsMap[state.alignItems],
        justifyContentMap[state.justifyContent],
        alignContentMap[state.alignContent]
    ].filter(Boolean).join(' ');

    const mobileBase = includeMobile ? 'grid-cols-1' : '';
    let html = `<div class="grid ${mobileBase} ${colClass} ${rowClass} ${gapClass} ${alignClasses} h-full w-full">\n`;

    areas.forEach(area => {
        const rowSpan = area.rowEnd - area.rowStart;
        const colSpan = area.colEnd - area.colStart;

        let classes = `${prefix}row-start-${area.rowStart}`;
        if (rowSpan > 1) classes += ` ${prefix}row-span-${rowSpan}`;
        else classes += ` ${prefix}row-span-1`;

        classes += ` ${prefix}col-start-${area.colStart}`;
        if (colSpan > 1) classes += ` ${prefix}col-span-${colSpan}`;
        else classes += ` ${prefix}col-span-1`;

        // Add a color class if it exists (assuming it's a tailwind color name)
        // If it's a hex, we use bg-[hex]
        const colorClass = area.color.startsWith('#') ? `bg-[${area.color}]` : `bg-${area.color}-500`;
        const tag = area.tag || 'div';

        html += `  <${tag} class="${classes} ${colorClass} p-4 rounded">\n    ${area.name}\n  </${tag}>\n`;
    });

    html += `</div>`;

    return html;
}

export function generateHTML(state: GridState): string {
    const css = generateCSS(state, 'grid-container');
    const { areas } = state;

    // Generate some basic styles for visualization
    const visualStyles = areas.map(a =>
        `.${a.name} { background-color: ${a.color.startsWith('#') ? a.color : 'var(--' + a.color + ')'}; padding: 1rem; border-radius: 0.25rem; }`
    ).join('\n    ');

    // Add CSS var mocks for tailwind colors if they are names
    const colorVars = `
    :root {
        --red: #f87171; --orange: #fb923c; --amber: #fbbf24; --yellow: #facc15;
        --lime: #a3e635; --green: #4ade80; --emerald: #34d399; --teal: #2dd4bf;
        --sky: #38bdf8; --blue: #60a5fa; --indigo: #818cf8; --violet: #a78bfa;
        --purple: #c084fc; --fuchsia: #e879f9; --pink: #f472b6; --rose: #fb7185;
        --slate: #94a3b8; --zinc: #a1a1aa;
    }`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grid Master Layout</title>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; padding: 2rem; background: #f8fafc; }
    ${colorVars}
    .grid-container {
      min-height: 80vh;
      background: white;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      border-radius: 0.5rem;
      padding: 1rem;
    }
    ${css}
    /* Visualization Styles */
    ${visualStyles}
  </style>
</head>
<body>
  <div class="grid-container">
    ${areas.map(a => `<${a.tag || 'div'} class="${a.name}">${a.name}</${a.tag || 'div'}>`).join('\n    ')}
  </div>
</body>
</html>`;
}
