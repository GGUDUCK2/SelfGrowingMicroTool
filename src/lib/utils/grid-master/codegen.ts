import type { GridState, GridArea } from './types';

// Helper to generate Tailwind classes for the grid container
function getContainerClasses(state: GridState): string {
    const { rows, cols, gap, rowGap, colGap, justifyItems, alignItems, justifyContent, alignContent, includeMobile } = state;
    const safeJoin = (arr: string[]) => arr.join('_');
    const prefix = includeMobile ? 'md:' : '';

    const colClass = `${prefix}grid-cols-[${safeJoin(cols)}]`;
    const rowClass = `${prefix}grid-rows-[${safeJoin(rows)}]`;

    let gapClass = `gap-[${gap}]`;
    if (rowGap !== gap || colGap !== gap) {
        gapClass = `gap-y-[${rowGap}] gap-x-[${colGap}]`;
    }

    const justifyItemsMap = { start: 'justify-items-start', end: 'justify-items-end', center: 'justify-items-center', stretch: 'justify-items-stretch' };
    const alignItemsMap = { start: 'items-start', end: 'items-end', center: 'items-center', stretch: 'items-stretch' };
    const justifyContentMap = { start: 'justify-start', end: 'justify-end', center: 'justify-center', stretch: 'justify-stretch', 'space-around': 'justify-around', 'space-between': 'justify-between', 'space-evenly': 'justify-evenly' };
    const alignContentMap = { start: 'content-start', end: 'content-end', center: 'content-center', stretch: 'content-stretch', 'space-around': 'content-around', 'space-between': 'content-between', 'space-evenly': 'content-evenly' };

    const alignClasses = [
        justifyItemsMap[justifyItems],
        alignItemsMap[alignItems],
        justifyContentMap[justifyContent],
        alignContentMap[alignContent]
    ].filter(Boolean).join(' ');

    const mobileBase = includeMobile ? 'grid-cols-1' : '';

    return `grid ${mobileBase} ${colClass} ${rowClass} ${gapClass} ${alignClasses} h-full w-full`;
}

// Helper to generate Tailwind classes for an item
function getItemClasses(area: GridArea, includeMobile: boolean): string {
    const prefix = includeMobile ? 'md:' : '';
    const rowSpan = area.rowEnd - area.rowStart;
    const colSpan = area.colEnd - area.colStart;

    let classes = `${prefix}row-start-${area.rowStart}`;
    if (rowSpan > 1) classes += ` ${prefix}row-span-${rowSpan}`;
    else classes += ` ${prefix}row-span-1`;

    classes += ` ${prefix}col-start-${area.colStart}`;
    if (colSpan > 1) classes += ` ${prefix}col-span-${colSpan}`;
    else classes += ` ${prefix}col-span-1`;

    const colorClass = area.color.startsWith('#') ? `bg-[${area.color}]` : `bg-${area.color}-500`;

    return `${classes} ${colorClass} p-4 rounded`;
}

export function generateCSS(state: GridState, containerId = 'container'): string {
  const { rows, cols, gap, rowGap, colGap, areas, includeMobile } = state;
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

  if (includeMobile) {
      css += generateMobileQuery(state, containerId);
  }

  return css;
}

