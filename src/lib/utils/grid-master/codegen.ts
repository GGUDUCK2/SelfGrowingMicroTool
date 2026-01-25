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
  grid-template-areas:
${templateAreas};
}
`;

  areas.forEach(area => {
    css += `\n.${area.name} {\n  grid-area: ${area.name};\n}`;
  });

  return css;
}

export function generateTailwind(state: GridState): string {
    const { rows, cols, gap, rowGap, colGap, areas } = state;

    const safeJoin = (arr: string[]) => arr.join('_');

    const colClass = `grid-cols-[${safeJoin(cols)}]`;
    const rowClass = `grid-rows-[${safeJoin(rows)}]`;

    let gapClass = `gap-[${gap}]`;
    if (rowGap !== gap || colGap !== gap) {
        gapClass = `gap-y-[${rowGap}] gap-x-[${colGap}]`;
    }

    let html = `<div class="grid ${colClass} ${rowClass} ${gapClass} h-full w-full">\n`;

    areas.forEach(area => {
        const rowSpan = area.rowEnd - area.rowStart;
        const colSpan = area.colEnd - area.colStart;

        let classes = `row-start-${area.rowStart}`;
        if (rowSpan > 1) classes += ` row-span-${rowSpan}`;
        else classes += ` row-span-1`;

        classes += ` col-start-${area.colStart}`;
        if (colSpan > 1) classes += ` col-span-${colSpan}`;
        else classes += ` col-span-1`;

        // Add a color class if it exists (assuming it's a tailwind color name)
        // If it's a hex, we use bg-[hex]
        const colorClass = area.color.startsWith('#') ? `bg-[${area.color}]` : `bg-${area.color}-500`;

        html += `  <div class="${classes} ${colorClass} p-4 rounded">\n    ${area.name}\n  </div>\n`;
    });

    html += `</div>`;

    return html;
}