export function generateMobileQuery(state: GridState, containerClass = 'container'): string {
    const { areas } = state;
    // Sort by mobileOrder if available, otherwise fallback to row/col
    const sorted = [...areas].sort((a, b) => {
        if (a.mobileOrder !== undefined && b.mobileOrder !== undefined) {
             return a.mobileOrder - b.mobileOrder;
        }
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

function getMockContent(area: GridArea): string {
    const type = area.contentType;
    if (!type || type === 'none') return area.name;

    const style = 'width:100%;height:100%;';

    if (type === 'chart') return `<div style="${style}display:flex;align-items:end;gap:4px;opacity:0.6"><div style="height:30%;flex:1;background:currentColor"></div><div style="height:60%;flex:1;background:currentColor"></div><div style="height:45%;flex:1;background:currentColor"></div><div style="height:80%;flex:1;background:currentColor"></div></div>`;

    if (type === 'form') return `<div style="${style}display:flex;flex-direction:column;gap:8px"><div style="height:32px;border:1px solid currentColor;opacity:0.3;border-radius:4px"></div><div style="height:32px;border:1px solid currentColor;opacity:0.3;border-radius:4px"></div><div style="height:32px;background:currentColor;opacity:0.5;border-radius:4px;width:50%"></div></div>`;

    if (type === 'video') return `<div style="${style}display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.1);border-radius:4px">▶</div>`;

    if (type === 'image') return `<div style="${style}display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.05);border-radius:4px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;

    if (type === 'hero') return `<div style="${style}display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center"><h1 style="margin:0;font-size:2em">Hero</h1><p style="opacity:0.7">Subtitle</p><button style="margin-top:10px;padding:5px 15px;background:currentColor;color:white;border:none;border-radius:4px">Action</button></div>`;

    if (type === 'table') return `<div style="${style}display:flex;flex-direction:column;gap:4px"><div style="height:20px;background:currentColor;opacity:0.2"></div><div style="height:20px;background:currentColor;opacity:0.1"></div><div style="height:20px;background:currentColor;opacity:0.1"></div></div>`;

    if (type === 'login') return `<div style="${style}display:flex;flex-direction:column;gap:8px;max-width:200px;margin:auto;justify-content:center"><div style="text-align:center;font-weight:bold">Login</div><div style="height:30px;border:1px solid currentColor;opacity:0.3;border-radius:4px"></div><div style="height:30px;border:1px solid currentColor;opacity:0.3;border-radius:4px"></div><div style="height:30px;background:currentColor;opacity:0.8;border-radius:4px;color:white;display:flex;align-items:center;justify-content:center">Sign In</div></div>`;

    return area.name;
}

export function generateTailwind(state: GridState): string {
    const containerClass = getContainerClasses(state);
    let html = `<div class="${containerClass}">\n`;

    state.areas.forEach(area => {
        const itemClass = getItemClasses(area, state.includeMobile);
        const tag = area.tag || 'div';
        html += `  <${tag} class="${itemClass}">\n    ${area.name}\n  </${tag}>\n`;
    });

    html += `</div>`;
    return html;
}

export function generateReact(state: GridState): string {
    const containerClass = getContainerClasses(state);
    let jsx = `export default function GridLayout() {\n  return (\n    <div className="${containerClass}">\n`;

    state.areas.forEach(area => {
        const itemClass = getItemClasses(area, state.includeMobile);
        const tag = area.tag || 'div';
        // Capitalize for React logic? No, standard HTML tags are lowercase in React.
        jsx += `      <${tag} className="${itemClass}">\n        ${area.name}\n      </${tag}>\n`;
    });

    jsx += `    </div>\n  );\n}`;
    return jsx;
}

export function generateVue(state: GridState): string {
    const containerClass = getContainerClasses(state);
    let template = `<template>\n  <div class="${containerClass}">\n`;

    state.areas.forEach(area => {
        const itemClass = getItemClasses(area, state.includeMobile);
        const tag = area.tag || 'div';
        template += `    <${tag} class="${itemClass}">\n      ${area.name}\n    </${tag}>\n`;
    });

    template += `  </div>\n</template>\n\n<script setup>\n// Vue 3 Composition API\n</script>`;
    return template;
}

export function generateSvelte(state: GridState): string {
    const containerClass = getContainerClasses(state);
    let markup = `<div class="${containerClass}">\n`;

    state.areas.forEach(area => {
        const itemClass = getItemClasses(area, state.includeMobile);
        const tag = area.tag || 'div';
        markup += `  <${tag} class="${itemClass}">\n    ${area.name}\n  </${tag}>\n`;
    });

    markup += `</div>`;
    return markup;
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
    ${areas.map(a => `<${a.tag || 'div'} class="${a.name}">${getMockContent(a)}</${a.tag || 'div'}>`).join('\n    ')}
  </div>
</body>
</html>`;
}
